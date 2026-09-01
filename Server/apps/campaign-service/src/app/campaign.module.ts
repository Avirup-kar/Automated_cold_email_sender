import { Module } from '@nestjs/common';
import { PrismaModule } from '@org/database';

import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';

@Module({
  imports: [PrismaModule],
  controllers: [CampaignController],
  providers: [CampaignService],
})
export class CampaignModule {}
