import { PrismaService } from '@org/database';

import { CampaignService } from './campaign.service';

describe('CampaignService', () => {
  it('creates a campaign and its recipients in one nested write', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'campaign-1' });
    const prisma = { campaign: { create } } as unknown as PrismaService;
    const service = new CampaignService(prisma);

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
  });

  it('filters campaign reads by the trusted user id', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = { campaign: { findMany } } as unknown as PrismaService;
    const service = new CampaignService(prisma);

    await service.getCampaigns({ userId: 'trusted-user' });

    expect(findMany).toHaveBeenCalledWith({
      where: { userId: 'trusted-user' },
      include: { recipients: true },
      orderBy: { createdAt: 'desc' },
    });
  });
});
