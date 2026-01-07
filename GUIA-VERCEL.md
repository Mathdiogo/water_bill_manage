# 🚀 GUIA RÁPIDO: SUBIR NA VERCEL

## ✅ PROJETO PRONTO!

- ✅ Build testado: **SUCESSO**
- ✅ TypeScript: **SEM ERROS**
- ✅ Migration aplicada: **SUCESSO**
- ✅ Todas funcionalidades: **IMPLEMENTADAS**

---

## 📋 PASSO A PASSO PARA VERCEL

### 1️⃣ Preparar o Código (2 minutos)

No terminal do VS Code, execute:

```bash
# Iniciar Git (se ainda não fez)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Sistema AMCRS - Pronto para Produção"
```

### 2️⃣ Subir no GitHub (3 minutos)

1. Acesse: https://github.com/new
2. Crie um repositório chamado: `amcrs-water-system`
3. **NÃO marque** nenhuma opção (README, .gitignore, license)
4. Clique em **"Create repository"**

5. No terminal, conecte com o GitHub:
```bash
git remote add origin https://github.com/SEU-USUARIO/amcrs-water-system.git
git branch -M main
git push -u origin main
```

### 3️⃣ Deploy na Vercel (5 minutos)

1. **Acesse:** https://vercel.com
2. **Faça login** com sua conta do GitHub
3. Clique em **"Add New"** → **"Project"**
4. Selecione o repositório **"amcrs-water-system"**
5. Clique em **"Import"**

6. **Configure Variáveis de Ambiente:**
   - Clique em **"Environment Variables"**
   - Adicione estas 2 variáveis:

   ```
   Nome: VITE_SUPABASE_URL
   Valor: https://dilitiauoacqkftugrwn.supabase.co
   ```

   ```
   Nome: VITE_SUPABASE_ANON_KEY
   Valor: (copie do arquivo .env local)
   ```

7. Clique em **"Deploy"**
8. Aguarde ~2 minutos ☕

### 4️⃣ Pronto! 🎉

Seu sistema estará disponível em:
```
https://amcrs-water-system.vercel.app
```

---

## 🌐 SOBRE O DOMÍNIO

### ✅ Pode usar domínio GRÁTIS primeiro!

- Vercel fornece: `amcrs-water-system.vercel.app`
- Cliente pode testar tranquilamente
- Funciona 100% normalmente
- SSL/HTTPS automático

### 📝 Quando comprar o domínio personalizado:

1. Na Vercel, vá em **Settings** → **Domains**
2. Clique em **"Add"**
3. Digite o domínio comprado (ex: `amcrs.com.br`)
4. Configure o DNS conforme instruções da Vercel
5. **Pronto!** Sistema continua funcionando

**NÃO PRECISA FAZER REDEPLOY!** 🎯

---

## 🔑 IMPORTANTE: Pegar a ANON KEY

Se não salvou a chave do Supabase:

1. Acesse: https://supabase.com/dashboard/project/dilitiauoacqkftugrwn/settings/api
2. Copie a chave em **"anon / public"**
3. Use ela na variável `VITE_SUPABASE_ANON_KEY`

---

## 🎯 CHECKLIST FINAL

Antes de liberar para o cliente:

- [ ] Sistema funcionando no link `.vercel.app`
- [ ] Login admin funcionando
- [ ] Criar um morador de teste
- [ ] Criar um período de teste
- [ ] Testar cálculo de valores
- [ ] Testar login do morador
- [ ] Testar pagamento PIX

---

## 💡 DICAS

1. **Updates automáticos:** Toda vez que fizer `git push`, Vercel atualiza automaticamente!
2. **Grátis para sempre:** Vercel é gratuito para projetos pessoais
3. **Performance:** Vercel é SUPER rápido (CDN global)
4. **Suporte:** Dashboard com logs e analytics

---

## 🆘 Se Der Problema

**Build falhou?**
- Verifique se as variáveis de ambiente estão corretas
- Confirme que ambas começam com `VITE_`

**Site não carrega?**
- Espere 2-3 minutos após o deploy
- Limpe o cache do navegador (Ctrl+Shift+R)

**Erro de conexão com banco?**
- Confirme a URL do Supabase
- Verifique se a ANON KEY está correta

---

## ✅ STATUS ATUAL

**TUDO PRONTO PARA DEPLOY!** 🚀

- Backend: Supabase configurado ✅
- Frontend: Build testado ✅
- Lógica: Implementada 100% ✅
- Testes: Passando ✅

**Basta seguir os passos acima e está no ar!** 🎉
