import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import type { CampaignScheduledEvent } from '@org/event-contracts';
import { lastValueFrom } from 'rxjs';

import {
  CAMPAIGN_EVENTS_CLIENT,
  CAMPAIGN_SCHEDULED_TOPIC,
} from './campaign-events.constants';

@Injectable()
export class CampaignEventPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CampaignEventPublisher.name);

  constructor(
    @Inject(CAMPAIGN_EVENTS_CLIENT)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.kafkaClient.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.kafkaClient.close();
  }

  async publishCampaignScheduled(event: CampaignScheduledEvent): Promise<void> {
    await lastValueFrom(
      this.kafkaClient.emit<void, CampaignScheduledEvent>(
        CAMPAIGN_SCHEDULED_TOPIC,
        event,
      ),
    );

    this.logger.log(`Published campaign.scheduled for ${event.campaignId}`);
  }
}
