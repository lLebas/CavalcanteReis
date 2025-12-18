# 📦 Como Instalar as Dependências

## 🪟 Windows

### Método 1: Duplo Clique (Mais Fácil)

1. Abra o **Explorador de Arquivos** (Windows Explorer)
2. Navegue até a pasta do projeto: `H:\Serviçõs\LiviaAdvogados\CavalcanteReis`
3. Procure o arquivo `install-all.bat`
4. **Dê duplo clique** nele
5. Uma janela do terminal vai abrir e instalar tudo automaticamente
6. Aguarde até aparecer "Instalação concluída com sucesso!"

### Método 2: Pelo Terminal (CMD)

1. Abra o **Prompt de Comando** (CMD)
2. Navegue até a pasta:
   ```cmd
   cd /d "H:\Serviçõs\LiviaAdvogados\CavalcanteReis"
   ```
3. Execute:
   ```cmd
   install-all.bat
   ```

### Método 3: Pelo Git Bash

1. Abra o **Git Bash**
2. Navegue até a pasta:
   ```bash
   cd "/h/Serviçõs/LiviaAdvogados/CavalcanteReis"
   ```
3. Execute:
   ```bash
   ./install-all.bat
   ```

### Método 4: Manual (Se os scripts não funcionarem)

Abra o terminal e execute cada comando:

```bash
# 1. Instalar dependências do monorepo
npm install

# 2. Instalar dependências do backend
cd backend
npm install
cd ..

# 3. Instalar dependências do frontend
cd frontend
npm install
cd ..
```

## ⏱️ Tempo de Instalação

- **Primeira vez**: 3-5 minutos (depende da internet)
- **Próximas vezes**: Mais rápido (usa cache)

## ✅ Como Saber se Funcionou

Após a instalação, você verá:
```
========================================
  Instalação concluída com sucesso!
========================================

Agora você pode rodar: npm run dev
```

## 🚀 Depois de Instalar

Execute:
```bash
npm run dev
```

Isso vai iniciar:
- ✅ Backend NestJS na porta **3001**
- ✅ Frontend Next.js na porta **3000**

## ❌ Se Der Erro

### Erro: "npm não é reconhecido"
- Instale o Node.js: https://nodejs.org/
- Versão recomendada: 18 ou superior

### Erro: "Pasta não encontrada"
- Certifique-se de estar na pasta correta do projeto
- Verifique se as pastas `backend/` e `frontend/` existem

### Erro: "Falha ao instalar"
- Verifique sua conexão com a internet
- Tente novamente (às vezes é problema temporário do npm)

## 📞 Precisa de Ajuda?

Se nada funcionar, tente instalar manualmente:

1. Abra 3 terminais diferentes
2. No Terminal 1 (raiz do projeto):
   ```bash
   npm install
   ```
3. No Terminal 2 (pasta backend):
   ```bash
   cd backend
   npm install
   ```
4. No Terminal 3 (pasta frontend):
   ```bash
   cd frontend
   npm install
   ```

