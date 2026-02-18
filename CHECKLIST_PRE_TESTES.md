# ✅ CHECKLIST PRÉ-TESTES
# Validação Rápida - Kit de Inexigibilidade

Use este checklist para confirmar que **TUDO** está configurado antes de iniciar os testes detalhados do [GUIA_DE_TESTES.md](GUIA_DE_TESTES.md).

---

## 🗄️ BANCO DE DADOS (SUPABASE)

- [ ] **Projeto Supabase criado**
  - Acesse: https://supabase.com
  - Projeto deve estar ativo (verde)

- [ ] **Script SQL executado**
  - Abrir: SQL Editor no Supabase
  - Executar: Conteúdo de `supabase-setup.sql`
  - Verificar: "Success. No rows returned"

- [ ] **5 Tabelas criadas**
  - Ir para: Table Editor
  - Confirmar existência de:
    - ✅ `estudos_contratacao`
    - ✅ `termos_referencia`
    - ✅ `pareceres_juridicos`
    - ✅ `minutas`
    - ✅ `propostas`

- [ ] **RLS (Row Level Security) ativo**
  - Em cada tabela → Policies
  - Deve ter 4 políticas:
    - Enable read access for all users
    - Enable insert for all users
    - Enable update for all users
    - Enable delete for all users

---

## 🔧 BACKEND (NestJS)

- [ ] **Dependências instaladas**
  ```bash
  cd backend
  pnpm install
  ```
  - Verificar: `node_modules/` existe

- [ ] **Arquivo .env configurado**
  - Existe: `backend/.env`
  - Contém:
    ```env
    DATABASE_URL="postgresql://postgres:SENHA@db.PROJETO.supabase.co:5432/postgres"
    PORT=3001
    ```
  - **IMPORTANTE:** Substitua `SENHA` e `PROJETO` pelos valores reais

- [ ] **Prisma Client gerado**
  ```bash
  cd backend
  npx prisma generate --schema=../prisma/schema.prisma
  ```
  - Deve aparecer: ✔ Generated Prisma Client

- [ ] **Logo barrocas.png existe**
  - Caminho: `public/barrocas.png`
  - Tamanho: ~50-200KB
  - Formato: PNG

- [ ] **Servidor inicia sem erros**
  ```bash
  cd backend
  pnpm run start:dev
  ```
  - Deve aparecer:
    ```
    [Nest] ... LOG [NestApplication] Nest application successfully started on port 3001
    ```
  - **DEIXAR RODANDO** para os testes

- [ ] **API responde**
  - Abrir navegador: http://localhost:3001/estudos
  - Deve retornar: `[]` (array vazio) ou JSON com documentos

---

## 🎨 FRONTEND (Next.js)

- [ ] **Dependências instaladas**
  ```bash
  cd frontend
  pnpm install
  ```

- [ ] **Arquivo .env.local configurado**
  - Existe: `frontend/.env.local`
  - Contém:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:3001
    ```

- [ ] **Servidor inicia sem erros**
  ```bash
  cd frontend
  pnpm run dev
  ```
  - Deve aparecer: `Ready in Xms` e `- Local: http://localhost:3000`
  - **DEIXAR RODANDO** para os testes

- [ ] **Aplicação carrega no navegador**
  - Abrir: http://localhost:3000
  - Deve mostrar: Tela inicial com 7 cards (incluindo Dashboard)

- [ ] **Console do navegador limpo**
  - Pressionar: F12
  - Aba Console não deve ter erros vermelhos críticos

---

## 📁 ARQUIVOS CRÍTICOS

- [ ] **Componentes existem**
  - `frontend/src/components/EstudoContratacao.tsx`
  - `frontend/src/components/TermoReferencia.tsx`
  - `frontend/src/components/ParecerJuridico.tsx`
  - `frontend/src/components/MinutaGenerator.tsx`
  - `frontend/src/components/ProposalGenerator.tsx`

