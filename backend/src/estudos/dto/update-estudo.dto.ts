import { PartialType } from '@nestjs/mapped-types';
import { CreateEstudoDto } from './create-estudo.dto';

export class UpdateEstudoDto extends PartialType(CreateEstudoDto) {}
