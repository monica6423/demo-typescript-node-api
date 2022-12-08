import { PrismaClient } from '@prisma/client';

export const setDbUrl = () => {
  if (!process.env.DATABASE_URL) {
    console.log('DB URL unset, setting default.');
    // eslint-disable-next-line functional/immutable-data
    process.env.DATABASE_URL = `postgresql://postgres:password@localhost:5432/postgres?schema=public&connection_limit=1&pool_timeout=120`;
  }
};
setDbUrl();

const prisma = new PrismaClient(
  process.env.DEBUG?.toLowerCase() === 'true'
    ? {
        log: [
          {
            emit: 'stdout',
            level: 'query',
          },
          {
            emit: 'stdout',
            level: 'error',
          },
          {
            emit: 'stdout',
            level: 'info',
          },
          {
            emit: 'stdout',
            level: 'warn',
          },
        ],
      }
    : undefined
);

export default prisma;
