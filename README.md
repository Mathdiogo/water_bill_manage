# 💧 AMCRS - Sistema de Gestão de Água

Sistema simples e prático para gestão de pagamentos de água para a Associação de Moradores de Chácaras (AMCRS).

## 🎯 Funcionalidades

### 👥 Para Moradores
- ✅ Login simples com número da chácara
- 💰 Visualização do valor a pagar do mês atual
- 📊 Histórico completo de pagamentos
- 📱 Pagamento via PIX com QR Code
- 🔄 Confirmação de pagamento em tempo real

### 🔧 Para Administradores
- ✅ Cadastro e gestão de moradores
- 📅 Criação de períodos de cobrança
- 💧 Lançamento de consumo em m³
- 🧮 Cálculo automático proporcional ao consumo
- 📈 Controle de pagamentos realizados e pendentes
- 📊 Relatórios em tempo real

## 🚀 Como Configurar

### 1. Pré-requisitos
- Node.js 18+ instalado
- Conta no Supabase (gratuita)

### 2. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Copie a **URL** e a **Anon Key** do projeto

### 3. Configurar o Banco de Dados

1. No painel do Supabase, vá em **SQL Editor**
2. Abra o arquivo `supabase/migrations/20251229125938_create_water_payment_system.sql`
3. Copie todo o conteúdo e execute no SQL Editor
4. As tabelas serão criadas automaticamente

### 4. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edite o arquivo `.env` e adicione suas credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
   ```

### 5. Configurar Chave PIX

Edite o arquivo `src/components/morador/PaymentModal.tsx` na linha 19:

```typescript
const chavePix = 'seuemail@example.com'; // ← Altere para sua chave PIX real
```

### 6. Criar Usuário Administrador

1. No painel do Supabase, vá em **Authentication** > **Users**
2. Clique em **Add user** > **Create new user**
3. Preencha:
   - Email: seu-email@exemplo.com
   - Password: sua-senha-segura
4. Clique em **Create user**

### 7. Instalar e Executar

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

O sistema estará disponível em: `http://localhost:5173`

## 📱 Como Usar

### Primeiro Acesso (Administrador)

1. Acesse o sistema e faça login como administrador
2. **Aba Moradores:** Cadastre todos os moradores com número da chácara, nome e telefone
3. **Aba Períodos:** Crie um novo período (ex: Janeiro 2025) e informe o valor total da conta
4. **Ainda na Aba Períodos:** Selecione o período criado e lance o consumo em m³ de cada morador
5. Clique em **"Calcular Valores"** - o sistema dividirá automaticamente o valor proporcional
6. **Aba Pagamentos:** Acompanhe quem já pagou e quem está pendente

### Acesso do Morador

1. O morador acessa o link do sistema
2. Clica em **"Morador"**
3. Digite apenas o **número da chácara** e clica em **"Entrar"**
4. Visualiza o valor a pagar
5. Clica em **"Pagar Agora"**
6. Escaneia o QR Code ou copia a chave PIX
7. Realiza o pagamento no app do banco
8. Volta ao sistema e clica em **"Confirmar Pagamento"**

## 🏗️ Estrutura do Projeto

```
src/
├── components/
│   ├── admin/           # Componentes do painel administrativo
│   │   ├── MoradoresTab.tsx
│   │   ├── PeriodosTab.tsx
│   │   └── PagamentosTab.tsx
│   └── morador/         # Componentes do painel do morador
│       └── PaymentModal.tsx
├── contexts/            # Contextos React (autenticação)
├── lib/                 # Configurações (Supabase)
├── pages/               # Páginas principais
│   ├── AdminDashboard.tsx
│   ├── LoginPage.tsx
│   └── MoradorDashboard.tsx
└── types/               # Tipos TypeScript
```

## 📊 Modelo de Dados

- **moradores**: Cadastro de moradores (número chácara, nome, telefone)
- **periodos**: Períodos de cobrança (mês, ano, valor total)
- **consumos**: Consumo individual em m³ e valor calculado
- **pagamentos**: Registro de pagamentos realizados

## 🎨 Paleta de Cores

- Azul Principal: `#2563eb` (blue-600)
- Azul Escuro: `#1e40af` (blue-700)
- Azul Claro: `#eff6ff` (blue-50)

## 🛠️ Tecnologias Utilizadas

- **React 18** - Framework frontend
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Supabase** - Backend e banco de dados
- **Vite** - Build tool
- **qrcode.react** - Geração de QR Codes PIX

## 📦 Deploy

### Opção 1: Vercel (Recomendado)

1. Crie uma conta no [Vercel](https://vercel.com)
2. Conecte seu repositório GitHub
3. Adicione as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Faça o deploy

### Opção 2: Build manual

```bash
npm run build
```

Os arquivos estarão na pasta `dist/` prontos para serem hospedados.

## 🔒 Segurança

- ⚠️ O login do morador é simplificado (apenas número da chácara) conforme solicitado
- 🔐 O login administrativo é protegido com email e senha
- 🛡️ Todas as operações são validadas no Supabase
- 📝 Row Level Security (RLS) pode ser configurado no Supabase para maior segurança

## ❓ Perguntas Frequentes

### Como alterar a chave PIX?
Edite o arquivo `src/components/morador/PaymentModal.tsx` na linha 19.

### Como adicionar mais moradores?
Acesse o painel administrativo > Aba Moradores > Novo Morador.

### O morador esqueceu o número da chácara?
O administrador pode consultar na aba "Moradores".

### Posso excluir um pagamento registrado por engano?
Sim, você pode acessar o banco de dados do Supabase e excluir o registro da tabela `pagamentos`.

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com o administrador do sistema.

---

Desenvolvido para facilitar a gestão de pagamentos da AMCRS 💙
