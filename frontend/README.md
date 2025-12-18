# Frontend - Next.js + TypeScript

Este é o frontend do sistema de propostas advocatícias, construído com Next.js 14 e TypeScript.

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

O app estará disponível em [http://localhost:3000](http://localhost:3000)

## Build para Produção

```bash
npm run build
npm start
```

## Estrutura

- `src/app/` - Páginas e layouts do Next.js (App Router)
- `src/components/` - Componentes React reutilizáveis
- `src/lib/` - Utilitários e configurações (API client, etc.)
- `public/` - Arquivos estáticos (imagens, etc.)

## Variáveis de Ambiente

Crie um arquivo `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

