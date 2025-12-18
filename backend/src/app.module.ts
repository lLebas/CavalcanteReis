import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PropostasModule } from './propostas/propostas.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PropostasModule,
    DocumentsModule,
  ],
})
export class AppModule {}

