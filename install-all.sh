#!/bin/bash
echo "📦 Instalando todas as dependências..."
echo ""

echo "[1/3] Instalando dependências do monorepo..."
npm install || exit 1

echo ""
echo "[2/3] Instalando dependências do backend..."
cd backend && npm install || exit 1
cd ..

echo ""
echo "[3/3] Instalando dependências do frontend..."
cd frontend && npm install || exit 1
cd ..

echo ""
echo "✅ Todas as dependências instaladas com sucesso!"
echo ""
echo "🚀 Agora você pode rodar: npm run dev"

