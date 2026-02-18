import { PartialType } from '@nestjs/mapped-types';
import { CreateParecerDto } from './create-parecer.dto';

export class UpdateParecerDto extends PartialType(CreateParecerDto) {}
