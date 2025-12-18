import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreatePropostaDto {
  @IsString()
  municipio: string;

  @IsString()
  @IsOptional()
  data?: string;

  @IsObject()
  @IsOptional()
  services?: Record<string, boolean>;

  @IsObject()
  @IsOptional()
  customCabimentos?: Record<string, string>;

  @IsObject()
  @IsOptional()
  customEstimates?: Record<string, string>;
}

