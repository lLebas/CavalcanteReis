import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateTermoDto {
  @IsString()
  municipio: string;

  @IsObject()
  @IsOptional()
  formData?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  expiresAt?: string;
}
