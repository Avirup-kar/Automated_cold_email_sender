import { PrismaService } from '@org/database';

import { CampaignService } from './campaign.service';
import { CampaignEventPublisher } from './events/campaign-event.publisher';

describe('CampaignService', () => {
  it('creates a campaign and its recipients in one nested write', async () => {
    const create = jest.fn().mockResolvedValue({
      id: 'campaign-1',
      userId: 'trusted-user',
      scheduledAt: new Date('2026-09-03T10:30:00.000Z'),
    });
    const prisma = { campaign: { create } } as unknown as PrismaService;
    const publishCampaignScheduled = jest.fn().mockResolvedValue(undefined);
    const publisher = {
      publishCampaignScheduled,
    } as unknown as CampaignEventPublisher;
    const service = new CampaignService(prisma, publisher);

    await service.createCampaign({
      userId: 'trusted-user',
      name: 'September Outreach',
      scheduledAt: '2026-09-03T10:30:00.000Z',
      recipients: [
        {
          email: 'john@company.com',
          subject: 'Internship',
          message: 'Hello John',
        },
      ],
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        userId: 'trusted-user',
        name: 'September Outreach',
        scheduledAt: new Date('2026-09-03T10:30:00.000Z'),
        status: 'SCHEDULED',
        recipients: {
          create: [
            {
              email: 'john@company.com',
              subject: 'Internship',
              message: 'Hello John',
            },
          ],
        },
      },
      include: { recipients: true },
    });
    expect(publishCampaignScheduled).toHaveBeenCalledWith({
      campaignId: 'campaign-1',
      userId: 'trusted-user',
      scheduledAt: '2026-09-03T10:30:00.000Z',
    });
  });

  it('does not publish when the database create fails', async () => {
    const create = jest.fn().mockRejectedValue(new Error('database failed'));
    const prisma = { campaign: { create } } as unknown as PrismaService;
    const publishCampaignScheduled = jest.fn();
    const publisher = {
      publishCampaignScheduled,
    } as unknown as CampaignEventPublisher;
    const service = new CampaignService(prisma, publisher);

    await expect(
      service.createCampaign({
        userId: 'trusted-user',
        name: 'Campaign',
        scheduledAt: '2026-09-03T10:30:00.000Z',
        recipients: [
          { email: 'one@example.com', subject: 'Subject', message: 'Message' },
        ],
      }),
    ).rejects.toThrow('database failed');
    expect(publishCampaignScheduled).not.toHaveBeenCalled();
  });

  it('filters campaign reads by the trusted user id', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = { campaign: { findMany } } as unknown as PrismaService;
    const publisher = {} as CampaignEventPublisher;
    const service = new CampaignService(prisma, publisher);

    await service.getCampaigns({ userId: 'trusted-user' });

    expect(findMany).toHaveBeenCalledWith({
      where: { userId: 'trusted-user' },
      include: { recipients: true },
      orderBy: { createdAt: 'desc' },
    });
  });
});
