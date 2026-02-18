import { Module } from '@nestjs/common';
import { EstudosController } from './estudos.controller';
import { EstudosService } from './estudos.service';

@Module({
  controllers: [EstudosController],
  providers: [EstudosService],
  exports: [EstudosService],
})
export class EstudosModule {}
