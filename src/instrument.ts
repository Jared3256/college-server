import * as Sentry from '@sentry/nestjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV ?? 'development'}` });

if (process.env.SENTRY_URL) {
  Sentry.init({
    dsn: process.env.SENTRY_URL,
    environment: process.env.NODE_ENV,
    sendDefaultPii: false,
  });
}
