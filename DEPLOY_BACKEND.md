# Guia de Deploy do Backend - Sempre Online

## Opção 1: Railway (Recomendado) 🚀

### Por que Railway?
- ✅ **Sempre online** - Não dorme após inatividade
- ✅ **Auto-deploy** via GitHub
- ✅ **Health checks** automáticos
- ✅ **Auto-restart** em caso de falha
- ✅ **Plano gratuito** inicial (depois pago conforme uso)

### Passos para Deploy:

1. **Acesse Railway:**
   - Vá para [railway.app](https://railway.app)
   - Faça login com GitHub

2. **Crie um Novo Projeto:**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Escolha seu repositório

3. **Configure o Serviço:**
   - Railway detectará automaticamente o backend
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`

4. **Configure Variáveis de Ambiente:**
   - Na aba "Variables", adicione:
     ```
     PORT=3001
     FRONTEND_URL=https://seu-frontend-vercel.vercel.app
     NODE_ENV=production
     ```

5. **Configure Domínio:**
   - Railway gerará uma URL automaticamente
   - Exemplo: `https://seu-backend-production.up.railway.app`
   - Você pode adicionar um domínio customizado se quiser

6. **Atualize o Frontend:**
   - No Vercel, adicione variável de ambiente:
     ```
     NEXT_PUBLIC_API_URL=https://seu-backend-production.up.railway.app
     ```
   - Ou atualize o código para usar essa URL

7. **Monitoramento:**
   - Railway monitora automaticamente
   - Se o backend cair, ele reinicia automaticamente
   - Você pode ver logs em tempo real no dashboard

---

## Opção 2: Render 🌐

### Configuração:

1. **Acesse Render:**
   - Vá para [render.com](https://render.com)
   - Faça login com GitHub

2. **Crie um Web Service:**
   - New → Web Service
   - Conecte seu repositório

3. **Configure:**
   - **Name:** `cavalcante-reis-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Plan:** Free (pode dormir) ou Starter (sempre online)

4. **Variáveis de Ambiente:**
   ```
   PORT=3001
   FRONTEND_URL=https://seu-frontend-vercel.vercel.app
   NODE_ENV=production
   ```

**⚠️ Importante:** O plano gratuito do Render pode colocar o serviço para "dormir" após 15 minutos de inatividade. Para manter sempre online, use o plano Starter ($7/mês).

---

## Opção 3: Fly.io ✈️

### Configuração:

1. **Instale o Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **No diretório backend, crie o app:**
   ```bash
   fly launch
   ```

4. **Configure o fly.toml:**
   ```toml
   app = "seu-app-name"
   
   [build]
     builder = "paketobuildpacks/builder:base"
   
   [http_service]
     internal_port = 3001
     force_https = true
     auto_stop_machines = false
     auto_start_machines = true
     min_machines_running = 1
   ```

5. **Deploy:**
   ```bash
   fly deploy
   ```

---

## Opção 4: Adaptar para Vercel Serverless Functions (Sem Backend Separado)

Se você quiser eliminar completamente a dependência do backend, podemos migrar a geração de DOCX para o frontend usando a biblioteca `docx` que já está instalada. Isso simplificaria muito o deploy.

---

## Recomendação Final 🎯

**Use Railway** porque:
- Mantém sempre online mesmo no plano gratuito inicial
- Muito fácil de configurar
- Monitoramento automático
- Preço justo conforme uso

### Checklist após Deploy:

- [ ] Backend rodando no Railway
- [ ] URL do backend copiada
- [ ] Variável `NEXT_PUBLIC_API_URL` configurada no Vercel
- [ ] Teste de geração de DOCX funcionando
- [ ] Verificar CORS permitindo a origem do Vercel

### URLs para Atualizar:

1. **No Vercel (Frontend):**
   - Settings → Environment Variables
   - Adicionar: `NEXT_PUBLIC_API_URL=https://seu-backend.railway.app`

2. **No Railway (Backend):**
   - Settings → Variables
   - Adicionar: `FRONTEND_URL=https://seu-frontend.vercel.app`

---

## Troubleshooting

### Backend não inicia:
- Verifique os logs no Railway
- Confirme que `npm run build` está funcionando localmente
- Verifique se a porta está usando `process.env.PORT`

### Erro de CORS:
- Confirme que `FRONTEND_URL` está configurado corretamente
- No desenvolvimento, pode usar `*` temporariamente

### Backend cai após alguns minutos:
- Railway mantém sempre online
- Render (plano free) dorme após 15 min
- Fly.io com `auto_stop_machines = false` mantém sempre online

