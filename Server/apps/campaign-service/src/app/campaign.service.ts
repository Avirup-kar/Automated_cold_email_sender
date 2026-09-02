import { Injectable } from '@nestjs/common';
import { PrismaService } from '@org/database';

import type {
  CreateCampaignRequest,
  GetCampaignsRequest,
} from './campaign.types';
import { CampaignEventPublisher } from './events/campaign-event.publisher';

@Injectable()
export class CampaignService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly campaignEventPublisher: CampaignEventPublisher,
  ) {}

  async createCampaign(request: CreateCampaignRequest) {
    const campaign = await this.prisma.campaign.create({
      data: {
        userId: request.userId,
        name: request.name,
        scheduledAt: request.scheduledAt ? new Date(request.scheduledAt) : null,
        status: 'SCHEDULED',
        recipients: {
          create: request.recipients.map((recipient) => ({
            email: recipient.email,
            subject: recipient.subject,
            message: recipient.message,
          })),
        },
      },
      include: { recipients: true },
    });

    await this.campaignEventPublisher.publishCampaignScheduled({
      campaignId: campaign.id,
      userId: campaign.userId,
      scheduledAt: campaign.scheduledAt?.toISOString() ?? request.scheduledAt,
    });

    return campaign;
  }

  getCampaigns(request: GetCampaignsRequest) {
    return this.prisma.campaign.findMany({
      where: { userId: request.userId },
      include: { recipients: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
