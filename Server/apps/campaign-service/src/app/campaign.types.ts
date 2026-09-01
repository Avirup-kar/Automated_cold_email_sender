export interface CampaignRecipientInput {
  email: string;
  subject: string;
  message: string;
}

export interface CreateCampaignRequest {
  userId: string;
  name: string;
  scheduledAt: string;
  recipients: CampaignRecipientInput[];
}

export interface GetCampaignsRequest {
  userId: string;
}
