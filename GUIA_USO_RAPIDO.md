# 🚀 GUIA DE USO RÁPIDO - 5 MINUTOS
**Kit de Inexigibilidade - Cavalcante Reis Advogados**

---

## ⚡ INÍCIO IMEDIATO

### Os Servidores Já Estão Rodando! ✅

- ✅ **Backend:** http://localhost:3001 (ATIVO)
- ✅ **Frontend:** http://localhost:3000 (ATIVO)
- ✅ **Banco de Dados:** Supabase (CONFIGURADO)

**Você pode começar a usar AGORA!**

---

## 📝 PASSO 1: ACESSAR O SISTEMA (30 segundos)

1. **Abrir navegador** (Chrome, Edge, Firefox)
2. **Ir para:** http://localhost:3000
3. **Fazer login:**
   - Email: qualquer (ex: admin@cavalcantereis.adv.br)
   - Senha: qualquer (ex: 123456)
4. **Clicar:** "Entrar"

✅ **Você verá:** Tela Home com 7 cards

---

## 📄 PASSO 2: CRIAR SEU PRIMEIRO DOCUMENTO (2 minutos)

### Opção A: Estudo de Contratação

1. **Clicar** no card **"Estudo de Contratação"**
2. **Preencher no painel lateral:**
   ```
   Município: MUNICÍPIO DE BARROCAS
   Processo: 005/2025
   ```
3. **Marcar tópicos** (exemplo):
   - ✅ 1. IDENTIFICAÇÃO DA DEMANDA
   - ✅ 2. CARACTERIZAÇÃO DO OBJETO
   - ✅ 5. LEVANTAMENTO DE MERCADO
4. **Preencher texto** de cada tópico marcado
5. **Clicar:** "Salvar Estudo"
6. **Aguardar:** Alerta "Estudo salvo com sucesso!"

### Opção B: Termo de Referência (Mais Rápido)

1. **Clicar** no card **"Termo de Referência"**
2. **Preencher no painel lateral:**
   ```
   Município: MUNICÍPIO DE SALVADOR
   Processo: 010/2025
   Responsável TR: João Silva
   Secretário: Maria Santos
   ```
3. **Clicar:** "Salvar Termo"
4. **Aguardar:** Alerta de sucesso

---

## 💾 PASSO 3: BAIXAR DOCUMENTO WORD (1 minuto)

1. **No mesmo editor**, clicar: **"Baixar DOCX"**
2. **Aguardar:** Botão mostra "Gerando..."
3. **Arquivo será baixado** automaticamente
4. **Abrir o arquivo** no Microsoft Word ou LibreOffice Writer

### ✅ O que você verá no Word:

- ✅ **Logo Barrocas** centralizada no topo
- ✅ **Dados do Contratante** sem negrito, centralizados
- ✅ **Conteúdo formatado** profissionalmente
- ✅ **Fonte Garamond** em todo documento
- ✅ **Assinatura** apenas na última página

---

## 📊 PASSO 4: VISUALIZAR NO DASHBOARD (1 minuto)

1. **Voltar** para Home (botão no canto superior)
2. **Clicar** no card **"📊 Dashboard de Documentos"**
3. **Ver lista** de documentos salvos
4. **Usar abas** para filtrar:
   - Estudos de Contratação
   - Termos de Referência
   - Pareceres Jurídicos
   - Minutas
   - Propostas

### Ações disponíveis:
- **Abrir** → Editar documento
- **Excluir** → Remover (com confirmação)

---

## 🎯 FUNCIONALIDADES PRINCIPAIS

### 1. Criar Documento ✍️
```
Home → Escolher Card → Preencher → Salvar
```

### 2. Editar Documento Existente 📝
```
Dashboard → Abrir → Modificar → Salvar
```

### 3. Exportar para Word 📄
```
Editor → Baixar DOCX → Abrir no Word
```

### 4. Deletar Documento 🗑️
```
Dashboard → Excluir → Confirmar
```

---

## 🔄 FLUXO DE TRABALHO TÍPICO

### Cenário: Criar Estudo de Contratação Completo

```
1. Login (http://localhost:3000)
   ↓
2. Clicar "Estudo de Contratação"
   ↓
3. Preencher:
   - Município: MUNICÍPIO DE BARROCAS
   - Processo: 005/2025
   - Ano: 2025
   - Responsável: Nome do Responsável
   ↓
4. Selecionar tópicos (ex: 1, 2, 5, 12)
   ↓
5. Preencher texto de cada tópico
   ↓
6. Clicar "Salvar Estudo"
   ↓
7. Ver alerta de sucesso
   ↓
8. Clicar "Baixar DOCX"
   ↓
9. Abrir arquivo Word
   ↓
10. Verificar formatação profissional ✅
```

**⏱️ Tempo total:** 10-15 minutos

