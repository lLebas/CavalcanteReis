# 🧪 GUIA DE TESTES COMPLETO - KIT DE INEXIGIBILIDADE
# Cavalcante Reis Sociedade de Advogados

**Data:** 18 de Fevereiro de 2026
**Versão:** 1.0 - Release Candidate

---

## ✅ PRÉ-REQUISITOS ANTES DOS TESTES

### 1. Confirmar que o Backend está a correr
```bash
cd backend
pnpm run start:dev
```
✅ Deve aparecer: `Nest application successfully started on port 3001`

### 2. Confirmar que o Frontend está a correr
```bash
cd frontend
pnpm run dev
```
✅ Deve aparecer: `Ready on http://localhost:3000`

### 3. Confirmar que o Supabase está configurado
- ✅ Script `supabase-setup.sql` executado no SQL Editor
- ✅ 5 tabelas criadas (estudos_contratacao, termos_referencia, pareceres_juridicos, minutas, propostas)
- ✅ DATABASE_URL configurada no `backend/.env`

### 4. Confirmar que o Prisma Client foi gerado
```bash
cd backend
npx prisma generate --schema=../prisma/schema.prisma
```
✅ Deve aparecer: `✔ Generated Prisma Client`

---

## 📋 TESTE 1: FLUXO COMPLETO - ESTUDO DE CONTRATAÇÃO

### Objetivo
Validar o ciclo completo: criar → salvar → visualizar → carregar → exportar Word

### Passos

#### 1.1 Criar Novo Estudo
1. Abrir `http://localhost:3000`
2. Clicar no card **"Estudo de Contratação"**
3. Preencher campos obrigatórios:
   - **Município:** `MUNICÍPIO DE BARROCAS`
   - **Processo:** `005/2025`
4. Selecionar tópicos no painel lateral:
   - ✅ 1. IDENTIFICAÇÃO DA DEMANDA
   - ✅ 2. CARACTERIZAÇÃO DO OBJETO
   - ✅ 5. LEVANTAMENTO DE MERCADO
   - ✅ 12. DECLARAÇÃO DE VIABILIDADE
5. Preencher texto de cada tópico selecionado
6. Clicar em **"Salvar Estudo"**

**✅ Resultado Esperado:**
- Alerta: "Estudo salvo com sucesso!"
- Documento salvo no Supabase

#### 1.2 Visualizar no Dashboard
1. Voltar para Home (`http://localhost:3000`)
2. Clicar no card **"📊 Dashboard de Documentos"**
3. Clicar na aba **"Estudos de Contratação"**

**✅ Resultado Esperado:**
- Tabela mostra 1 documento
- Colunas: Município (BARROCAS), Processo (005/2025), Data de criação, Data de atualização
- Botões: "Abrir" e "Excluir"

#### 1.3 Carregar Documento Salvo
1. No Dashboard, clicar em **"Abrir"** no documento criado
2. Editor deve reabrir

**✅ Resultado Esperado:**
- Município: `MUNICÍPIO DE BARROCAS`
- Processo: `005/2025`
- Tópicos 1, 2, 5 e 12 estão **marcados** ✅
- Texto de cada tópico está **preenchido** com o conteúdo salvo

#### 1.4 Exportar para Word
1. Ainda no editor, clicar em **"Baixar DOCX"**
2. Abrir o arquivo `.docx` baixado no Microsoft Word ou LibreOffice

**✅ Resultado Esperado:**
- ✅ Logo de Barrocas aparece **centralizada** no topo
- ✅ "DADOS DO CONTRATANTE:" em **fonte normal** (não negrito), centralizado
- ✅ Nome do município **centralizado**, fonte normal
- ✅ Endereço centralizado, fonte normal (tamanho 11pt)
- ✅ Apenas os 4 tópicos selecionados aparecem (1, 2, 5, 12)
- ✅ **Assinatura aparece apenas na última página**
- ✅ Formatação profissional (fonte Garamond, espaçamentos corretos)

