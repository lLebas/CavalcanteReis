# Sistema Cavalcante Reis - Propostas Advocatícias

Sistema completo para geração de propostas advocatícias, construído com **NestJS** (backend) e **Next.js** (frontend), ambos em TypeScript.

## 🏗️ Arquitetura

- **Backend**: NestJS + TypeScript
- **Frontend**: Next.js 14 + TypeScript + React
- **Banco de Dados**: JSON file (pode ser migrado para PostgreSQL/Prisma)

## 📦 Instalação

### ⚠️ IMPORTANTE: Instalar dependências primeiro!

**Antes de rodar `npm run dev`, você PRECISA instalar as dependências:**

#### Opção 1: Script Automático (Recomendado)

**Windows:**
```bash
install-all.bat
```

**Linux/Mac:**
```bash
chmod +x install-all.sh
./install-all.sh
```

#### Opção 2: Usar o script do package.json

```bash
npm run install:all
```

#### Opção 3: Manual

```bash
# 1. Instalar dependências do monorepo
npm install

# 2. Instalar dependências do backend
cd backend && npm install && cd ..

# 3. Instalar dependências do frontend
cd frontend && npm install && cd ..
```

**⚠️ Se você ver o erro `'nest' não é reconhecido` ou `'next' não é reconhecido`, significa que as dependências não foram instaladas. Execute os comandos acima primeiro!**

Ou manualmente:

```bash
# Instalar dependências do monorepo
npm install

# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install
```

## 🚀 Desenvolvimento

### Rodar backend e frontend simultaneamente

```bash
npm run dev
```

### Rodar separadamente

**Backend (porta 3001):**
```bash
npm run dev:backend
```

**Frontend (porta 3000):**
```bash
npm run dev:frontend
```

## 📝 Variáveis de Ambiente

### Backend (`backend/.env`)
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🏭 Build para Produção

```bash
npm run build
```

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
