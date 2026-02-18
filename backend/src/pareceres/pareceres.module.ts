import { Module } from '@nestjs/common';
import { PareceresController } from './pareceres.controller';
import { PareceresService } from './pareceres.service';

@Module({
  controllers: [PareceresController],
  providers: [PareceresService],
  exports: [PareceresService],
})
export class PareceresModule {}
