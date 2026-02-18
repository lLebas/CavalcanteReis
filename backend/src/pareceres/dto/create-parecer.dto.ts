import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateParecerDto {
  @IsString()
  municipio: string;

  @IsObject()
  @IsOptional()
  formData?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  expiresAt?: string;
}
