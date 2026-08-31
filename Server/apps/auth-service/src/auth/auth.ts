import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@org/database';
import { setDefaultAutoSelectFamily } from 'node:net';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

// This environment has no working IPv6 route. Node's automatic family
// selection can therefore time out before pg establishes an IPv4 connection.
setDefaultAutoSelectFamily(false);

const connectionUrl = new URL(databaseUrl);
connectionUrl.searchParams.set('sslmode', 'verify-full');

const adapter = new PrismaPg({ connectionString: connectionUrl.toString() });
const prisma = new PrismaClient({ adapter });

const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  baseURL: process.env.BETTER_AUTH_URL, // e.g. http://localhost:5000
  secret: process.env.BETTER_AUTH_SECRET, // openssl rand -base64 32

  trustedOrigins: [process.env.FRONTEND_URL!], // e.g. http://localhost:3000

  // advanced: {
  //   useSecureCookies: true,

  //   defaultCookieAttributes: {
  //     httpOnly: true,
  //     secure: true,
  //     sameSite: 'none',
  //     path: '/',
  //   },
  // },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});

export default auth;
