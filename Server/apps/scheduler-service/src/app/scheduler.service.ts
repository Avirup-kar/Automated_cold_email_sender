import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import type { CampaignScheduledEvent } from '@org/event-contracts';
import type { Queue } from 'bullmq';

import {
  CAMPAIGN_SCHEDULER_QUEUE,
  PROCESS_CAMPAIGN_JOB,
} from './scheduler.constants';
import type { CampaignSchedulerJobData } from './scheduler.types';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectQueue(CAMPAIGN_SCHEDULER_QUEUE)
    private readonly campaignSchedulerQueue: Queue<CampaignSchedulerJobData>,
  ) {}

  async scheduleCampaign(event: CampaignScheduledEvent): Promise<void> {
    const delay = Math.max(
      new Date(event.scheduledAt).getTime() - Date.now(),
      0,
    );
    const job = await this.campaignSchedulerQueue.add(
      PROCESS_CAMPAIGN_JOB,
      event,
      {
        delay,
        jobId: `campaign-${event.campaignId}`,
      },
    );

    this.logger.log(
      `Scheduled campaign ${event.campaignId} as job ${job.id} with ${delay}ms delay`,
    );
  }
}
