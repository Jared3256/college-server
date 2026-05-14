import * as process from 'node:process';

export default () => ({
  port: process.env.PORT || 3000,
  sentry: process.env.SENTRY_URL,
  database: {
    uri:
      process.env.NODE_ENV === 'development'
        ? process.env.DEV_DATABASE
        : process.env.MONGODB_URI,
  },
});
