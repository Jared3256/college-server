import './instrument';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstraps and starts the NestJS application.
 *
 * Creates the application, registers a global validation pipe that enforces and
 * transforms incoming DTOs (whitelisting allowed properties and forbidding unknown ones),
 * and starts the HTTP server on the port from `process.env.PORT` or `3000`.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
