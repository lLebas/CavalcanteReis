# Guia de Deploy na Vercel

## Configuração do Frontend (Vercel)

O arquivo `vercel.json` foi configurado para fazer build apenas do frontend Next.js.

### Passos para Deploy:

1. **Conecte o repositório na Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Conecte seu repositório GitHub
   - A Vercel detectará automaticamente o Next.js no diretório `frontend/`

2. **Configure as Variáveis de Ambiente:**
   No painel da Vercel, adicione a variável:
   ```
   NEXT_PUBLIC_API_URL=https://seu-backend-url.com
   ```
   ⚠️ **Importante:** Substitua `https://seu-backend-url.com` pela URL do seu backend em produção.

3. **Configurações do Projeto:**
   - **Root Directory:** `frontend` (já configurado no `vercel.json`)
   - **Framework Preset:** Next.js (detectado automaticamente)
   - **Build Command:** `cd frontend && npm install && npm run build` (já configurado)
   - **Output Directory:** `frontend/.next` (já configurado)

## Deploy do Backend (NestJS)

O backend NestJS **NÃO** pode ser deployado na Vercel. Você precisa usar outro serviço:

### Opções Recomendadas:

1. **Railway** (Recomendado - fácil e gratuito)
   - Acesse [railway.app](https://railway.app)
   - Conecte o repositório
   - Configure o diretório raiz como `backend/`
   - Adicione variáveis de ambiente se necessário
   - Railway detecta automaticamente o NestJS

2. **Render**
   - Acesse [render.com](https://render.com)
   - Crie um novo "Web Service"
   - Configure:
     - **Build Command:** `cd backend && npm install && npm run build`
     - **Start Command:** `cd backend && npm run start:prod`
     - **Root Directory:** `backend`

3. **Heroku**
   - Similar ao Render, mas com configuração manual

### Após Deploy do Backend:

1. Copie a URL do backend (ex: `https://seu-backend.railway.app`)
2. Volte na Vercel e atualize a variável `NEXT_PUBLIC_API_URL` com a URL do backend
3. Faça um novo deploy do frontend

## Estrutura de Deploy

```
Frontend (Next.js) → Vercel (porta automática)
Backend (NestJS)   → Railway/Render (porta automática)
```

## Testando o Deploy

1. Acesse a URL do frontend na Vercel
2. Verifique se o login funciona
3. Teste a geração de PDF (client-side, deve funcionar)
4. Teste a geração de DOCX (requer backend, verifique se a URL está correta)

## Troubleshooting

### Erro: "Cannot GET /"
- Verifique se está acessando a URL do **frontend** (Vercel), não do backend

### Erro: "Failed to fetch" ao gerar DOCX
- Verifique se `NEXT_PUBLIC_API_URL` está configurada corretamente na Vercel
- Verifique se o backend está rodando e acessível
- Verifique CORS no backend (deve permitir a origem da Vercel)

### Erro no Build: "nest: command not found"
- O `` vercel.jsonjá está configurado para fazer build apenas do frontend
- Se ainda der erro, verifique se o `rootDirectory` está como `frontend` no painel da Vercel

