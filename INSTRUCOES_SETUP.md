# Sistema de Gestão de Documentos - Cavalcante Reis

Sistema completo de geração e gestão de documentos jurídicos com integração PostgreSQL/Supabase.

## 📋 Documentos Suportados

- **Propostas** - Documentos de propostas comerciais
- **Minutas** - Minutas contratuais
- **Estudos de Contratação** - Documentos de estudos técnicos
- **Termos de Referência** - Documentos TR com 13 cláusulas
- **Pareceres Jurídicos** - Pareceres e análises jurídicas

## 🚀 Configuração do Projeto

### 1. Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 14+ ou conta no Supabase
- pnpm (gerenciador de pacotes)

### 2. Configurar Banco de Dados (Supabase)

#### 2.1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Preencha os dados:
   - **Name**: cavalcante-reis-docs (ou nome de sua preferência)
   - **Database Password**: Crie uma senha forte e **guarde-a**
   - **Region**: South America (São Paulo) - para melhor latência no Brasil
   - **Pricing Plan**: Free (suficiente para começar)
5. Clique em "Create new project" e aguarde ~2 minutos

#### 2.2. Executar Script SQL

1. No painel do Supabase, vá em **SQL Editor** (ícone de banco de dados no menu lateral)
2. Clique em "+ New query"
3. Copie todo o conteúdo do arquivo `supabase-setup.sql` (na raiz do projeto)
4. Cole no editor SQL
5. Clique em "Run" (ou pressione Ctrl+Enter)
6. Verifique se apareceu "Success" - deve criar 5 tabelas e suas políticas

#### 2.3. Obter Credenciais

1. No painel Supabase, vá em **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL** (exemplo: `https://xxxxx.supabase.co`)
   - **Project API Key → anon public** (token longo começando com `eyJ...`)

### 3. Configurar Backend (NestJS)

```bash
# Entrar na pasta backend
cd backend

# Instalar dependências
pnpm install

# Criar arquivo .env
# Copie o .env.example ou crie um novo:
```

**Arquivo `backend/.env`:**
```env
# Supabase Database URL
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJECT-ID].supabase.co:5432/postgres"

# Porta do servidor
PORT=3001

# Supabase (opcional - para funcionalidades futuras)
SUPABASE_URL="https://[SEU-PROJECT-ID].supabase.co"
SUPABASE_ANON_KEY="eyJ..."
```

**Como montar a DATABASE_URL:**
- Vá em Supabase → Settings → Database
- Em "Connection String" → "URI", copie a URL
- Substitua `[YOUR-PASSWORD]` pela senha que você criou no passo 2.1

**Exemplo real:**
```
DATABASE_URL="postgresql://postgres:MinhaSenh@123@db.xyzabc123.supabase.co:5432/postgres"
```

```bash
# Gerar Prisma Client
npx prisma generate

# (Opcional) Verificar se o banco está conectado
npx prisma db pull

# Iniciar servidor de desenvolvimento
pnpm run start:dev
```

O backend estará rodando em `http://localhost:3001`

### 4. Configurar Frontend (Next.js)

```bash
# Entrar na pasta frontend (a partir da raiz do projeto)
cd frontend

# Instalar dependências
pnpm install

# Criar arquivo .env.local
```

**Arquivo `frontend/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://[SEU-PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

```bash
# Iniciar servidor de desenvolvimento
pnpm run dev
```

O frontend estará rodando em `http://localhost:3000`

## 🎯 Usar o Sistema

### Criar Novo Documento

1. Acesse `http://localhost:3000`
2. Escolha o tipo de documento no menu inicial
3. Preencha os campos do formulário
4. Clique em **"Salvar"** para guardar no banco de dados
5. Clique em **"Baixar DOCX"** para gerar o arquivo Word

### Visualizar Documentos Salvos

1. Acesse `http://localhost:3000/dashboard`
2. Use as abas para filtrar por tipo de documento
3. Clique em **"Abrir"** para editar um documento salvo
4. Clique em **"Excluir"** para remover (confirmação necessária)

## 📁 Estrutura do Projeto

```
.
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── documents/      # Geração de DOCX (Word)
│   │   ├── estudos/        # CRUD Estudos de Contratação
│   │   ├── minutas/        # CRUD Minutas
│   │   ├── pareceres/      # CRUD Pareceres
│   │   ├── propostas/      # CRUD Propostas
│   │   ├── termos/         # CRUD Termos de Referência
│   │   ├── prisma/         # Serviço Prisma ORM
│   │   └── app.module.ts   # Módulo raiz
│   └── prisma/
│       └── schema.prisma   # Schema do banco de dados
│
├── frontend/                # App Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/  # Dashboard de documentos
│   │   │   ├── page.tsx    # Página inicial
│   │   │   └── layout.tsx  # Layout global
│   │   ├── components/     # Componentes dos editores
│   │   │   ├── EstudoContratacao.tsx
│   │   │   ├── TermoReferencia.tsx
│   │   │   ├── ParecerJuridico.tsx
│   │   │   ├── MinutaGenerator.tsx
│   │   │   └── ProposalGenerator.tsx
│   │   └── lib/
│   │       ├── api.ts      # Cliente API (axios)
│   │       └── *Generator.ts  # Funções de geração
│   └── public/
│       └── barrocas.png    # Logo oficial
│
├── prisma/
│   └── schema.prisma       # Schema compartilhado
│
├── supabase-setup.sql      # Script SQL setup completo
└── README.md               # Este arquivo
```

