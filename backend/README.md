# Backend - NestJS + TypeScript

Este é o backend do sistema de propostas advocatícias, construído com NestJS e TypeScript.

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run start:dev
```

O servidor estará disponível em [http://localhost:3001](http://localhost:3001)
A documentação Swagger estará em [http://localhost:3001/api](http://localhost:3001/api)

## Build para Produção

```bash
npm run build
npm run start:prod
```

## Estrutura

- `src/propostas/` - Módulo de propostas (CRUD)
- `src/documents/` - Módulo de processamento de documentos
- `data/` - Armazenamento local de dados (JSON)

## Variáveis de Ambiente

Crie um arquivo `.env`:

```
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Propostas
- `GET /propostas` - Listar todas as propostas
- `GET /propostas/:id` - Buscar proposta por ID
- `POST /propostas` - Criar nova proposta
- `PUT /propostas/:id` - Atualizar proposta
- `DELETE /propostas/:id` - Deletar proposta

### Documents
- `POST /documents/process-docx` - Processar arquivo DOCX

