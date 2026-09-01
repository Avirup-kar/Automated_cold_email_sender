/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'node:path';

import { CampaignModule } from './app/campaign.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CampaignModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'campaign',
        protoPath: join(__dirname, 'proto', 'campaign.proto'),
        url: process.env.CAMPAIGN_SERVICE_GRPC_URL ?? '0.0.0.0:50052',
      },
    },
  );

  await app.listen();
}

bootstrap();
