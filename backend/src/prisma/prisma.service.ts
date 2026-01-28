import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Prisma 7+: URL passada diretamente no construtor
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Prisma conectado ao banco de dados PostgreSQL');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Prisma desconectado do banco de dados');
  }
}
