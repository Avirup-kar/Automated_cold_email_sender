/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ApiGatewayModule } from './app/api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule, {
    // Better Auth requests must reach the proxy as an untouched request stream.
    bodyParser: false,
  });

  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  const authServiceUrl =
    process.env.AUTH_SERVICE_HTTP_URL ?? 'http://localhost:3001';
  const port = Number(process.env.API_GATEWAY_PORT ?? 5000);

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  app.use(
    createProxyMiddleware(
      (pathname) =>
        pathname === '/api/auth' || pathname.startsWith('/api/auth/'),
      {
        target: authServiceUrl,
      },
    ),
  );

  // Keep normal Nest HTTP endpoints body-parser enabled after the proxy.
  app.use(json());
  app.use(urlencoded({ extended: true }));

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}`,
  );
}

bootstrap();
