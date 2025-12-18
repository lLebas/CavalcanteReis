# 🚀 Guia de Setup Rápido

## 1. Instalar Dependências

```bash
npm run install:all
```

Isso instalará as dependências do monorepo, backend e frontend.

## 2. Configurar Variáveis de Ambiente

### Backend
Copie o arquivo de exemplo e ajuste se necessário:
```bash
cp backend/.env.example backend/.env
```

### Frontend
Copie o arquivo de exemplo:
```bash
cp frontend/.env.local.example frontend/.env.local
```

## 3. Copiar Arquivos Públicos

Copie as imagens e arquivos estáticos:
```bash
cp -r public/* frontend/public/
```

## 4. Rodar o Projeto

### Opção 1: Rodar tudo junto (recomendado)
```bash
npm run dev
```

Isso iniciará:
- Backend na porta 3001
- Frontend na porta 3000

### Opção 2: Rodar separadamente

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

## 5. Acessar a Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api

## 6. Migrar ProposalGenerator (Opcional)

O componente `ProposalGenerator` precisa ser migrado manualmente do arquivo original. Veja `MIGRATION_GUIDE.md` para instruções detalhadas.

## ✅ Pronto!

Agora você tem:
- ✅ Backend NestJS rodando
- ✅ Frontend Next.js rodando
- ✅ Tudo em TypeScript
- ✅ API documentada com Swagger

## 🔧 Troubleshooting

### Porta já em uso
- Altere a porta no `.env` do backend ou no `next.config.js` do frontend

### Erro de módulos não encontrados
- Execute `npm install` novamente na pasta específica (backend ou frontend)

### Erro de tipos TypeScript
- Execute `npm run build` para verificar erros de tipo
- Adicione `// @ts-ignore` temporariamente se necessário

