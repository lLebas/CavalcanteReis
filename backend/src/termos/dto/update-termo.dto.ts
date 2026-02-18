import { PartialType } from '@nestjs/mapped-types';
import { CreateTermoDto } from './create-termo.dto';

export class UpdateTermoDto extends PartialType(CreateTermoDto) {}
