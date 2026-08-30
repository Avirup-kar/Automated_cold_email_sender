/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  await app.listen(process.env.AUTH_SERVICE_PORT ?? 3001);
  console.log('Auth-Service is running on port:3001');
}

bootstrap();
