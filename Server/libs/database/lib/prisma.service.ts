import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env['DATABASE_URL'];

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not defined');
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool, { disposeExternalPool: true });

    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await (this as PrismaClient).$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await (this as PrismaClient).$disconnect();
  }
}

// Prisma 7 exports the generated client as a constructor value and a separate
// instance type. Merge that instance type into this subclass so consumers and
// lifecycle hooks see the inherited Prisma API.
export interface PrismaService extends PrismaClient {}
