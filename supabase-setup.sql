-- ========== SCRIPT DE SETUP COMPLETO DO SUPABASE ==========
-- Execute este script no SQL Editor do Supabase Dashboard
-- Este script cria todas as tabelas necessárias e configura as políticas RLS

-- ========== 1. CRIAR TABELAS ==========

-- Tabela: Estudos de Contratação
CREATE TABLE IF NOT EXISTS estudos_contratacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipio TEXT NOT NULL,
  processo TEXT,
  form_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 year')
);

-- Tabela: Termos de Referência
CREATE TABLE IF NOT EXISTS termos_referencia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipio TEXT NOT NULL,
  processo TEXT,
  form_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 year')
);

-- Tabela: Pareceres Jurídicos
CREATE TABLE IF NOT EXISTS pareceres_juridicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipio TEXT NOT NULL,
  processo TEXT,
  form_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 year')
);

-- Tabela: Minutas
CREATE TABLE IF NOT EXISTS minutas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipio TEXT NOT NULL,
  objeto TEXT,
  valor_contrato TEXT,
  prazo_vigencia TEXT,
  data_assinatura TEXT,
  representante TEXT,
  cargo TEXT,
  services JSONB DEFAULT '{}'::jsonb,
  custom_cabimentos JSONB DEFAULT '{}'::jsonb,
  form_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 year')
);

-- Tabela: Propostas
CREATE TABLE IF NOT EXISTS propostas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipio TEXT NOT NULL,
  destinatario TEXT,
  data TEXT,
  prazo TEXT,
  services JSONB DEFAULT '{}'::jsonb,
  custom_cabimentos JSONB DEFAULT '{}'::jsonb,
  custom_estimates JSONB DEFAULT '{}'::jsonb,
  footer_offices JSONB DEFAULT '{}'::jsonb,
  payment_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 year')
);

-- ========== 2. CRIAR ÍNDICES PARA PERFORMANCE ==========

CREATE INDEX IF NOT EXISTS idx_estudos_municipio ON estudos_contratacao(municipio);
CREATE INDEX IF NOT EXISTS idx_estudos_updated ON estudos_contratacao(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_termos_municipio ON termos_referencia(municipio);
CREATE INDEX IF NOT EXISTS idx_termos_updated ON termos_referencia(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_pareceres_municipio ON pareceres_juridicos(municipio);
CREATE INDEX IF NOT EXISTS idx_pareceres_updated ON pareceres_juridicos(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_minutas_municipio ON minutas(municipio);
CREATE INDEX IF NOT EXISTS idx_minutas_updated ON minutas(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_propostas_municipio ON propostas(municipio);
CREATE INDEX IF NOT EXISTS idx_propostas_updated ON propostas(updated_at DESC);

-- ========== 3. HABILITAR ROW LEVEL SECURITY (RLS) ==========

ALTER TABLE estudos_contratacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE termos_referencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE pareceres_juridicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE minutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE propostas ENABLE ROW LEVEL SECURITY;

-- ========== 4. CRIAR POLÍTICAS RLS (ACESSO PÚBLICO PARA DESENVOLVIMENTO) ==========
-- ATENÇÃO: Em produção, você deve criar políticas mais restritivas com autenticação

-- Políticas para estudos_contratacao
DROP POLICY IF EXISTS "Enable read access for all users" ON estudos_contratacao;
CREATE POLICY "Enable read access for all users" ON estudos_contratacao
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON estudos_contratacao;
CREATE POLICY "Enable insert for all users" ON estudos_contratacao
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON estudos_contratacao;
CREATE POLICY "Enable update for all users" ON estudos_contratacao
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON estudos_contratacao;
CREATE POLICY "Enable delete for all users" ON estudos_contratacao
  FOR DELETE USING (true);

-- Políticas para termos_referencia
DROP POLICY IF EXISTS "Enable read access for all users" ON termos_referencia;
CREATE POLICY "Enable read access for all users" ON termos_referencia
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON termos_referencia;
CREATE POLICY "Enable insert for all users" ON termos_referencia
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON termos_referencia;
CREATE POLICY "Enable update for all users" ON termos_referencia
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON termos_referencia;
CREATE POLICY "Enable delete for all users" ON termos_referencia
  FOR DELETE USING (true);

-- Políticas para pareceres_juridicos
DROP POLICY IF EXISTS "Enable read access for all users" ON pareceres_juridicos;
CREATE POLICY "Enable read access for all users" ON pareceres_juridicos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON pareceres_juridicos;
CREATE POLICY "Enable insert for all users" ON pareceres_juridicos
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON pareceres_juridicos;
CREATE POLICY "Enable update for all users" ON pareceres_juridicos
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON pareceres_juridicos;
CREATE POLICY "Enable delete for all users" ON pareceres_juridicos
  FOR DELETE USING (true);

-- Políticas para minutas
DROP POLICY IF EXISTS "Enable read access for all users" ON minutas;
CREATE POLICY "Enable read access for all users" ON minutas
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON minutas;
CREATE POLICY "Enable insert for all users" ON minutas
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON minutas;
CREATE POLICY "Enable update for all users" ON minutas
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON minutas;
CREATE POLICY "Enable delete for all users" ON minutas
  FOR DELETE USING (true);

-- Políticas para propostas
DROP POLICY IF EXISTS "Enable read access for all users" ON propostas;
CREATE POLICY "Enable read access for all users" ON propostas
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON propostas;
CREATE POLICY "Enable insert for all users" ON propostas
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON propostas;
CREATE POLICY "Enable update for all users" ON propostas
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON propostas;
CREATE POLICY "Enable delete for all users" ON propostas
  FOR DELETE USING (true);

-- ========== 5. CRIAR FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE ==========

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========== 6. CRIAR TRIGGERS PARA ATUALIZAR updated_at ==========

DROP TRIGGER IF EXISTS update_estudos_updated_at ON estudos_contratacao;
CREATE TRIGGER update_estudos_updated_at
  BEFORE UPDATE ON estudos_contratacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_termos_updated_at ON termos_referencia;
CREATE TRIGGER update_termos_updated_at
  BEFORE UPDATE ON termos_referencia
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pareceres_updated_at ON pareceres_juridicos;
CREATE TRIGGER update_pareceres_updated_at
  BEFORE UPDATE ON pareceres_juridicos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_minutas_updated_at ON minutas;
CREATE TRIGGER update_minutas_updated_at
  BEFORE UPDATE ON minutas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_propostas_updated_at ON propostas;
CREATE TRIGGER update_propostas_updated_at
  BEFORE UPDATE ON propostas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========== 7. VERIFICAR INSTALAÇÃO ==========
-- Execute esta query após o script para confirmar que tudo foi criado:

SELECT 
  tablename,
  (SELECT COUNT(*) FROM information_schema.table_constraints 
   WHERE table_name = tablename AND constraint_type = 'PRIMARY KEY') as pk_count,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = tablename::name) as policy_count
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('estudos_contratacao', 'termos_referencia', 'pareceres_juridicos', 'minutas', 'propostas')
ORDER BY tablename;

-- SUCESSO! Se vês 5 linhas com pk_count=1 e policy_count=4, está tudo OK!
