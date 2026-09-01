import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';

import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CampaignController } from '../campaign/campaign.controller';
import { CampaignGatewayService } from '../campaign/campaign.service';
import {
  AUTH_SERVICE_CLIENT,
  CAMPAIGN_SERVICE_CLIENT,
} from './grpc.constants';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: AUTH_SERVICE_CLIENT,
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(__dirname, 'proto', 'auth.proto'),
          url: process.env.AUTH_SERVICE_GRPC_URL ?? '0.0.0.0:50051',
        },
      },
      {
        name: CAMPAIGN_SERVICE_CLIENT,
        transport: Transport.GRPC,
        options: {
          package: 'campaign',
          protoPath: join(__dirname, 'proto', 'campaign.proto'),
          url: process.env.CAMPAIGN_SERVICE_GRPC_URL ?? '0.0.0.0:50052',
        },
      },
    ]),
  ],
  controllers: [ApiGatewayController, CampaignController],
  providers: [ApiGatewayService, CampaignGatewayService, SessionAuthGuard],
  exports: [ClientsModule],
})
export class ApiGatewayModule {}
