import { Module } from '@nestjs/common';
import { PropostasController } from './propostas.controller';
import { PropostasService } from './propostas.service';

@Module({
  controllers: [PropostasController],
  providers: [PropostasService],
  exports: [PropostasService],
})
export class PropostasModule {}

