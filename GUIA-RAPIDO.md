# 🚀 Guia Rápido de Configuração - AMCRS

## ⏱️ Tempo estimado: 10-15 minutos

### ✅ Checklist de Configuração

- [ ] **1. Criar conta no Supabase** (2 min)
  - Acesse: https://supabase.com
  - Clique em "Start your project"
  - Faça login com GitHub ou email

- [ ] **2. Criar novo projeto** (3 min)
  - Clique em "New Project"
  - Nome: AMCRS-Water
  - Senha do banco: (escolha uma senha forte e anote!)
  - Região: South America (São Paulo)
  - Aguarde o projeto ser criado (~2 min)

- [ ] **3. Copiar credenciais** (1 min)
  - Vá em Settings > API
  - Copie:
    - Project URL: `https://xxxxx.supabase.co`
    - anon public key: `eyJhbG...`

- [ ] **4. Criar arquivo .env** (1 min)
  ```bash
  # No terminal, execute:
  copy .env.example .env
  ```
  
  Edite o arquivo `.env` e cole suas credenciais:
  ```env
  VITE_SUPABASE_URL=https://xxxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbG...
  ```

- [ ] **5. Criar tabelas do banco** (2 min)
  - No Supabase, vá em SQL Editor
  - Clique em "+ New query"
  - Abra o arquivo: `supabase/migrations/20251229125938_create_water_payment_system.sql`
  - Copie TODO o conteúdo
  - Cole no SQL Editor do Supabase
  - Clique em "RUN" (ou pressione Ctrl+Enter)
  - ✅ Deve aparecer "Success"

- [ ] **6. Criar usuário administrador** (2 min)
  - No Supabase, vá em Authentication > Users
  - Clique em "Add user" > "Create new user"
  - Email: seu-email@exemplo.com
  - Password: SuaSenhaSegura123!
  - Clique em "Create user"

- [ ] **7. Configurar chave PIX** (1 min)
  - Abra: `src/components/morador/PaymentModal.tsx`
  - Linha 19: Altere para sua chave PIX real
  ```typescript
  const chavePix = 'seuemail@pix.com.br'; // ← SUA CHAVE AQUI
  ```

- [ ] **8. Instalar dependências** (2 min)
  ```bash
  npm install
  ```

- [ ] **9. Executar o sistema** (1 min)
  ```bash
  npm run dev
  ```
  
  Acesse: http://localhost:5173

- [ ] **10. Primeiro login** (1 min)
  - Email: o que você criou no passo 6
  - Senha: a que você criou no passo 6
  - Clique em "Entrar como Administrador"

---

## 🎉 Pronto! Sistema funcionando!

### Próximos passos:

1. **Cadastre os moradores** na aba "Moradores"
2. **Crie o primeiro período** na aba "Períodos e Consumo"
3. **Lance o consumo** de cada morador
4. **Calcule os valores** clicando no botão "Calcular Valores"
5. **Compartilhe o link** com os moradores pelo WhatsApp

---

## ❗ Problemas Comuns

### Erro: "Invalid API key"
- ✅ Verifique se copiou a chave corretamente no `.env`
- ✅ Reinicie o servidor (`npm run dev`)

### Erro: "relation does not exist"
- ✅ Execute novamente o script SQL no Supabase
- ✅ Verifique se executou TODO o conteúdo do arquivo de migração

### Não consigo fazer login
- ✅ Verifique se criou o usuário no Supabase Authentication
- ✅ Confira se está usando "Entrar como Administrador"
- ✅ Tente resetar a senha no Supabase

### QR Code não aparece
- ✅ Verifique se a biblioteca foi instalada: `npm install qrcode.react`
- ✅ Reinicie o servidor

---

## 📱 Testando o Acesso do Morador

1. Cadastre um morador com número da chácara "01"
2. Crie um período e lance o consumo
3. Calcule os valores
4. Faça logout
5. Na tela de login, clique em "Morador"
6. Digite "01" e entre
7. Você verá o valor a pagar!

---

## 🆘 Precisa de ajuda?

Entre em contato com o desenvolvedor ou consulte o arquivo `CONFIGURACAO.md` para mais detalhes.
