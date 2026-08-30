import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'node:path';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, 'proto', 'auth.proto'),
      url: '0.0.0.0:50051',
    },
  });

  await app.startAllMicroservices();

  const port = process.env.AUTH_SERVICE_PORT ?? 3001;

  await app.listen(port);

  console.log(`Auth HTTP running on :${port}`);
  console.log('Auth gRPC running on :50051');
}

bootstrap();
