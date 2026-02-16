-- ========================================
-- SQL para Criar as Tabelas no Supabase
-- Execute este script no SQL Editor do Supabase
-- ========================================

-- Extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela: PROPOSTAS
-- Armazena as propostas comerciais geradas pelo sistema
CREATE TABLE IF NOT EXISTS propostas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipio TEXT NOT NULL,
  destinatario TEXT,
  data TEXT,
  prazo TEXT,
  services JSONB,
  "customCabimentos" JSONB,
  "customEstimates" JSONB,
  "footerOffices" JSONB,
  "paymentValue" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabela: MINUTAS
-- Armazena as minutas de contrato geradas pelo sistema
CREATE TABLE IF NOT EXISTS minutas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipio TEXT NOT NULL,
  objeto TEXT,
  "valorContrato" TEXT,
  "prazoVigencia" TEXT,
  "dataAssinatura" TEXT,
  representante TEXT,
  cargo TEXT,
  services JSONB,
  "customCabimentos" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Trigger para atualizar o campo updatedAt automaticamente
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela propostas
DROP TRIGGER IF EXISTS set_timestamp_propostas ON propostas;
CREATE TRIGGER set_timestamp_propostas
BEFORE UPDATE ON propostas
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Aplicar trigger na tabela minutas
DROP TRIGGER IF EXISTS set_timestamp_minutas ON minutas;
CREATE TRIGGER set_timestamp_minutas
BEFORE UPDATE ON minutas
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Mensagem de sucesso
SELECT 'Tabelas criadas com sucesso! ✅' AS status;
