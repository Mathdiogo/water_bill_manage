// TESTE DE CONEXÃO SUPABASE
// Execute com: node teste-supabase.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dilitiauoacqkftugrwn.supabase.co';
const supabaseAnonKey = 'sb_publishable_7uRvfHVWB_pCmwe4SxbpWQ_5KNhxmx_';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Testando conexão com Supabase...\n');

// Teste 1: Listar tabelas
console.log('📊 Teste 1: Buscando moradores...');
const { data: moradores, error: errorMoradores } = await supabase
  .from('moradores')
  .select('*')
  .limit(5);

if (errorMoradores) {
  console.log('❌ Erro ao buscar moradores:', errorMoradores.message);
} else {
  console.log('✅ Moradores encontrados:', moradores.length);
  console.log(moradores);
}

// Teste 2: Tentar login
console.log('\n🔐 Teste 2: Tentando login...');
console.log('Email: admin@amcrs.com');
console.log('Senha: Admin123#');

const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
  email: 'admin@amcrs.com',
  password: 'Admin123#',
});

if (loginError) {
  console.log('❌ Erro no login:', loginError.message);
  console.log('Código do erro:', loginError.status);
  console.log('Detalhes:', loginError);
} else {
  console.log('✅ Login bem-sucedido!');
  console.log('Usuário:', loginData.user.email);
}

// Teste 3: Listar usuários (só funciona se tiver permissão de admin)
console.log('\n👥 Teste 3: Verificando Authentication...');
const { data: { user } } = await supabase.auth.getUser();
console.log('Usuário atual:', user);