---

## 📋 TESTE 2: TERMO DE REFERÊNCIA

### Objetivo
Validar geração de documento com 13 cláusulas estruturadas

### Passos

#### 2.1 Criar Novo Termo
1. Home → Clicar **"Termo de Referência"**
2. Preencher no painel lateral:
   - **Município:** `MUNICÍPIO DE SALVADOR`
   - **Processo:** `010/2025`
   - **Endereço:** `Av. Sete de Setembro, 100 - Centro`
   - **Responsável TR:** `João Silva`
   - **Secretário:** `Maria Santos`
3. Clicar **"Salvar Termo"**

**✅ Resultado Esperado:**
- Alerta: "Termo salvo com sucesso!"

#### 2.2 Exportar para Word
1. Clicar **"Baixar DOCX"**
2. Abrir arquivo no Word

**✅ Resultado Esperado:**
- ✅ Logo em **todas as páginas** (no header)
- ✅ 13 cláusulas completas renderizadas
- ✅ Estrutura de subitens (1.1, 1.2, etc.) formatada corretamente
- ✅ Texto com **negrito** onde há marcações `**texto**`
- ✅ Assinatura **apenas na última página**
- ✅ Caixa de "APROVO" no final

---

## 📋 TESTE 3: DASHBOARD - GESTÃO DE DOCUMENTOS

### Objetivo
Validar funcionalidades de listagem, filtragem e exclusão

### Passos

#### 3.1 Filtrar por Tipo
1. Abrir Dashboard (`http://localhost:3000/dashboard`)
2. Clicar em cada aba:
   - Estudos de Contratação
   - Termos de Referência
   - Pareceres Jurídicos
   - Minutas
   - Propostas

**✅ Resultado Esperado:**
- Cada aba mostra apenas documentos do tipo correspondente
- Tabs mudam de cor quando selecionadas (azul)
- Loading spinner aparece durante carregamento

#### 3.2 Excluir Documento
1. Na aba "Estudos de Contratação", clicar **"Excluir"**
2. Confirmar na janela de confirmação

**✅ Resultado Esperado:**
- Janela de confirmação: "Tem certeza que deseja excluir este documento?"
- Após confirmação, documento **desaparece da lista**
- Documento **removido do banco de dados**

#### 3.3 Estado Vazio
1. Se não houver documentos numa aba, verificar a mensagem

**✅ Resultado Esperado:**
- Ícone de documento cinza
- Texto: "Nenhum documento encontrado"
- Botão: "Criar Novo" (leva para o editor correspondente)

---

## 📋 TESTE 4: VERIFICAÇÃO DE CONSISTÊNCIA (BACKEND)

### Objetivo
Validar funções de geração de documentos no backend

### Passos

#### 4.1 Verificar parseRichText
1. Abrir `backend/src/documents/documents.service.ts`
2. Procurar função `parseRichText`
3. Confirmar que converte `**texto**` para negrito

**✅ Código deve ter:**
```typescript
parseRichText(text: string, font: string, size: number): TextRun[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map(part => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return new TextRun({
        text: part.slice(2, -2),
        font: font,
        size: size,
        bold: true,
      });
    }
    // ... texto normal
  });
}
```

#### 4.2 Verificar Centralização
1. Procurar `generateEstudoDocx`
2. Confirmar parágrafos com `alignment: AlignmentType.CENTER`

**✅ Logo, título e dados do contratante devem ter:**
```typescript
alignment: AlignmentType.CENTER,
```

#### 4.3 Verificar Fonte Normal (Sem Negrito)
1. Procurar seção "DADOS DO CONTRATANTE"
2. Confirmar que **NÃO** tem `bold: true`

**✅ Deve ter:**
```typescript
new TextRun({
  text: 'MUNICÍPIO DE...',
  font: 'Garamond',
  size: 22, // ou 24
  // NÃO TEM: bold: true
}),
```

