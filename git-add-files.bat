@echo off
echo Adicionando arquivos ao Git...
echo.

REM Adiciona o novo arquivo de ícone
git add frontend/src/app/icon.svg

REM Adiciona mudanças no ProposalGenerator
git add frontend/src/components/ProposalGenerator.tsx

REM Adiciona outros arquivos importantes que podem estar faltando
git add frontend/src/app/layout.tsx
git add frontend/src/app/globals.css
git add frontend/src/app/page.tsx

REM Adiciona scripts de instalação
git add install-all.bat
git add install-all.sh

REM Adiciona arquivos de configuração do backend
git add backend/package.json
git add backend/tsconfig.json
git add backend/nest-cli.json

REM Adiciona arquivos de configuração do frontend
git add frontend/package.json
git add frontend/tsconfig.json
git add frontend/next.config.js

REM Adiciona package.json da raiz
git add package.json

echo.
echo Arquivos adicionados! Verifique o status:
git status --short

echo.
echo Para fazer commit, use:
echo   git commit -m "feat: atualizacoes do sistema - migracao para Next.js e NestJS"
pause

