import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@org/database';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  baseURL: process.env.BETTER_AUTH_URL, // e.g. http://localhost:5000
  secret: process.env.BETTER_AUTH_SECRET, // openssl rand -base64 32

  trustedOrigins: [process.env.FRONTEND_URL!], // e.g. http://localhost:3000

  advanced: {
    useSecureCookies: true,

    defaultCookieAttributes: {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    },
  },

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
