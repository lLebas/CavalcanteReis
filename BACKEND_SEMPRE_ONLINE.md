# Backend Sempre Online - Guia Completo

## 🎯 Objetivo

Ter o backend rodando **sempre**, sem precisar iniciar manualmente a cada vez que for testar o sistema. Assim você pode:
- Fazer build do frontend e testar
- Usar o sistema normalmente
- Não precisa rodar `npm run dev:backend` toda vez

## 🚀 Solução: Hospedar o Backend em um Serviço Cloud

### Opção 1: Railway (Recomendado) ⭐

Railway é a opção mais simples e confiável.

#### Passo a Passo:

1. **Acesse Railway:**
   - Vá para https://railway.app
   - Faça login com GitHub

2. **Crie Novo Projeto:**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Escolha seu repositório `CavalcanteReis`

3. **Configure o Serviço:**
   - Railway detectará automaticamente o NestJS
   - Se não detectar, configure manualmente:
     - **Root Directory:** `backend`
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm run start:prod`

4. **Adicione Variáveis de Ambiente:**
   - Na aba "Variables", adicione:
     ```
     PORT=3001
     FRONTEND_URL=https://seu-frontend.vercel.app,http://localhost:3000
     NODE_ENV=production
     ```
   - ⚠️ Substitua `seu-frontend.vercel.app` pela URL real do seu frontend na Vercel

5. **Railway Gerará uma URL:**
   - Exemplo: `https://cavalcante-reis-backend-production.up.railway.app`
   - Copie essa URL!

6. **Configure o Frontend:**
   - No Vercel, vá em Settings > Environment Variables
   - Adicione ou atualize:
     ```
     NEXT_PUBLIC_API_URL=https://cavalcante-reis-backend-production.up.railway.app
     ```
   - Faça um novo deploy do frontend

7. **Para Desenvolvimento Local:**
   - No arquivo `frontend/.env.local`, adicione:
     ```
     NEXT_PUBLIC_API_URL=https://cavalcante-reis-backend-production.up.railway.app
     ```
   - Ou use a URL do Railway mesmo para desenvolvimento

#### Vantagens do Railway:
- ✅ **Sempre online** - não dorme
- ✅ **Auto-deploy** quando você faz push no GitHub
- ✅ **Monitoramento automático** - reinicia se cair
- ✅ **Plano gratuito** inicial (depois pago conforme uso)

---

### Opção 2: Render

1. **Acesse Render:**
   - https://render.com
   - Faça login com GitHub

2. **Crie Novo Web Service:**
   - Conecte seu repositório
   - Configure:
     - **Name:** `cavalcante-reis-backend`
     - **Root Directory:** `backend`
     - **Environment:** `Node`
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm run start:prod`

3. **Variáveis de Ambiente:**
   ```
   PORT=3001
   FRONTEND_URL=https://seu-frontend.vercel.app
   NODE_ENV=production
   ```

4. **Render Gerará uma URL:**
   - Exemplo: `https://cavalcante-reis-backend.onrender.com`

5. **Configure o Frontend** (mesmo processo do Railway)

⚠️ **Atenção:** Render pode "dormir" após 15 minutos de inatividade no plano gratuito. Para evitar isso, considere usar Railway ou um plano pago.

---

### Opção 3: Fly.io

1. **Instale Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **No diretório backend:**
   ```bash
   cd backend
   fly launch
   ```

3. **Configure variáveis:**
   ```bash
   fly secrets set PORT=3001 FRONTEND_URL=https://seu-frontend.vercel.app NODE_ENV=production
   ```

---

## 📝 Após Hospedar o Backend

### 1. Atualize a Variável de Ambiente no Frontend

**No Vercel:**
- Settings > Environment Variables
- Adicione: `NEXT_PUBLIC_API_URL=https://sua-url-do-backend`

**No `.env.local` (desenvolvimento local):**
```env
NEXT_PUBLIC_API_URL=https://sua-url-do-backend
```

### 2. Teste a Conexão

Abra o console do navegador e verifique se não há erros de CORS ou conexão.

### 3. Faça Deploy do Frontend

```bash
npm run build
# Ou faça push para GitHub (Vercel faz deploy automático)
```

---

## 🔍 Verificando se Está Funcionando

1. **Backend:**
   - Acesse `https://sua-url-do-backend/api` (Swagger docs)
   - Deve mostrar a documentação da API

2. **Frontend:**
   - Tente gerar um DOCX
   - Se funcionar, está tudo conectado!

---

## 🆘 Troubleshooting

### Erro: "Erro ao conectar com o backend"

1. Verifique se a URL do backend está correta
2. Verifique se o backend está realmente rodando (acesse a URL no navegador)
3. Verifique CORS - o backend deve permitir a origem do frontend

### CORS Error

No `backend/src/main.ts`, certifique-se de que está configurado assim:

```typescript
const frontendUrls = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',') 
  : ['http://localhost:3000'];

app.enableCors({
  origin: frontendUrls,
  credentials: true,
});
```

E no Railway/Render, a variável `FRONTEND_URL` deve incluir:
- URL do Vercel (produção)
- `http://localhost:3000` (para testes locais)
- Separados por vírgula: `https://seu-app.vercel.app,http://localhost:3000`

---

## 💰 Custos

- **Railway:** Plano gratuito inicial, depois ~$5-20/mês conforme uso
- **Render:** Plano gratuito (mas dorme após inatividade), ou $7/mês para sempre online
- **Fly.io:** Plano gratuito generoso

Para desenvolvimento/testes, o plano gratuito geralmente é suficiente.

