import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

import { CampaignService } from './campaign.service';
import type {
  CreateCampaignRequest,
  GetCampaignsRequest,
} from './campaign.types';

@Controller()
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @GrpcMethod('CampaignService', 'CreateCampaign')
  async createCampaign(request: CreateCampaignRequest) {
    this.assertCreateRequest(request);

    const campaign = await this.campaignService.createCampaign(request);
    return { campaign: this.serializeCampaign(campaign) };
  }

  @GrpcMethod('CampaignService', 'GetCampaigns')
  async getCampaigns(request: GetCampaignsRequest) {
    if (!request.userId) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'userId is required',
      });
    }

    const campaigns = await this.campaignService.getCampaigns(request);
    return {
      campaigns: campaigns.map((campaign) =>
        this.serializeCampaign(campaign),
      ),
    };
  }

  private assertCreateRequest(request: CreateCampaignRequest): void {
    const scheduledAt = request.scheduledAt
      ? new Date(request.scheduledAt)
      : null;

    if (
      !request.userId ||
      !request.name?.trim() ||
      !request.recipients?.length ||
      request.recipients.some(
        ({ email, subject, message }) =>
          !email?.trim() || !subject?.trim() || !message?.trim(),
      ) ||
      (scheduledAt !== null && Number.isNaN(scheduledAt.getTime()))
    ) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Invalid campaign request',
      });
    }
  }

  private serializeCampaign(campaign: {
    id: string;
    userId: string;
    name: string;
    scheduledAt: Date | null;
    status: string;
    createdAt: Date;
    recipients: Array<{
      id: string;
      campaignId: string;
      email: string;
      subject: string;
      message: string;
      status: string;
      sentAt: Date | null;
      createdAt: Date;
    }>;
  }) {
    return {
      id: campaign.id,
      userId: campaign.userId,
      name: campaign.name,
      scheduledAt: campaign.scheduledAt?.toISOString() ?? '',
      status: campaign.status,
      createdAt: campaign.createdAt.toISOString(),
      recipients: campaign.recipients.map((recipient) => ({
        id: recipient.id,
        campaignId: recipient.campaignId,
        email: recipient.email,
        subject: recipient.subject,
        message: recipient.message,
        status: recipient.status,
        sentAt: recipient.sentAt?.toISOString() ?? '',
        createdAt: recipient.createdAt.toISOString(),
      })),
    };
  }
}