---

## 📋 TESTE 5: GESTÃO DE ERROS

### Objetivo
Validar comportamento em situações de erro

### Passos

#### 5.1 Tentar Salvar sem Município
1. Abrir Estudo de Contratação
2. **Limpar campo "Município"** (deixar vazio)
3. Clicar "Salvar Estudo"

**✅ Resultado Esperado:**
- Backend retorna erro 400 ou 500
- Frontend mostra alerta: "Erro ao salvar"
- OU: Validação frontend impede envio

#### 5.2 Abrir ID Inexistente
1. Na barra de endereços, ir para:
   `http://localhost:3000/estudo-contratacao?id=00000000-0000-0000-0000-000000000000`

**✅ Resultado Esperado:**
- Editor abre vazio (formulário limpo)
- OU: Mensagem de erro: "Documento não encontrado"
- OU: Redirecionamento para Dashboard

#### 5.3 Backend Offline
1. Parar o backend (`Ctrl+C` no terminal)
2. Tentar salvar um documento no frontend

**✅ Resultado Esperado:**
- Loading infinito OU
- Alerta: "Erro de conexão" / "Network Error"

---

## 📋 TESTE 6: VALIDAÇÃO VISUAL - WORD

### Objetivo
Confirmar que documentos Word estão profissionais

### Checklist para Estudo de Contratação

**Cabeçalho:**
- ✅ Logo Barrocas centralizada (não redimensionada demais)
- ✅ Espaçamento de ~30pt após logo
- ✅ "DADOS DO CONTRATANTE:" centralizado, fonte normal
- ✅ Município centralizado, fonte normal (12pt)
- ✅ Endereço centralizado, fonte menor (11pt)

**Corpo:**
- ✅ Tópicos aparecem na ordem correta
- ✅ Títulos em negrito (tamanho 13pt)
- ✅ Texto justificado, espaçamento 1.15
- ✅ Margens: 2.5cm (superior), 2.0cm (inferior), 3.0cm (esquerda), 2.0cm (direita)

**Rodapé:**
- ✅ Assinatura APENAS na última página
- ✅ Linha de assinatura com 300px de largura
- ✅ Nome do responsável em negrito
- ✅ Cargo em fonte menor

### Checklist para Termo de Referência

**Header:**
- ✅ Logo em TODAS as páginas (não só na primeira)

**Cláusulas:**
- ✅ 13 cláusulas completas (1 a 13)
- ✅ Subitens numerados (1.1, 1.2, ...)
- ✅ Texto com negrito onde há `**`
- ✅ Estrutura de páginas conforme PAGE_GROUPS

**Finalização:**
- ✅ Texto "E assim justos..."
- ✅ Data de assinatura preenchida
- ✅ 2 linhas de assinatura (Responsável + Secretário)
- ✅ Caixa "APROVO" com borda preta

---

## 📋 TESTE 7: PERFORMANCE E USABILIDADE

### Objetivo
Validar experiência do usuário

### Métricas

#### 7.1 Tempo de Carregamento
- ✅ Dashboard carrega em < 2 segundos
- ✅ Editor abre em < 1 segundo
- ✅ Geração de Word em < 5 segundos

#### 7.2 Feedback Visual
- ✅ Botões mostram "Salvando..." / "Gerando..." durante processamento
- ✅ Loading spinners aparecem quando necessário
- ✅ Cores mudam em hover nos botões

#### 7.3 Navegação
- ✅ Botão "Voltar ao Início" funciona
- ✅ Cards clicáveis na Home levam para editores corretos
- ✅ Links de "Abrir" no Dashboard carregam documento correto

---

## 🐛 PROBLEMAS CONHECIDOS E SOLUÇÕES

