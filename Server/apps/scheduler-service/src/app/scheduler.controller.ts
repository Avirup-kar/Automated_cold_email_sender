import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { CampaignScheduledEvent } from '@org/event-contracts';

import { CAMPAIGN_SCHEDULED_TOPIC } from './scheduler.constants';
import { SchedulerService } from './scheduler.service';

@Controller()
export class SchedulerController {
  private readonly logger = new Logger(SchedulerController.name);

  constructor(private readonly schedulerService: SchedulerService) {}

  @EventPattern(CAMPAIGN_SCHEDULED_TOPIC)
  async handleCampaignScheduled(@Payload() payload: unknown): Promise<void> {
    const event = this.parseEvent(payload);

    if (!event) {
      return;
    }

    await this.schedulerService.scheduleCampaign(event);
  }

  private parseEvent(payload: unknown): CampaignScheduledEvent | null {
    if (!payload || typeof payload !== 'object') {
      this.logger.error('Ignoring malformed campaign.scheduled payload');
      return null;
    }

    const candidate = payload as Record<string, unknown>;
    const campaignId = candidate.campaignId;
    const userId = candidate.userId;
    const scheduledAt = candidate.scheduledAt;

    if (
      typeof campaignId !== 'string' ||
      !campaignId.trim() ||
      typeof userId !== 'string' ||
      !userId.trim() ||
      typeof scheduledAt !== 'string' ||
      !scheduledAt.trim() ||
      Number.isNaN(new Date(scheduledAt).getTime())
    ) {
      this.logger.error('Ignoring invalid campaign.scheduled event');
      return null;
    }

    return { campaignId, userId, scheduledAt };
  }
}
