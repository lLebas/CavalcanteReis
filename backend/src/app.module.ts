import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { PropostasModule } from './propostas/propostas.module';
import { MinutasModule } from './minutas/minutas.module';
import { EstudosModule } from './estudos/estudos.module';
import { TermosModule } from './termos/termos.module';
import { PareceresModule } from './pareceres/pareceres.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule, // Banco de dados PostgreSQL
    PropostasModule,
    MinutasModule,
    EstudosModule,
    TermosModule,
    PareceresModule,
    DocumentsModule,
  ],
})
export class AppModule {}