- [ ] **Dashboard existe**
  - `frontend/src/app/dashboard/page.tsx`

- [ ] **API client existe**
  - `frontend/src/lib/api.ts`
  - Contém: `estudosApi`, `termosApi`, `pareceresApi`, `minutasApi`, `propostasApi`

- [ ] **Serviços backend existem**
  - `backend/src/documents/documents.service.ts`
  - Contém funções:
    - `generateEstudoDocx()`
    - `generateTermoDocx()`
    - `parseRichText()`

---

## 🔍 VERIFICAÇÃO RÁPIDA DE ERROS

### Comando: Verificar Erros TypeScript (Frontend)
```bash
cd frontend
pnpm run build
```
**Resultado esperado:** Build completa sem erros TypeScript

### Comando: Verificar Erros TypeScript (Backend)
```bash
cd backend
pnpm run build
```
**Resultado esperado:** Build completa sem erros

### Comando: Testar Conexão com Banco
```bash
cd backend
npx prisma db pull --schema=../prisma/schema.prisma
```
**Resultado esperado:** "Introspected X models and wrote them to ..."

---

## 🚦 STATUS FINAL

Conte quantos itens você marcou ✅:

- **35-38 itens ✅** → 🟢 **EXCELENTE** - Sistema 100% pronto para testes
- **30-34 itens ✅** → 🟡 **BOM** - Pequenos ajustes podem ser necessários
- **25-29 itens ✅** → 🟠 **ATENÇÃO** - Revisar configurações faltantes
- **< 25 itens ✅** → 🔴 **CRÍTICO** - Sistema não está pronto, revisar setup

---

## ⚡ TESTE RÁPIDO (2 MINUTOS)

Se todos os itens acima estão ✅, execute este teste rápido:

1. **Abrir:** http://localhost:3000
2. **Clicar:** Card "Estudo de Contratação"
3. **Preencher:** Município = "TESTE"
4. **Marcar:** Tópico 1
5. **Clicar:** "Salvar Estudo"
6. **Verificar:** Alerta "Estudo salvo com sucesso!"
7. **Voltar:** Home
8. **Clicar:** Card "📊 Dashboard de Documentos"
9. **Verificar:** Documento "TESTE" aparece na tabela
10. **Clicar:** "Excluir" e confirmar
11. **Verificar:** Documento desaparece

**✅ Se tudo funcionou:** Sistema está pronto! Prossiga para o [GUIA_DE_TESTES.md](GUIA_DE_TESTES.md)

**❌ Se algo falhou:** Revise o item correspondente neste checklist

---

## 🆘 PROBLEMAS COMUNS

### "Cannot connect to database"
- Verifique `DATABASE_URL` no `backend/.env`
- Senha do Supabase pode conter caracteres especiais que precisam ser escapados
- Exemplo: `Senh@123` deve ser `Senh%40123` (@ → %40)

### "Port 3000 already in use"
- Outro processo está usando a porta
- Solução: `npx kill-port 3000` ou mude a porta

### "Module not found"
- Execute `pnpm install` novamente
- Limpe cache: `pnpm store prune`

### "Prisma Client not generated"
- Execute: `npx prisma generate --schema=../prisma/schema.prisma`
- Verifique se `node_modules/@prisma/client` existe

---

## 📞 PRÓXIMOS PASSOS

Após completar este checklist:

1. ✅ **Todos os itens marcados?**
   → Prossiga para [GUIA_DE_TESTES.md](GUIA_DE_TESTES.md)

2. ⚠️ **Alguns itens falharam?**
   → Consulte [INSTRUCOES_SETUP.md](INSTRUCOES_SETUP.md)

3. ❓ **Dúvidas técnicas?**
   → Revise [IMPLEMENTACAO_COMPLETA.md](IMPLEMENTACAO_COMPLETA.md)

---

**Boa sorte nos testes! 🚀**
