import * as process from 'node:process';

export default () => ({
  port: process.env.PORT || 3000,
  sentry: process.env.SENTRY_URL,
});
