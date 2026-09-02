import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { getKafkaBrokers } from './app/scheduler.constants';
import { SchedulerModule } from './app/scheduler.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    SchedulerModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId:
            process.env.KAFKA_CLIENT_ID_SCHEDULER ?? 'scheduler-service',
          brokers: getKafkaBrokers(),
        },
        consumer: {
          groupId: process.env.KAFKA_CONSUMER_GROUP_ID ?? 'scheduler-consumer',
        },
      },
    },
  );

  await app.listen();
  Logger.log('Scheduler Service is consuming Kafka events');
}

bootstrap().catch((error: unknown) => {
  Logger.error('Scheduler Service failed to start', error);
  process.exitCode = 1;
});
