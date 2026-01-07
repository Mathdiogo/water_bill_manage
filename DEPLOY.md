# 🚀 Deploy do Sistema AMCRS

## Opções de Hospedagem Gratuita

### 1. 🟢 Vercel (Recomendado) - Mais Fácil

#### Vantagens:
- ✅ 100% Gratuito para projetos pessoais
- ✅ Deploy automático do GitHub
- ✅ SSL/HTTPS automático
- ✅ Domínio grátis: `seu-site.vercel.app`
- ✅ Atualizações automáticas

#### Passo a Passo:

1. **Criar conta GitHub (se não tiver)**
   - Acesse: https://github.com/signup
   - Crie sua conta

2. **Enviar código para GitHub**
   ```bash
   # No terminal do projeto:
   git init
   git add .
   git commit -m "Sistema AMCRS pronto"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/amcrs.git
   git push -u origin main
   ```

3. **Criar conta Vercel**
   - Acesse: https://vercel.com
   - Clique em "Sign Up"
   - Faça login com GitHub

4. **Importar Projeto**
   - No Vercel, clique em "Add New" > "Project"
   - Selecione o repositório "amcrs"
   - Clique em "Import"

5. **Configurar Variáveis de Ambiente**
   - Na página de configuração, vá em "Environment Variables"
   - Adicione:
     - `VITE_SUPABASE_URL`: `https://seu-projeto.supabase.co`
     - `VITE_SUPABASE_ANON_KEY`: `sua-chave-aqui`

6. **Deploy!**
   - Clique em "Deploy"
   - Aguarde 2-3 minutos
   - Pronto! Seu site estará em: `https://amcrs.vercel.app`

#### Atualizações Futuras:
```bash
# Faça suas alterações no código, depois:
git add .
git commit -m "Descrição da alteração"
git push

# O Vercel atualiza automaticamente!
```

---

### 2. 🟣 Netlify - Alternativa

#### Vantagens:
- ✅ Gratuito
- ✅ Deploy fácil
- ✅ SSL automático

#### Passo a Passo:

1. **Criar conta**
   - Acesse: https://netlify.com
   - Sign up com GitHub

2. **Deploy manual (mais fácil)**
   ```bash
   # Build o projeto
   npm run build
   ```
   
3. **Arraste e solte**
   - Arraste a pasta `dist` para o Netlify
   - Configure as variáveis de ambiente no painel

---

## 🌐 Domínio Personalizado (Opcional)

### Opção 1: Domínio Gratuito
- Use o domínio fornecido pelo Vercel/Netlify:
  - `amcrs.vercel.app`
  - `amcrs.netlify.app`

### Opção 2: Comprar Domínio
1. **Registro.br** (R$ 40/ano)
   - Acesse: https://registro.br
   - Registre: `amcrs.com.br`

2. **Configurar no Vercel/Netlify**
   - Vá em Settings > Domains
   - Adicione seu domínio
   - Configure os DNS conforme instruções

---

## 📱 Configuração Pós-Deploy

### 1. Testar o Sistema
- [ ] Acesse a URL do deploy
- [ ] Teste login como admin
- [ ] Cadastre um morador teste
- [ ] Crie um período teste
- [ ] Teste login como morador
- [ ] Teste pagamento

### 2. Compartilhar com Moradores
- [ ] Crie um link curto (opcional): bit.ly
- [ ] Envie no WhatsApp:
  ```
  🌊 Sistema de Pagamento de Água - AMCRS
  
  Acesse: https://amcrs.vercel.app
  
  Como usar:
  1. Clique em "Morador"
  2. Digite o número da sua chácara
  3. Veja seu valor a pagar
  4. Pague via PIX
  
  Dúvidas? Entre em contato com a administração.
  ```

### 3. Criar Atalho no Celular (PWA)
**Para Android/iPhone:**
1. Abra o site no navegador
2. Toque no menu (⋮ ou ⋯)
3. "Adicionar à tela inicial"
4. Pronto! Parece um app!

---

## 🔧 Troubleshooting

### Erro: "Failed to load"
- ✅ Verifique as variáveis de ambiente
- ✅ Elas devem começar com `VITE_`
- ✅ Refaça o deploy após adicionar

### Site está lento
- ✅ Normal na primeira visita (cold start)
- ✅ Depois fica rápido

### Erro 404
- ✅ Configure "Rewrites" no Vercel para SPA
- ✅ Já configurado automaticamente pelo Vite

---

## 📊 Monitoramento

### Vercel Analytics (Grátis)
- Vá em Analytics no painel Vercel
- Veja quantos acessos tem
- Monitore performance

### Supabase Dashboard
- Monitore uso do banco
- Veja quantos usuários têm
- Limite grátis: 500MB e 2GB de transferência/mês

---

## 💰 Custos

### 100% Grátis:
- ✅ Vercel/Netlify (hosting)
- ✅ Supabase (banco de dados)
- ✅ SSL/HTTPS
- ✅ Subdomínio (.vercel.app)

### Custos Opcionais:
- 💵 Domínio próprio: R$ 40/ano
- 💵 Supabase Pro (se crescer muito): $25/mês
  - Só necessário para +500MB de dados

---

## 🔒 Segurança em Produção

### Checklist:
- [ ] Alterar chave PIX para a real
- [ ] Verificar variáveis de ambiente
- [ ] Criar senha forte para admin
- [ ] Ativar RLS no Supabase (opcional)
- [ ] Fazer backup do banco mensalmente

### Row Level Security (Opcional - Avançado)

No Supabase, execute:

```sql
-- Moradores só veem seus próprios dados
ALTER TABLE consumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moradores veem apenas seus consumos"
ON consumos FOR SELECT
USING (morador_id IN (
  SELECT id FROM moradores 
  WHERE numero_chacara = current_setting('request.jwt.claims')::json->>'numero_chacara'
));
```

---

## 📈 Escalabilidade

### Limites Gratuitos:
- **Vercel**: Ilimitado (praticamente)
- **Supabase**: 
  - 500 MB storage
  - 2 GB bandwidth/mês
  - 50.000 linhas

### Para Crescer:
- Sistema suporta centenas de moradores
- Banco aguenta milhares de registros
- Se crescer muito: Supabase Pro ($25/mês)

---

## 🎉 Pronto para Produção!

Seu sistema está pronto para ser usado pela comunidade AMCRS!

### Últimos Passos:
1. ✅ Deploy no Vercel
2. ✅ Teste completo
3. ✅ Cadastre todos os moradores
4. ✅ Compartilhe o link
5. ✅ Dê suporte inicial aos moradores

**Boa sorte! 💙**
