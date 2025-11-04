#!/bin/bash
# Script para configurar Node.js no Git Bash

# Define o PATH temporariamente para este terminal
export PATH="/c/Program Files/nodejs:$PATH"

# Testa se funciona
echo "Testando instalação..."
node -v
npm -v

echo ""
echo "✅ Se as versões apareceram acima, execute agora:"
echo "   npm install"
