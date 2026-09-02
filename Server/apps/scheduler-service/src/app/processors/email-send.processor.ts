import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import type { Job } from 'bullmq';

import { EMAIL_SEND_QUEUE, SEND_EMAIL_JOB } from '../scheduler.constants';
import type { EmailSendJobData } from '../scheduler.types';

@Injectable()
@Processor(EMAIL_SEND_QUEUE, {
  limiter: {
    max: 10,
    duration: 60_000,
  },
})
export class EmailSendProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailSendProcessor.name);

  async process(job: Job<EmailSendJobData>): Promise<void> {
    if (job.name !== SEND_EMAIL_JOB) {
      this.logger.warn(`Ignoring unknown email job ${job.name}`);
      return;
    }

    const { campaignId, recipientId, email } = job.data;
    this.logger.log(
      `Email job ready for: ${email} (campaignId=${campaignId}, recipientId=${recipientId})`,
    );
  }
}
