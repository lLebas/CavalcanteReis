import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreatePropostaDto {
  @IsString()
  municipio: string;

  @IsString()
  @IsOptional()
  data?: string;

  @IsString()
  @IsOptional()
  destinatario?: string;

  @IsString()
  @IsOptional()
  prazo?: string;

  @IsObject()
  @IsOptional()
  services?: Record<string, boolean>;

  @IsObject()
  @IsOptional()
  customCabimentos?: Record<string, string>;

  @IsObject()
  @IsOptional()
  customEstimates?: Record<string, string>;

  @IsObject()
  @IsOptional()
  footerOffices?: Record<string, any>;

  @IsString()
  @IsOptional()
  paymentValue?: string;

  @IsString()
  @IsOptional()
  expiresAt?: string; // Data de expiração (opcional, padrão: 1 ano)
}

