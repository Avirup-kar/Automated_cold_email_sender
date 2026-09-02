export interface CampaignSchedulerJobData {
  campaignId: string;
  userId: string;
  scheduledAt: string;
}

export interface EmailSendJobData {
  campaignId: string;
  recipientId: string;
  userId: string;
  email: string;
  subject: string;
  message: string;
}