---

## 💡 DICAS RÁPIDAS

### Formatação de Texto
Use `**texto**` para criar **negrito** no Word:
```
Exemplo:
"O município de **BARROCAS** contratará..."

Resultado no Word:
"O município de BARROCAS contratará..."
         (em negrito) ↑
```

### Salvar Regularmente
- Botão "Salvar" guarda no banco de dados
- Você pode fechar e abrir depois
- Dados não são perdidos

### Dashboard é seu Centro de Controle
- Veja todos os documentos em um só lugar
- Filtre por tipo usando as abas
- Ordena por data (mais recente primeiro)

### Múltiplos Documentos
Você pode ter vários documentos do mesmo tipo:
```
Estudo 1: BARROCAS - Processo 001/2025
Estudo 2: BARROCAS - Processo 002/2025
Estudo 3: SALVADOR - Processo 010/2025
```

---

## 🆘 RESOLUÇÃO RÁPIDA DE PROBLEMAS

### "Página não carrega"
**Solução:**
```bash
# Verificar se servidores estão rodando:
# Terminal 1 (Backend):
cd backend
pnpm run start:dev

# Terminal 2 (Frontend):
cd frontend
pnpm run dev
```

### "Erro ao salvar"
**Possíveis causas:**
- Backend offline → Reiniciar backend
- Banco não configurado → Verificar DATABASE_URL no backend/.env

### "Download não funciona"
**Solução:**
- Verificar se backend está rodando
- Tentar novamente após 5 segundos
- Verificar console do navegador (F12) para erros

### "Dashboard vazio"
**Normal se:**
- Você ainda não salvou nenhum documento
- Use botão "Criar Novo" para começar

---

## 📋 CHECKLIST DE PRIMEIRO USO

Use este checklist na primeira vez:

- [ ] Acessei http://localhost:3000
- [ ] Fiz login com sucesso
- [ ] Vi tela Home com 7 cards
- [ ] Criei meu primeiro documento
- [ ] Salvei no banco de dados
- [ ] Baixei arquivo DOCX
- [ ] Abri o Word e verifiquei:
  - [ ] Logo Barrocas aparece
  - [ ] Formatação está correta
  - [ ] Texto está centralizado
  - [ ] Assinatura só na última página
- [ ] Acessei o Dashboard
- [ ] Vi meu documento na lista
- [ ] Cliquei em "Abrir" e editei
- [ ] Testei o botão "Excluir"

**✅ Se marcou todos:** Sistema está 100% funcional!

---

## 🎓 PRÓXIMOS PASSOS

### Para Aprender Mais
1. **Teste todos os tipos de documento:**
   - [ ] Propostas
   - [ ] Minutas (30+ cláusulas)
   - [ ] Estudos de Contratação (12 tópicos)
   - [ ] Termos de Referência (13 cláusulas)
   - [ ] Pareceres Jurídicos

2. **Explore recursos avançados:**
   - Campos personalizados em cada editor
   - Preview em tempo real (Termo de Referência)
   - Navegação lateral por seções
   - Auto-complete de dados comuns

### Para Uso Profissional
1. Crie templates com seus dados padrão
2. Salve versões diferentes do mesmo documento
3. Use o Dashboard para organizar por cliente/processo
4. Exporte para Word e finalize manualmente se necessário

---

## 📞 SUPORTE

### Documentação Completa
- **Setup:** [INSTRUCOES_SETUP.md](INSTRUCOES_SETUP.md)
- **Testes:** [GUIA_DE_TESTES.md](GUIA_DE_TESTES.md)
- **Técnico:** [IMPLEMENTACAO_COMPLETA.md](IMPLEMENTACAO_COMPLETA.md)
- **Validação:** [RELATORIO_FINAL_VALIDACAO.md](RELATORIO_FINAL_VALIDACAO.md)

### Problemas Técnicos
1. Verifique [GUIA_DE_TESTES.md](GUIA_DE_TESTES.md) seção "Problemas Conhecidos"
2. Consulte [CHECKLIST_PRE_TESTES.md](CHECKLIST_PRE_TESTES.md)
3. Revise logs do terminal (backend e frontend)

---

## 🎉 PRONTO!

**Você agora sabe usar o Kit de Inexigibilidade!**

### Recap dos Comandos:

**Iniciar Sistema:**
```bash
# Terminal 1:
cd backend && pnpm run start:dev

# Terminal 2:
cd frontend && pnpm run dev
```

**Acessar:**
```
http://localhost:3000
```

**Fluxo Básico:**
```
Login → Home → Criar Documento → Salvar → Baixar Word ✅
```

---

**Desenvolvido com ❤️ para Cavalcante Reis Sociedade de Advogados**  
**CNPJ: 26.632.686/0001-27**

**Boa produção! 🚀**
