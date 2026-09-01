import { Observable } from 'rxjs';

export interface CampaignRecipientInput {
  email: string;
  subject: string;
  message: string;
}

export interface CreateCampaignGrpcRequest {
  userId: string;
  name: string;
  scheduledAt: string;
  recipients: CampaignRecipientInput[];
}

export interface GetCampaignsGrpcRequest {
  userId: string;
}

export interface CampaignRecipient {
  id: string;
  campaignId: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  sentAt: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  scheduledAt: string;
  status: string;
  createdAt: string;
  recipients: CampaignRecipient[];
}

export interface CampaignGrpcService {
  createCampaign(
    request: CreateCampaignGrpcRequest,
  ): Observable<{ campaign: Campaign }>;
  getCampaigns(
    request: GetCampaignsGrpcRequest,
  ): Observable<{ campaigns: Campaign[] }>;
}
