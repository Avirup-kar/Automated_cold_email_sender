import { PrismaService } from '@org/database';
import type { Job, Queue } from 'bullmq';

import { SEND_EMAIL_JOB } from '../scheduler.constants';
import type {
  CampaignSchedulerJobData,
  EmailSendJobData,
} from '../scheduler.types';
import { CampaignSchedulerProcessor } from './campaign-scheduler.processor';

describe('CampaignSchedulerProcessor', () => {
  it('fetches only pending recipients and creates one job per recipient', async () => {
    const findUnique = jest.fn().mockResolvedValue({
      userId: 'user-1',
      status: 'SCHEDULED',
    });
    const findMany = jest.fn().mockResolvedValue([
      {
        id: 'recipient-1',
        email: 'one@example.com',
        subject: 'One',
        message: 'Hi',
      },
      {
        id: 'recipient-2',
        email: 'two@example.com',
        subject: 'Two',
        message: 'Hi',
      },
    ]);
    const prisma = {
      campaign: { findUnique },
      campaignRecipient: { findMany },
    } as unknown as PrismaService;
    const add = jest.fn().mockResolvedValue({});
    const queue = { add } as unknown as Queue<EmailSendJobData>;
    const processor = new CampaignSchedulerProcessor(prisma, queue);
    const job = {
      name: 'process-campaign',
      data: {
        campaignId: 'campaign-1',
        userId: 'user-1',
        scheduledAt: '2026-09-03T10:30:00.000Z',
      },
    } as Job<CampaignSchedulerJobData>;

    await processor.process(job);

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 'campaign-1' },
      select: { userId: true, status: true },
    });
    expect(findMany).toHaveBeenCalledWith({
      where: { campaignId: 'campaign-1', status: 'PENDING' },
      select: { id: true, email: true, subject: true, message: true },
    });
    expect(add).toHaveBeenCalledTimes(2);
    expect(add).toHaveBeenNthCalledWith(
      1,
      SEND_EMAIL_JOB,
      {
        campaignId: 'campaign-1',
        recipientId: 'recipient-1',
        userId: 'user-1',
        email: 'one@example.com',
        subject: 'One',
        message: 'Hi',
      },
      { jobId: 'campaign-campaign-1-recipient-recipient-1' },
    );
  });

  it('does not query recipients when the campaign user does not match', async () => {
    const findUnique = jest.fn().mockResolvedValue({
      userId: 'another-user',
      status: 'SCHEDULED',
    });
    const findMany = jest.fn();
    const prisma = {
      campaign: { findUnique },
      campaignRecipient: { findMany },
    } as unknown as PrismaService;
    const add = jest.fn();
    const processor = new CampaignSchedulerProcessor(prisma, {
      add,
    } as unknown as Queue<EmailSendJobData>);

    await processor.process({
      name: 'process-campaign',
      data: {
        campaignId: 'campaign-1',
        userId: 'user-1',
        scheduledAt: '2026-09-03T10:30:00.000Z',
      },
    } as Job<CampaignSchedulerJobData>);

    expect(findMany).not.toHaveBeenCalled();
    expect(add).not.toHaveBeenCalled();
  });
});
