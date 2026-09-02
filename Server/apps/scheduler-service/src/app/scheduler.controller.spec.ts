import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';

describe('SchedulerController', () => {
  it('delegates a valid campaign event', async () => {
    const scheduleCampaign = jest.fn().mockResolvedValue(undefined);
    const service = { scheduleCampaign } as unknown as SchedulerService;
    const controller = new SchedulerController(service);
    const event = {
      campaignId: 'campaign-1',
      userId: 'user-1',
      scheduledAt: '2026-09-03T10:30:00.000Z',
    };

    await controller.handleCampaignScheduled(event);

    expect(scheduleCampaign).toHaveBeenCalledWith(event);
  });

  it.each([
    null,
    {},
    { campaignId: '', userId: 'user-1', scheduledAt: '2026-09-03T10:30:00Z' },
    {
      campaignId: 'campaign-1',
      userId: '',
      scheduledAt: '2026-09-03T10:30:00Z',
    },
    { campaignId: 'campaign-1', userId: 'user-1', scheduledAt: 'invalid' },
  ])('ignores malformed events without throwing', async (payload) => {
    const scheduleCampaign = jest.fn();
    const service = { scheduleCampaign } as unknown as SchedulerService;
    const controller = new SchedulerController(service);

    await expect(
      controller.handleCampaignScheduled(payload),
    ).resolves.toBeUndefined();
    expect(scheduleCampaign).not.toHaveBeenCalled();
  });
});