### Problema 1: Logo não aparece no Word
**Sintoma:** Documento abre sem imagem
**Solução:**
1. Confirmar que existe `public/barrocas.png` na raiz
2. Verificar caminho no código:
   ```typescript
   fs.readFileSync(path.join(__dirname, '../../public/barrocas.png'))
   ```

### Problema 2: Erro "Cannot connect to database"
**Sintoma:** Backend não inicia ou erro ao salvar
**Solução:**
1. Verificar `DATABASE_URL` no `backend/.env`
2. Testar conexão: `npx prisma db pull`
3. Verificar senha do Supabase (caracteres especiais devem ser escapados)

### Problema 3: Documento exporta mas está vazio
**Sintoma:** Word abre mas sem conteúdo
**Solução:**
1. Verificar console do backend (provavelmente erro na geração)
2. Confirmar que `topicos` ou `clausulas` foram enviados corretamente
3. Adicionar logs: `console.log('Dados recebidos:', dados)`

### Problema 4: Dashboard não mostra documentos
**Sintoma:** Tabela vazia mesmo com documentos no banco
**Solução:**
1. Abrir console do navegador (F12)
2. Verificar erro de CORS ou Network
3. Confirmar que backend está em `http://localhost:3001`
4. Testar API direto: `http://localhost:3001/estudos`

---

## 📊 RELATÓRIO DE TESTES

Preencher após completar todos os testes:

```
# RELATÓRIO DE VALIDAÇÃO - KIT DE INEXIGIBILIDADE

## Testes Executados
- [ ] TESTE 1: Fluxo Completo - Estudo de Contratação
- [ ] TESTE 2: Termo de Referência
- [ ] TESTE 3: Dashboard - Gestão de Documentos
- [ ] TESTE 4: Verificação de Consistência (Backend)
- [ ] TESTE 5: Gestão de Erros
- [ ] TESTE 6: Validação Visual - Word
- [ ] TESTE 7: Performance e Usabilidade

## Problemas Encontrados
1. [Descrever problema]
   - Solução: [O que foi feito]

## Status Final
- [ ] ✅ APROVADO - Sistema pronto para produção
- [ ] ⚠️ APROVADO COM RESSALVAS - Pequenos ajustes necessários
- [ ] ❌ REPROVADO - Problemas críticos encontrados

## Observações
[Comentários adicionais]

---
Testado por: _______________________
Data: 18/02/2026
```

---

## 🎯 CRITÉRIOS DE APROVAÇÃO

Para que o sistema seja considerado **PRONTO PARA PRODUÇÃO**, deve:

### Funcionalidades Essenciais
- ✅ Salvar documentos no Supabase
- ✅ Carregar documentos salvos
- ✅ Exportar Word com formatação profissional
- ✅ Dashboard com listagem e exclusão
- ✅ Logo aparece nos documentos

### Qualidade Visual
- ✅ Documentos Word sem erros de formatação
- ✅ Texto centralizado onde deve
- ✅ Fonte normal (sem negrito indevido)
- ✅ Assinatura apenas na última página

### Estabilidade
- ✅ Sem erros no console do navegador
- ✅ Sem crashes do backend
- ✅ Validação de campos obrigatórios
- ✅ Mensagens de erro amigáveis

---

## 🚀 PRÓXIMOS PASSOS APÓS APROVAÇÃO

1. **Deploy em Produção**
   - Backend: Railway, Render ou Heroku
   - Frontend: Vercel
   - Banco: Supabase (já em produção)

2. **Documentação de Usuário**
   - Manual de uso para advogados
   - Vídeo tutorial de 5 minutos

3. **Features Futuras**
   - [ ] Exportação direta para PDF
   - [ ] Assinatura digital integrada
   - [ ] Logs de atividade
   - [ ] Busca avançada no Dashboard
   - [ ] Templates personalizáveis
   - [ ] Multi-usuário com permissões

---

**Desenvolvido com ❤️ para Cavalcante Reis Sociedade de Advogados**
**CNPJ: 26.632.686/0001-27**
