import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PrismaModule } from '@org/database';

import { getRedisConnection } from './config/redis.config';
import { CampaignSchedulerProcessor } from './processors/campaign-scheduler.processor';
import { EmailSendProcessor } from './processors/email-send.processor';
import {
  CAMPAIGN_SCHEDULER_QUEUE,
  EMAIL_SEND_QUEUE,
} from './scheduler.constants';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [
    PrismaModule,
    BullModule.forRoot({ connection: getRedisConnection() }),
    BullModule.registerQueue(
      { name: CAMPAIGN_SCHEDULER_QUEUE },
      { name: EMAIL_SEND_QUEUE },
    ),
  ],
  controllers: [SchedulerController],
  providers: [SchedulerService, CampaignSchedulerProcessor, EmailSendProcessor],
})
export class SchedulerModule {}
