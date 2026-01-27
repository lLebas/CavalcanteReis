import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateMinutaDto {
  @IsString()
  municipio: string;

  @IsString()
  @IsOptional()
  objeto?: string;

  @IsString()
  @IsOptional()
  valorContrato?: string;

  @IsString()
  @IsOptional()
  prazoVigencia?: string;

  @IsString()
  @IsOptional()
  dataAssinatura?: string;

  @IsString()
  @IsOptional()
  representante?: string;

  @IsString()
  @IsOptional()
  cargo?: string;

  @IsObject()
  @IsOptional()
  services?: Record<string, boolean>;

  @IsObject()
  @IsOptional()
  customCabimentos?: Record<string, string>;

  @IsString()
  @IsOptional()
  expiresAt?: string;
}
