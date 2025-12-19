# Guia para Adicionar Arquivos ao Git

## Situação Atual

O GitHub Desktop está mostrando que há arquivos não rastreados (untracked files) na pasta `CavalcanteReis/`.

## Solução Rápida

### Opção 1: Usar o Script Automático (Recomendado)

Execute o arquivo `git-add-files.bat` que foi criado. Ele vai adicionar automaticamente todos os arquivos importantes ao Git.

### Opção 2: Usar GitHub Desktop

1. Abra o GitHub Desktop
2. Na aba "Changes", você verá os arquivos não rastreados
3. Selecione os arquivos que deseja adicionar:
   - `frontend/src/app/icon.svg` (novo favicon)
   - `frontend/src/components/ProposalGenerator.tsx` (atualizado)
   - `frontend/src/app/layout.tsx` (atualizado)
   - `frontend/src/app/globals.css` (estilos restaurados)
   - Outros arquivos de configuração
4. Clique em "Stage All" ou selecione arquivos individuais
5. Escreva uma mensagem de commit, por exemplo:
   ```
   feat: atualizações do sistema - migração para Next.js e NestJS
   ```
6. Clique em "Commit to main" (ou no branch atual)

### Opção 3: Usar Terminal Git

```bash
# Adicionar todos os arquivos novos e modificados
git add .

# Ou adicionar arquivos específicos
git add frontend/src/app/icon.svg
git add frontend/src/components/ProposalGenerator.tsx
git add frontend/src/app/layout.tsx
git add frontend/src/app/globals.css

# Verificar o que será commitado
git status

# Fazer commit
git commit -m "feat: atualizações do sistema - migração para Next.js e NestJS"
```

## Arquivos Importantes que Devem Ser Adicionados

### Novos Arquivos:
- ✅ `frontend/src/app/icon.svg` - Novo favicon
- ✅ `install-all.bat` - Script de instalação Windows
- ✅ `install-all.sh` - Script de instalação Linux/Mac

### Arquivos Modificados:
- ✅ `frontend/src/components/ProposalGenerator.tsx` - Componente principal atualizado
- ✅ `frontend/src/app/layout.tsx` - Layout atualizado
- ✅ `frontend/src/app/globals.css` - Estilos restaurados
- ✅ `frontend/src/app/page.tsx` - Página principal com loading
- ✅ `frontend/package.json` - Dependências atualizadas
- ✅ `backend/src/documents/documents.service.ts` - Serviço de documentos
- ✅ `backend/src/documents/documents.controller.ts` - Controller de documentos

## Arquivos que NÃO Devem Ser Adicionados (já no .gitignore)

- ❌ `node_modules/` - Dependências (não versionar)
- ❌ `.next/` - Build do Next.js
- ❌ `dist/` - Build do Vite
- ❌ `.env` - Variáveis de ambiente
- ❌ Arquivos de backup

## Próximos Passos

Após adicionar os arquivos:

1. **Commit local**: Salvar as mudanças localmente
2. **Push**: Enviar para o repositório remoto (GitHub)
   - No GitHub Desktop: Clique em "Push origin"
   - No terminal: `git push origin main` (ou o branch atual)

## Resolver Conflitos (se houver)

Se houver conflitos ao fazer push:

1. No GitHub Desktop: Clique em "Pull origin" primeiro
2. Resolva os conflitos manualmente
3. Faça commit novamente
4. Faça push

