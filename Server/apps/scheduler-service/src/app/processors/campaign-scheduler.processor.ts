import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@org/database';
import type { Job, Queue } from 'bullmq';

import {
  CAMPAIGN_SCHEDULER_QUEUE,
  EMAIL_SEND_QUEUE,
  PROCESS_CAMPAIGN_JOB,
  SEND_EMAIL_JOB,
} from '../scheduler.constants';
import type {
  CampaignSchedulerJobData,
  EmailSendJobData,
} from '../scheduler.types';

@Injectable()
@Processor(CAMPAIGN_SCHEDULER_QUEUE)
export class CampaignSchedulerProcessor extends WorkerHost {
  private readonly logger = new Logger(CampaignSchedulerProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(EMAIL_SEND_QUEUE)
    private readonly emailSendQueue: Queue<EmailSendJobData>,
  ) {
    super();
  }

  async process(job: Job<CampaignSchedulerJobData>): Promise<void> {
    if (job.name !== PROCESS_CAMPAIGN_JOB) {
      this.logger.warn(`Ignoring unknown campaign scheduler job ${job.name}`);
      return;
    }

    const { campaignId, userId } = job.data;
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { userId: true, status: true },
    });

    if (!campaign) {
      this.logger.error(`Campaign ${campaignId} was not found`);
      return;
    }

    if (campaign.userId !== userId) {
      this.logger.error(`Campaign ${campaignId} does not belong to ${userId}`);
      return;
    }

    if (campaign.status !== 'SCHEDULED') {
      this.logger.warn(
        `Campaign ${campaignId} has non-processable status ${campaign.status}`,
      );
      return;
    }

    const recipients = await this.prisma.campaignRecipient.findMany({
      where: { campaignId, status: 'PENDING' },
      select: {
        id: true,
        email: true,
        subject: true,
        message: true,
      },
    });

    if (recipients.length === 0) {
      this.logger.log(`Campaign ${campaignId} has no pending recipients`);
      return;
    }

    const failures: string[] = [];

    for (const recipient of recipients) {
      try {
        await this.emailSendQueue.add(
          SEND_EMAIL_JOB,
          {
            campaignId,
            recipientId: recipient.id,
            userId,
            email: recipient.email,
            subject: recipient.subject,
            message: recipient.message,
          },
          {
            jobId: `campaign-${campaignId}-recipient-${recipient.id}`,
          },
        );
      } catch (error) {
        failures.push(recipient.id);
        this.logger.error(
          `Failed to queue recipient ${recipient.id} for campaign ${campaignId}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `Failed to queue ${failures.length} recipient(s) for campaign ${campaignId}`,
      );
    }

    this.logger.log(
      `Queued ${recipients.length} email job(s) for campaign ${campaignId}`,
    );
  }
}
