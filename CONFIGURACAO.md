# Configuração do Sistema AMCRS

## 1. Criar Usuário Administrador

Para acessar o painel administrativo, você precisa criar um usuário no Supabase:

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Vá em **Authentication** > **Users**
3. Clique em **Add user** > **Create new user**
4. Preencha:
   - Email: seu-email@exemplo.com
   - Password: sua-senha-segura
5. Clique em **Create user**

Agora você pode fazer login no sistema como administrador usando esse email e senha.

## 2. Configurar Chave PIX

Para que os moradores possam fazer pagamentos, você precisa configurar a chave PIX:

1. Abra o arquivo: `src/components/morador/PaymentModal.tsx`
2. Na linha 13, altere a chave PIX para a chave real da associação:
   ```typescript
   const chavePix = 'seuemail@example.com'; // Altere aqui para sua chave PIX real
   ```

## 3. Primeiros Passos no Sistema

### Como Administrador:

1. **Cadastrar Moradores:**
   - Acesse a aba "Moradores"
   - Clique em "Novo Morador"
   - Preencha: número da chácara, nome e telefone
   - O número da chácara será usado pelo morador para fazer login

2. **Criar Período de Cobrança:**
   - Acesse a aba "Períodos e Consumo"
   - Clique em "Novo Período"
   - Preencha: mês, ano e valor total da conta

3. **Lançar Consumo dos Moradores:**
   - Selecione o período criado
   - Preencha o consumo em m³ de cada morador
   - Clique em "Calcular Valores"
   - O sistema calculará automaticamente o valor proporcional de cada morador

4. **Acompanhar Pagamentos:**
   - Acesse a aba "Pagamentos"
   - Veja quem já pagou e quem está pendente

### Como Morador:

1. Na tela de login, escolha "Morador"
2. Digite o número da sua chácara
3. Clique em "Entrar"
4. Visualize seu valor a pagar e histórico
5. Clique em "Pagar Agora" para ver as instruções de pagamento via PIX
6. Após fazer o pagamento, clique em "Confirmar Pagamento"

## Suporte

O sistema foi desenvolvido para ser simples e intuitivo. Em caso de dúvidas, entre em contato com o administrador do sistema.
