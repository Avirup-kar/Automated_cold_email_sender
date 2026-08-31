import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';

import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';

export const AUTH_SERVICE_CLIENT = 'AUTH_SERVICE_CLIENT';

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
    ]),
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
  exports: [ClientsModule],
})
export class ApiGatewayModule {}
