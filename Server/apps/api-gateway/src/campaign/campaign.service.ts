import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { CAMPAIGN_SERVICE_CLIENT } from '../app/grpc.constants';
import type { CreateCampaignDto } from './dto/create-campaign.dto';
import type { CampaignGrpcService } from './campaign.types';

interface GrpcError {
  code?: number;
  details?: string;
  message?: string;
}

@Injectable()
export class CampaignGatewayService implements OnModuleInit {
  private campaignService!: CampaignGrpcService;

  constructor(
    @Inject(CAMPAIGN_SERVICE_CLIENT)
    private readonly campaignClient: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.campaignService =
      this.campaignClient.getService<CampaignGrpcService>('CampaignService');
  }

  async createCampaign(userId: string, dto: CreateCampaignDto) {
    try {
      return await firstValueFrom(
        this.campaignService.createCampaign({ userId, ...dto }),
      );
    } catch (error) {
      this.rethrowGrpcError(error as GrpcError);
    }
  }

  async getCampaigns(userId: string) {
    try {
      return await firstValueFrom(
        this.campaignService.getCampaigns({ userId }),
      );
    } catch (error) {
      this.rethrowGrpcError(error as GrpcError);
    }
  }

  private rethrowGrpcError(error: GrpcError): never {
    const message = error.details ?? error.message ?? 'Campaign service error';

    if (error.code === status.INVALID_ARGUMENT) {
      throw new BadRequestException(message);
    }

    if (error.code === status.UNAVAILABLE) {
      throw new ServiceUnavailableException('Campaign service is unavailable');
    }

    throw new BadGatewayException(message);
  }
}