## 🔧 Comandos Úteis

### Backend

```bash
# Desenvolvimento
pnpm run start:dev

# Build produção
pnpm run build

# Executar produção
pnpm run start:prod

# Regenerar Prisma Client (após mudar schema)
npx prisma generate

# Ver estrutura do banco
npx prisma studio
```

### Frontend

```bash
# Desenvolvimento
pnpm run dev

# Build produção
pnpm run build

# Executar produção
pnpm start

# Lint
pnpm run lint
```

## 🗄️ Banco de Dados

### Tabelas Criadas

- `estudos_contratacao` - Estudos técnicos de contratação
- `termos_referencia` - Termos de Referência (13 cláusulas)
- `pareceres_juridicos` - Pareceres e análises jurídicas
- `minutas` - Minutas contratuais
- `propostas` - Propostas comerciais

Todas as tabelas possuem:
- `id` (UUID, chave primária)
- `municipio` (TEXT, obrigatório)
- `processo` (TEXT, opcional)
- `form_data` (JSONB, dados do formulário)
- `created_at` (timestamp automático)
- `updated_at` (timestamp automático via trigger)
- `expires_at` (timestamp, expiração em 1 ano)

### Políticas de Segurança (RLS)

**Ambiente de Desenvolvimento (Atual):**
- ✅ Leitura (SELECT): Acesso público
- ✅ Inserção (INSERT): Acesso público
- ✅ Atualização (UPDATE): Acesso público
- ✅ Exclusão (DELETE): Acesso público

**⚠️ Para Produção, você deve:**
1. Implementar autenticação Supabase Auth
2. Modificar as políticas RLS para exigir autenticação
3. Adicionar colunas `user_id` nas tabelas
4. Restringir acesso aos próprios documentos do usuário

## 🎨 Funcionalidades

### Geração de Documentos DOCX

- ✅ **Logo oficial** em todas as páginas (barrocas.png)
- ✅ **Formatação profissional** com fonte Garamond
- ✅ **Texto em negrito** usando sintaxe `**texto**`
- ✅ **Assinaturas** apenas na última página
- ✅ **Paginação automática** para documentos extensos

### Dashboard

- ✅ **Filtragem por tipo** (abas)
- ✅ **Ordenação** por data de atualização
- ✅ **Busca** por município e processo
- ✅ **Ações rápidas** (Abrir, Excluir)
- ✅ **Navegação direta** para edição

### Editores

- ✅ **Preview em tempo real** do documento
- ✅ **Salvamento automático** no banco
- ✅ **Carregamento** de documentos existentes
- ✅ **Navegação lateral** entre seções (Termos)
- ✅ **Validação** de campos obrigatórios

## 🐛 Resolução de Problemas

### Erro: "Cannot connect to database"

**Solução:**
1. Verifique se a `DATABASE_URL` no `.env` está correta
2. Confirme se a senha não contém caracteres especiais não escapados
3. Teste a conexão: `npx prisma db pull`
4. Verifique o firewall do Supabase em Settings → Database → Connection Pooling

### Erro: "Logo não aparece no documento"

**Solução:**
1. Confirme que existe `public/barrocas.png` na raiz do projeto
2. O backend deve ter acesso ao arquivo
3. Verifique o caminho no código: `fs.readFileSync(path.join(__dirname, '../../public/barrocas.png'))`

### Erro: "API não responde no frontend"

**Solução:**
1. Confirme que o backend está rodando em `http://localhost:3001`
2. Verifique `NEXT_PUBLIC_API_URL` no `frontend/.env.local`
3. Abra `http://localhost:3001/propostas` no navegador - deve retornar JSON

### Erro: "Property 'estudoContratacao' does not exist"

**Solução:**
```bash
cd backend
npx prisma generate
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do backend: `pnpm run start:dev`
2. Verifique os logs do frontend: `pnpm run dev`
3. Consulte a documentação do Supabase: https://supabase.com/docs
4. Consulte a documentação do Prisma: https://www.prisma.io/docs

## 📄 Licença

Propriedade de **Cavalcante Reis Sociedade de Advogados**
CNPJ: 26.632.686/0001-27
