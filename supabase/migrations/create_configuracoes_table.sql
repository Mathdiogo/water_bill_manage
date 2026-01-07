-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS configuracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave_pix text NOT NULL,
  nome_associacao text DEFAULT 'AMCRS',
  telefone_contato text,
  mensagem_cobranca_template text,
  -- Evolution API
  evolution_api_url text,
  evolution_api_key text,
  evolution_instance_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inserir configuração padrão
INSERT INTO configuracoes (
  chave_pix, 
  nome_associacao, 
  telefone_contato, 
  mensagem_cobranca_template,
  evolution_api_url,
  evolution_api_key,
  evolution_instance_name
)
VALUES (
  'seuemail@example.com',
  'AMCRS - Associação de Moradores',
  '+55 (00) 00000-0000',
  '🌊 *{nome_associacao} - Pagamento de Água*\n\nOlá *{nome_morador}*!\n\nA conta de água da sua Chácara *{numero_chacara}* referente a *{mes}/{ano}* está disponível para pagamento.\n\n💰 *Valor:* R$ {valor}\n📊 *Consumo:* {consumo} m³\n\nPara pagar via PIX, acesse:\n{link_site}\n\n_Faça login com o número da sua chácara._',
  '',
  '',
  ''
)
ON CONFLICT DO NOTHING;

-- Índice para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_configuracoes_created ON configuracoes(created_at DESC);
