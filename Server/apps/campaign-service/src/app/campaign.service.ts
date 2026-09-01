import { Injectable } from '@nestjs/common';
import { PrismaService } from '@org/database';

import type {
  CreateCampaignRequest,
  GetCampaignsRequest,
} from './campaign.types';

@Injectable()
export class CampaignService {
  constructor(private readonly prisma: PrismaService) {}

  createCampaign(request: CreateCampaignRequest) {
    return this.prisma.campaign.create({
      data: {
        userId: request.userId,
        name: request.name,
        scheduledAt: request.scheduledAt
          ? new Date(request.scheduledAt)
          : null,
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
  }

  getCampaigns(request: GetCampaignsRequest) {
    return this.prisma.campaign.findMany({
      where: { userId: request.userId },
      include: { recipients: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
