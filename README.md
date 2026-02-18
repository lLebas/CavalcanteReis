# Kit de Inexigibilidade - Cavalcante Reis Advogados
**Sistema Completo de Geração de Documentos Jurídicos**

[![Status](https://img.shields.io/badge/status-ready_for_testing-green.svg)](GUIA_DE_TESTES.md)
[![Version](https://img.shields.io/badge/version-1.0_RC-blue.svg)](IMPLEMENTACAO_COMPLETA.md)
[![Database](https://img.shields.io/badge/database-Supabase_PostgreSQL-orange.svg)](supabase-setup.sql)

Sistema profissional para geração de documentos jurídicos de inexigibilidade de licitação, com integração completa com banco de dados PostgreSQL/Supabase.

---

## 📚 ÍNDICE DE DOCUMENTAÇÃO

**🚀 Para Setup Inicial:**
1. **[CHECKLIST_PRE_TESTES.md](CHECKLIST_PRE_TESTES.md)** - Validação rápida antes dos testes
2. **[INSTRUCOES_SETUP.md](INSTRUCOES_SETUP.md)** - Guia completo de configuração passo a passo

**🧪 Para Testes:**
3. **[GUIA_DE_TESTES.md](GUIA_DE_TESTES.md)** - 7 testes completos para validação do sistema

**📖 Para Referência Técnica:**
4. **[IMPLEMENTACAO_COMPLETA.md](IMPLEMENTACAO_COMPLETA.md)** - Documentação técnica completa
5. **[supabase-setup.sql](supabase-setup.sql)** - Script SQL para criação do banco de dados

---

## 🎯 DOCUMENTOS SUPORTADOS

| Documento | Status | Descrição |
|-----------|--------|-----------|
| **Propostas** | ✅ Completo | Propostas comerciais personalizadas |
| **Minutas** | ✅ Completo | Minutas contratuais com cláusulas editáveis |
| **Estudos de Contratação** | ✅ Completo | Planejamento técnico com 12 tópicos |
| **Termos de Referência** | ✅ Completo | Documento TR com 13 cláusulas estruturadas |
| **Pareceres Jurídicos** | ✅ Completo | Análises legais e conclusões |

---

## 🏗️ ARQUITETURA

### Stack Tecnológica
- **Backend:** NestJS 10 + TypeScript + Prisma ORM
- **Frontend:** Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Banco de Dados:** PostgreSQL (Supabase)
- **Geração de Documentos:** docx library (Word/DOCX)
- **Deploy:** Railway/Render (Backend) + Vercel (Frontend)

### Estrutura do Projeto
```
├── backend/              # API NestJS
│   ├── src/
│   │   ├── documents/   # Geração DOCX
│   │   ├── estudos/     # CRUD Estudos
│   │   ├── termos/      # CRUD Termos
│   │   └── ...          # Outros módulos
│   └── prisma/
├── frontend/            # App Next.js
│   ├── src/
│   │   ├── app/
│   │   │   └── dashboard/ # Dashboard de documentos
│   │   ├── components/    # Editores
│   │   └── lib/           # APIs e utilitários
│   └── public/
├── prisma/              # Schema compartilhado
└── supabase-setup.sql   # Setup do banco
```

---

## ⚡ INÍCIO RÁPIDO (5 MINUTOS)

### 1️⃣ Clonar Repositório
```bash
git clone https://github.com/lLebas/CavalcanteReis.git
cd CavalcanteReis
```

### 2️⃣ Configurar Supabase
1. Criar projeto em [supabase.com](https://supabase.com)
2. Executar `supabase-setup.sql` no SQL Editor
3. Copiar `DATABASE_URL` (Settings → Database)

### 3️⃣ Configurar Backend
```bash
cd backend
pnpm install
cp .env.example .env
# Editar .env com sua DATABASE_URL
npx prisma generate --schema=../prisma/schema.prisma
pnpm run start:dev  # http://localhost:3001
```

### 4️⃣ Configurar Frontend
```bash
cd frontend
pnpm install
cp .env.example .env.local
# Editar .env.local com NEXT_PUBLIC_API_URL
pnpm run dev  # http://localhost:3000
```

### 5️⃣ Testar Sistema
1. Abrir: http://localhost:3000
2. Criar documento de teste
3. Verificar no Dashboard

**📖 Guia detalhado:** [INSTRUCOES_SETUP.md](INSTRUCOES_SETUP.md)

---

## 📦 INSTALAÇÃO DETALHADA

### ⚠️ IMPORTANTE: Pré-requisitos

- **Node.js** 18+ instalado
- **pnpm** instalado (`npm install -g pnpm`)
- **PostgreSQL** 14+ OU conta no **Supabase** (gratuita)
- **Git** instalado

### Opção 1: Script Automático (Recomendado)

**Windows:**
```bash
install-all.bat
```

**Linux/Mac:**
```bash
chmod +x install-all.sh
./install-all.sh
```

### Opção 2: Manual (Recomendado para Controle Total)

```bash
# Instalar dependências do backend
cd backend
pnpm install
cd ..

# Instalar dependências do frontend
cd frontend
pnpm install
cd ..
```

**⚠️ Se encontrar erro `'nest' não é reconhecido` ou `'next' não é reconhecido`:**
→ As dependências não foram instaladas. Execute os comandos acima primeiro!

---

## 🚀 EXECUTAR SISTEMA EM DESENVOLVIMENTO

### Rodar Backend e Frontend Simultaneamente

**Terminal 1 (Backend):**
```bash
cd backend
pnpm run start:dev
```
✅ Backend rodando em: http://localhost:3001

**Terminal 2 (Frontend):**
```bash
cd frontend
pnpm run dev
```
✅ Frontend rodando em: http://localhost:3000

### Verificar se Está Funcionando

1. **Backend:** Abrir http://localhost:3001/estudos
   - Deve retornar: `[]` (array vazio em JSON)

2. **Frontend:** Abrir http://localhost:3000
   - Deve mostrar: Tela inicial com cards dos documentos

---

## ⚙️ VARIÁVEIS DE AMBIENTE

### Backend (`backend/.env`)
```env
# Conexão com PostgreSQL (Supabase)
DATABASE_URL="postgresql://postgres:SENHA@db.PROJETO.supabase.co:5432/postgres"

# Porta do servidor
PORT=3001

# Supabase (opcional)
SUPABASE_URL="https://PROJETO.supabase.co"
SUPABASE_ANON_KEY="eyJ..."
```

### Frontend (`frontend/.env.local`)
```env
# URL do backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase (opcional)
NEXT_PUBLIC_SUPABASE_URL=https://PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**📖 Como obter credenciais:** [INSTRUCOES_SETUP.md](INSTRUCOES_SETUP.md)

---

## 🎨 FUNCIONALIDADES PRINCIPAIS

### 1. **Geração de Documentos Word (DOCX)**
- ✅ Logo oficial em todas as páginas
- ✅ Formatação profissional (fonte Garamond)
- ✅ Texto em negrito com sintaxe `**texto**`
- ✅ Assinatura apenas na última página
- ✅ Margens e espaçamentos corretos

### 2. **Dashboard de Gerenciamento**
- ✅ Listagem de todos os documentos salvos
- ✅ Filtros por tipo de documento (5 abas)
- ✅ Ordenação por data de atualização
- ✅ Ações: Abrir (editar) e Excluir
- ✅ Empty states e loading states

### 3. **Salvamento e Carregamento**
- ✅ Salvar documentos no Supabase (PostgreSQL)
- ✅ Carregar documentos existentes via URL (`?id=UUID`)
- ✅ Atualização automática de `updated_at`
- ✅ Expiração automática após 1 ano

### 4. **Editores Inteligentes**
- ✅ Preview em tempo real
- ✅ Validação de campos obrigatórios
- ✅ Auto-save (opcional)
- ✅ Navegação lateral por seções (Termo de Referência)

---

## 🧪 EXECUTAR TESTES

### Pré-Testes (Checklist Rápido)
```bash
# Verificar se tudo está configurado
# Siga o guia: CHECKLIST_PRE_TESTES.md
```

### Testes Completos (7 Cenários)
```bash
# Validar todas as funcionalidades
# Siga o guia: GUIA_DE_TESTES.md
```

### Teste Rápido (2 Minutos)
1. Abrir: http://localhost:3000
2. Clicar: "Estudo de Contratação"
3. Preencher: Município e marcar 1 tópico
4. Clicar: "Salvar Estudo"
5. Verificar: Alerta de sucesso
6. Ir para: Dashboard
7. Verificar: Documento aparece na lista
8. Clicar: "Baixar DOCX"
9. Abrir: Arquivo Word gerado
10. Verificar: Logo, formatação, conteúdo

✅ **Sucesso!** Sistema está funcional.

---

## 📊 BANCO DE DADOS

### Tabelas Criadas (Supabase)

| Tabela | Descrição | Campos Principais |
|--------|-----------|-------------------|
| `estudos_contratacao` | Estudos técnicos | municipio, processo, form_data |
| `termos_referencia` | Termos de Referência | municipio, processo, form_data |
| `pareceres_juridicos` | Pareceres legais | municipio, processo, form_data |
| `minutas` | Minutas contratuais | municipio, objeto, valor_contrato |
| `propostas` | Propostas comerciais | municipio, destinatario, prazo |

### Políticas de Segurança (RLS)

**Desenvolvimento (Atual):**
- ✅ Leitura pública (qualquer um pode ler)
- ✅ Escrita pública (qualquer um pode criar/editar/excluir)

**⚠️ Para Produção:**
- Implementar autenticação (Supabase Auth)
- Restringir políticas RLS ao `user_id`
- Adicionar regras de permissões por role

---

## 🔧 COMANDOS ÚTEIS

### Backend

```bash
# Desenvolvimento
cd backend
pnpm run start:dev

# Build para produção
pnpm run build

# Executar produção
pnpm run start:prod

# Gerar Prisma Client
npx prisma generate --schema=../prisma/schema.prisma

# Ver banco de dados (GUI)
npx prisma studio --schema=../prisma/schema.prisma

# Atualizar schema do banco
npx prisma db push --schema=../prisma/schema.prisma
```

### Frontend

```bash
# Desenvolvimento
cd frontend
pnpm run dev

# Build para produção
pnpm run build

# Executar produção
pnpm start

# Limpar cache
rm -rf .next

# Verificar erros TypeScript
pnpm run build
```

### Banco de Dados

```bash
# Conectar ao banco (Prisma Studio)
npx prisma studio --schema=./prisma/schema.prisma

# Verificar conexão
npx prisma db pull --schema=./prisma/schema.prisma

# Resetar banco (CUIDADO!)
# Execute novamente o supabase-setup.sql no Supabase
```

---

## 🚀 DEPLOY EM PRODUÇÃO

### Backend (Railway/Render)

**Railway:**
1. Criar conta em [railway.app](https://railway.app)
2. Conectar repositório GitHub
3. Adicionar variáveis de ambiente:
   - `DATABASE_URL` (do Supabase)
   - `PORT=3001`
4. Setar comando de start: `cd backend && pnpm run start:prod`
5. Deploy automático configurado ✅

**Render:**
1. Criar conta em [render.com](https://render.com)
2. New → Web Service
3. Conectar repositório
4. Build Command: `cd backend && pnpm install && pnpm run build`
5. Start Command: `cd backend && pnpm run start:prod`
6. Adicionar variáveis de ambiente

### Frontend (Vercel)

1. Criar conta em [vercel.com](https://vercel.com)
2. Import Git Repository
3. Framework Preset: Next.js
4. Root Directory: `frontend`
5. Environment Variables:
   - `NEXT_PUBLIC_API_URL=https://seu-backend.railway.app`
6. Deploy ✅

### Banco de Dados (Supabase - Já em Produção)

✅ Supabase já é um serviço em produção, nada mais a fazer!

---

## 🐛 RESOLUÇÃO DE PROBLEMAS

### "Cannot connect to database"
**Solução:**
- Verificar `DATABASE_URL` no `.env`
- Testar com: `npx prisma db pull --schema=./prisma/schema.prisma`
- Senha com caracteres especiais: escapar (`@` → `%40`)

### "Logo não aparece no Word"
**Solução:**
- Confirmar que existe `public/barrocas.png`
- Verificar caminho no código: `fs.readFileSync(path.join(__dirname, '../../public/barrocas.png'))`
- Tamanho recomendado: 200x80 pixels

### "API retorna 404"
**Solução:**
- Backend está rodando? `http://localhost:3001/estudos`
- NEXT_PUBLIC_API_URL correto no `.env.local`?
- Verificar CORS no backend

### "Prisma Client not found"
**Solução:**
```bash
cd backend
npx prisma generate --schema=../prisma/schema.prisma
```

**📖 Mais soluções:** [GUIA_DE_TESTES.md](GUIA_DE_TESTES.md#-problemas-conhecidos-e-solu%C3%A7%C3%B5es)

---

## 📄 LICENÇA

**Propriedade de Cavalcante Reis Sociedade de Advogados**  
CNPJ: 26.632.686/0001-27  
Endereço: SHIS QL 10, Conj. 06, Casa 19, Lago Sul, Brasília/DF, CEP 71630-065  
Telefone: (61) 3248-4524  
Email: advocacia@cavalcantereis.adv.br

---

## 🤝 CONTRIBUIÇÃO

Sistema desenvolvido internamente para uso exclusivo da Cavalcante Reis Advogados.

**Suporte Técnico:**
- 📧 Email: advocacia@cavalcantereis.adv.br
- 📖 Documentação: Veja arquivos `.md` na raiz do projeto

---

## 📚 DOCUMENTAÇÃO ADICIONAL

| Arquivo | Descrição |
|---------|-----------|
| [CHECKLIST_PRE_TESTES.md](CHECKLIST_PRE_TESTES.md) | ✅ Validação antes dos testes |
| [GUIA_DE_TESTES.md](GUIA_DE_TESTES.md) | 🧪 7 testes completos |
| [INSTRUCOES_SETUP.md](INSTRUCOES_SETUP.md) | 📖 Setup passo a passo |
| [IMPLEMENTACAO_COMPLETA.md](IMPLEMENTACAO_COMPLETA.md) | 📋 Documentação técnica |
| [supabase-setup.sql](supabase-setup.sql) | 🗄️ Script SQL |

---

## 📈 STATUS DO PROJETO

- ✅ **Backend:** 100% funcional
- ✅ **Frontend:** 100% funcional
- ✅ **Banco de Dados:** Configurado e otimizado
- ✅ **Geração de DOCX:** Profissional e testada
- ✅ **Dashboard:** Completo com CRUD
- ✅ **Documentação:** Completa e detalhada
- 🟢 **Status:** Ready for Testing

**Última Atualização:** 18 de Fevereiro de 2026  
**Versão:** 1.0 Release Candidate

---

**Desenvolvido com ❤️ para Cavalcante Reis Sociedade de Advogados**

## 📚 Documentação da API

Quando o backend estiver rodando, acesse:
- Swagger UI: http://localhost:3001/api

## 🧹 Limpeza de Arquivos Antigos

Agora que migramos para NestJS + Next.js, você pode remover os arquivos da estrutura antiga (Vite + React).

**📖 Veja o guia completo**: [CLEANUP_GUIDE.md](./CLEANUP_GUIDE.md)

**⚡ Resumo rápido**: [RESUMO_LIMPEZA.md](./RESUMO_LIMPEZA.md)

### Scripts de Limpeza Rápida

1. **Copiar arquivos públicos** (IMPORTANTE fazer primeiro):
   ```bash
   # Windows
   copy-public.bat
   
   # Linux/Mac
   ./copy-public.sh
   ```

2. **Limpar arquivos antigos**:
   ```bash
   # Windows
   cleanup.bat
   
   # Linux/Mac
   ./cleanup.sh
   ```

### O que será removido:
- ❌ `src/` - Código antigo (Vite + React)
- ❌ `dist/` - Build antigo
- ❌ `api-backup/` - APIs antigas (já migradas)
- ❌ `vite.config.js`, `index.html`, etc.
- ❌ `prisma/` - Se não vai usar PostgreSQL

## 🗂️ Estrutura do Projeto

```
.
├── backend/          # NestJS Backend
│   ├── src/
│   │   ├── propostas/    # Módulo de propostas
│   │   ├── documents/    # Módulo de documentos
│   │   └── main.ts       # Entry point
│   └── package.json
│
├── frontend/         # Next.js Frontend
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # Componentes React
│   │   └── lib/          # Utilitários (API client, etc.)
│   └── package.json
│
└── package.json     # Scripts do monorepo
```

## 🔄 Migração do Código Antigo

O código foi migrado de:
- **Vite + React (JSX)** → **Next.js + TypeScript (TSX)**
- **API Routes Next.js** → **NestJS Controllers**

## 📋 Funcionalidades

- ✅ Autenticação
- ✅ Geração de propostas
- ✅ Processamento de documentos DOCX
- ✅ Geração de PDF
- ✅ Geração de DOCX
- ✅ Salvamento de propostas
- ✅ Interface responsiva

## 🛠️ Tecnologias

### Backend
- NestJS
- TypeScript
- Swagger/OpenAPI
- Class Validator

### Frontend
- Next.js 14
- React 18
- TypeScript
- Lucide Icons
- Axios

## 📄 Licença

MIT
