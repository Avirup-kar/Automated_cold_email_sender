import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from '@org/database';

import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { CampaignEventPublisher } from './events/campaign-event.publisher';
import {
  CAMPAIGN_EVENTS_CLIENT,
  getKafkaBrokers,
} from './events/campaign-events.constants';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: CAMPAIGN_EVENTS_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId:
              process.env.KAFKA_CLIENT_ID_CAMPAIGN ?? 'campaign-service',
            brokers: getKafkaBrokers(),
          },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  controllers: [CampaignController],
  providers: [CampaignService, CampaignEventPublisher],
})
export class CampaignModule {}
