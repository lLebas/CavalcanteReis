# Guia de Migração - Vite/React → Next.js/NestJS

## ✅ O que já foi migrado

### Backend (NestJS)
- ✅ Estrutura completa do NestJS
- ✅ Módulo de Propostas (CRUD completo)
- ✅ Módulo de Documents (processamento DOCX)
- ✅ Swagger/OpenAPI configurado
- ✅ CORS configurado para Next.js
- ✅ Validação com class-validator

### Frontend (Next.js)
- ✅ Estrutura do Next.js 14 (App Router)
- ✅ Componente Login (TypeScript)
- ✅ Componente Modal (TypeScript)
- ✅ API Client (Axios) configurado
- ✅ Configuração TypeScript completa

## 🔄 O que precisa ser migrado

### Componentes Frontend

1. **Home.tsx** - Converter de `src/Home.jsx`
2. **ProposalGenerator.tsx** - Converter de `src/ProposalGenerator.jsx` (arquivo grande, ~2400 linhas)

### Passos para migrar os componentes restantes

1. **Copiar arquivos públicos:**
   ```bash
   cp -r public/* frontend/public/
   ```

2. **Converter Home.jsx para Home.tsx:**
   - Adicionar tipos TypeScript
   - Converter props para interfaces
   - Manter toda a lógica existente

3. **Converter ProposalGenerator.jsx para ProposalGenerator.tsx:**
   - Este é o arquivo mais complexo
   - Adicionar tipos para todos os estados
   - Converter todas as funções para TypeScript
   - Manter toda a lógica de geração de PDF/DOCX

### Exemplo de conversão

**Antes (JSX):**
```jsx
function Home({ onNavigate, onLogout }) {
  const [showModal, setShowModal] = useState(false);
  // ...
}
```

**Depois (TSX):**
```tsx
interface HomeProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

function Home({ onNavigate, onLogout }: HomeProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  // ...
}
```

## 🚀 Como começar

1. **Instalar dependências:**
   ```bash
   npm run install:all
   ```

2. **Configurar variáveis de ambiente:**
   - Backend: `backend/.env`
   - Frontend: `frontend/.env.local`

3. **Rodar em desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Migrar componentes restantes:**
   - Copiar `src/Home.jsx` → `frontend/src/components/Home.tsx`
   - Copiar `src/ProposalGenerator.jsx` → `frontend/src/components/ProposalGenerator.tsx`
   - Adicionar tipos TypeScript conforme necessário

## 📝 Notas Importantes

- O ProposalGenerator usa muitas bibliotecas (docx, jspdf, html2canvas, etc.) - todas já estão no package.json
- As imagens públicas precisam ser copiadas para `frontend/public/`
- O localStorage pode continuar funcionando, mas considere migrar para a API do backend
- A geração de PDF/DOCX deve continuar funcionando igual

## 🔧 Troubleshooting

### Erro de tipos TypeScript
- Adicione `// @ts-ignore` temporariamente se necessário
- Ou defina tipos mais específicos

### Erro de importação
- Verifique se os caminhos estão corretos (`@/components/...`)
- Verifique se os arquivos estão na pasta correta

### API não conecta
- Verifique se o backend está rodando na porta 3001
- Verifique a variável `NEXT_PUBLIC_API_URL`

