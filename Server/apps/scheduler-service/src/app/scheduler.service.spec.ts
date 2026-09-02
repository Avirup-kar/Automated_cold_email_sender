import type { Queue } from 'bullmq';

import { PROCESS_CAMPAIGN_JOB } from './scheduler.constants';
import { SchedulerService } from './scheduler.service';
import type { CampaignSchedulerJobData } from './scheduler.types';

describe('SchedulerService', () => {
  afterEach(() => jest.useRealTimers());

  it('creates a deterministic delayed campaign job', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-03T10:28:00.000Z'));
    const add = jest.fn().mockResolvedValue({ id: 'campaign-campaign-1' });
    const queue = { add } as unknown as Queue<CampaignSchedulerJobData>;
    const service = new SchedulerService(queue);
    const event = {
      campaignId: 'campaign-1',
      userId: 'user-1',
      scheduledAt: '2026-09-03T10:30:00.000Z',
    };

    await service.scheduleCampaign(event);

    expect(add).toHaveBeenCalledWith(PROCESS_CAMPAIGN_JOB, event, {
      delay: 120_000,
      jobId: 'campaign-campaign-1',
    });
  });

  it('uses zero delay when the scheduled time is in the past', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-03T10:31:00.000Z'));
    const add = jest.fn().mockResolvedValue({ id: 'campaign-campaign-1' });
    const queue = { add } as unknown as Queue<CampaignSchedulerJobData>;
    const service = new SchedulerService(queue);

    await service.scheduleCampaign({
      campaignId: 'campaign-1',
      userId: 'user-1',
      scheduledAt: '2026-09-03T10:30:00.000Z',
    });

    expect(add).toHaveBeenCalledWith(
      PROCESS_CAMPAIGN_JOB,
      expect.any(Object),
      expect.objectContaining({ delay: 0 }),
    );
  });
});
