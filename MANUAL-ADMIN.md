# 👨‍💼 Manual do Administrador - AMCRS

## 📚 Índice
1. [Primeiro Acesso](#primeiro-acesso)
2. [Fluxo Mensal de Trabalho](#fluxo-mensal)
3. [Gestão de Moradores](#moradores)
4. [Gestão de Períodos](#periodos)
5. [Controle de Pagamentos](#pagamentos)
6. [Problemas Comuns](#problemas)
7. [Dicas e Boas Práticas](#dicas)

---

## 🔐 Primeiro Acesso

### Login
1. Acesse o sistema
2. Clique em **"Administrador"**
3. Digite seu **email** e **senha** (criados no Supabase)
4. Clique em **"Entrar"**

### O que você verá:
- **3 abas principais:**
  - 👥 Moradores
  - 📅 Períodos e Consumo
  - 💰 Pagamentos

---

## 📅 Fluxo Mensal de Trabalho

### Todo mês você deve:

#### 1. Criar Novo Período (Dia 1-5)
```
Aba: Períodos e Consumo
Ação: Novo Período
Preencha:
- Mês: Janeiro (exemplo)
- Ano: 2025
- Valor Total: R$ 2.500,00 (valor da conta que chegou)
```

#### 2. Lançar Consumo Individual (Dia 5-10)
```
Aba: Períodos e Consumo
Selecione: O período criado
Para cada morador:
- Digite o consumo em m³ (exemplo: 15.5)
- O sistema está em ordem alfabética
```

#### 3. Calcular Valores (Dia 10)
```
Aba: Períodos e Consumo
Ação: Calcular Valores
✅ Sistema divide automaticamente proporcional ao consumo
```

#### 4. Avisar Moradores (Dia 10)
```
Envie mensagem no WhatsApp:

"🌊 CONTA DE ÁGUA - [MÊS/ANO]

Disponível para pagamento via PIX!

Acesse: [LINK DO SISTEMA]
Digite o número da sua chácara
Valor: Calculado automaticamente

Vencimento: [DATA]

Qualquer dúvida, entre em contato!"
```

#### 5. Acompanhar Pagamentos (Diário)
```
Aba: Pagamentos
- Veja quem já pagou (verde)
- Veja quem está pendente (vermelho)
- Envie lembretes se necessário
```

---

## 👥 Gestão de Moradores

### Cadastrar Novo Morador

1. **Aba:** Moradores
2. **Clique:** Novo Morador
3. **Preencha:**
   - Número da Chácara: `01` (use sempre 2 dígitos: 01, 02, 15, etc)
   - Nome Completo: `João da Silva`
   - Telefone: `(62) 99999-9999` (opcional)
4. **Clique:** Cadastrar

### Desativar Morador

Quando alguém sai:
1. Clique no ícone **👤** (ativar/desativar)
2. O morador fica inativo mas mantém histórico
3. Não aparecerá mais nos novos lançamentos

### Remover Morador Permanentemente

⚠️ **CUIDADO:** Remove todo o histórico!
1. Clique no ícone **🗑️** (lixeira)
2. Confirme a exclusão
3. **Não pode ser desfeito!**

### Dica:
- Use desativação ao invés de remover
- Mantenha o histórico para prestação de contas

---

## 📅 Gestão de Períodos

### Criar Período

**Quando:** Todo início de mês quando a conta chega

1. **Aba:** Períodos e Consumo
2. **Clique:** Novo Período
3. **Preencha:**
   - Mês: Selecione o mês
   - Ano: Digite o ano
   - Valor Total: Valor exato da conta (ex: 2847.50)
4. **Clique:** Criar Período

### Lançar Consumo

1. **Selecione o período** na lista à esquerda
2. Para cada morador, **digite o consumo em m³**
   - Exemplo: 15.50
   - Sempre use ponto decimal (não vírgula)
3. **Clique:** Calcular Valores

### Como funciona o cálculo:

```
Exemplo prático:

Valor Total da Conta: R$ 3.000,00

Consumos:
- Chácara 01: 10 m³
- Chácara 02: 20 m³  
- Chácara 03: 15 m³
Total: 45 m³

Cálculo:
- Chácara 01: (10 / 45) × R$ 3.000 = R$ 666,67
- Chácara 02: (20 / 45) × R$ 3.000 = R$ 1.333,33
- Chácara 03: (15 / 45) × R$ 3.000 = R$ 1.000,00
```

### Editar Consumo

1. Selecione o período
2. Altere o valor no campo
3. Clique novamente em "Calcular Valores"
4. Os valores serão recalculados automaticamente

---

## 💰 Controle de Pagamentos

### Visualizar Status

**Aba:** Pagamentos

**Cores:**
- 🟢 Verde = Pago
- 🔴 Vermelho = Pendente

### Cards no Topo:
- **Valor Total:** Valor da conta do mês
- **Total Pago:** Quanto já foi pago
- **Total Pendente:** Quanto falta receber

### Filtrar por Período:
- Clique nos botões dos meses
- Veja histórico de meses anteriores

### Conferir Pagamento Individual:
- Cada linha mostra:
  - Chácara
  - Nome do morador
  - Consumo em m³
  - Valor a pagar
  - Status (Pago/Pendente)

---

## 🔧 Problemas Comuns

### 1. Morador diz que não consegue entrar

**Solução:**
- Confirme o número da chácara cadastrado
- Ele deve digitar apenas números (sem "Chácara" ou "#")
- Exemplo: Se é "Chácara 05", digitar apenas: `05`

### 2. Morador pagou mas não confirmou no sistema

**Solução:**
- Você pode confirmar manualmente:
  1. Peça comprovante
  2. No Supabase (banco), adicione o pagamento
  3. Ou peça para ele clicar em "Confirmar Pagamento"

### 3. Errei o valor do consumo

**Solução:**
- Entre no período novamente
- Corrija o valor
- Clique em "Calcular Valores" novamente
- Sistema recalcula automaticamente

### 4. Criei período com valor errado

**Solução:**
- No Supabase:
  1. Vá em Table Editor > periodos
  2. Encontre o período
  3. Edite o campo "valor_total"
  4. Volte ao sistema e recalcule

### 5. Esqueci minha senha de admin

**Solução:**
- No Supabase:
  1. Vá em Authentication > Users
  2. Clique no seu usuário
  3. "Send Password Recovery"
  4. Ou "Reset Password" manualmente

---

## 💡 Dicas e Boas Práticas

### ✅ Faça Todo Mês

1. **Backup dos dados:**
   - Supabase > Table Editor
   - Exporte as tabelas principais
   - Guarde em planilha ou PDF

2. **Conferência:**
   - Some todos os valores individuais
   - Deve dar o valor total da conta
   - Diferença? Erros de arredondamento (normal em centavos)

3. **Comunicação:**
   - Avise no WhatsApp quando liberar
   - Lembre 3 dias antes do vencimento
   - Agradeça quem paga em dia

### ✅ Organização

1. **Nomenclatura:**
   - Use sempre 2 dígitos: 01, 02, 15 (não 1, 2, 15)
   - Padronize os nomes
   - Mantenha cadastro atualizado

2. **Histórico:**
   - Não delete períodos antigos
   - Mantenha registros de pagamentos
   - Útil para prestação de contas

3. **Periodicidade:**
   - Entre no sistema pelo menos 2x por semana
   - Acompanhe os pagamentos
   - Responda dúvidas rapidamente

### ⚠️ Atenção

1. **Não compartilhe:**
   - Sua senha de admin
   - Credenciais do Supabase
   - Link de acesso direto ao banco

2. **Verifique:**
   - Chave PIX está correta
   - Valores batem com a conta
   - Todos moradores ativos foram incluídos

3. **Backup:**
   - Faça backup mensal
   - Guarde em mais de um lugar
   - Anote as senhas com segurança

---

## 📊 Relatórios

### Relatório Mensal (Manual)

1. **Aba:** Pagamentos
2. **Selecione:** Período desejado
3. **Anote:**
   - Total de moradores
   - Total arrecadado
   - Pendências
4. **Tire print** ou faça planilha

### Histórico de Pagador

Para saber se morador paga em dia:
1. No painel do morador (faça login como ele)
2. Veja histórico completo
3. Verde = sempre pagou

---

## 🆘 Suporte Técnico

### Para problemas técnicos:

1. **Verifique primeiro:**
   - Internet funcionando?
   - Site está no ar?
   - Você está logado?

2. **Erros comuns:**
   - Limpe cache do navegador
   - Tente outro navegador
   - Tente no celular

3. **Contate o desenvolvedor:**
   - Descreva o problema
   - Envie print da tela
   - Diga o que estava fazendo

---

## 🎓 Treinamento de Novo Admin

### Passe para o próximo:

1. ✅ Este manual
2. ✅ Arquivo CONFIGURACAO.md
3. ✅ Credenciais do Supabase (em segurança)
4. ✅ Email e senha de admin
5. ✅ Chave PIX
6. ✅ Histórico de problemas e soluções

### Deixe registrado:
- Onde estão os backups
- Quem é o desenvolvedor/suporte
- Histórico de alterações no sistema

---

## 📞 Contatos Importantes

**Anote aqui:**

- **Desenvolvedor:** __________________
- **Suporte Técnico:** __________________  
- **Banco (Supabase):** https://supabase.com
- **Email Admin:** __________________
- **Backup Local:** __________________

---

**Última atualização:** Dezembro 2025  
**Versão do Sistema:** 1.0

---

💙 **Obrigado por gerenciar o sistema AMCRS!**

*Este manual deve ser atualizado sempre que houver mudanças no sistema.*
