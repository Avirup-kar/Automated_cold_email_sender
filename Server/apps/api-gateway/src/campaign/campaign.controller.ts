import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/auth.types';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CampaignGatewayService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Controller('api/campaigns')
@UseGuards(SessionAuthGuard)
export class CampaignController {
  constructor(private readonly campaignService: CampaignGatewayService) {}

  @Post()
  createCampaign(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateCampaignDto,
  ) {
    return this.campaignService.createCampaign(request.user.userId, body);
  }

  @Get()
  getCampaigns(@Req() request: AuthenticatedRequest) {
    return this.campaignService.getCampaigns(request.user.userId);
  }
}
