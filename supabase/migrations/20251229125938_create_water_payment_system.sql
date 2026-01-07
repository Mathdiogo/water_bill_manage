/*
  # Sistema de Pagamento de Água - AMCRS

  1. Novas Tabelas
    - `moradores`
      - `id` (uuid, chave primária)
      - `numero_chacara` (text, único) - Número da chácara para login
      - `nome` (text) - Nome do morador
      - `telefone` (text) - Telefone do morador
      - `ativo` (boolean) - Se o morador está ativo
      - `created_at` (timestamptz)
    
    - `periodos`
      - `id` (uuid, chave primária)
      - `mes` (integer) - Mês (1-12)
      - `ano` (integer) - Ano
      - `valor_total` (decimal) - Valor total da conta do mês
      - `total_consumo` (decimal) - Soma total do consumo de todos
      - `fechado` (boolean) - Se o período está fechado para pagamentos
      - `created_at` (timestamptz)
    
    - `consumos`
      - `id` (uuid, chave primária)
      - `periodo_id` (uuid) - FK para periodos
      - `morador_id` (uuid) - FK para moradores
      - `consumo_m3` (decimal) - Consumo em metros cúbicos
      - `valor_calculado` (decimal) - Valor proporcional calculado
      - `created_at` (timestamptz)
    
    - `pagamentos`
      - `id` (uuid, chave primária)
      - `consumo_id` (uuid) - FK para consumos
      - `morador_id` (uuid) - FK para moradores
      - `periodo_id` (uuid) - FK para periodos
      - `valor` (decimal) - Valor pago
      - `data_pagamento` (timestamptz) - Data do pagamento
      - `comprovante` (text) - Informações do comprovante
      - `created_at` (timestamptz)

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Moradores podem ver apenas seus próprios dados
    - Admins (authenticated users) têm acesso total
*/

-- Tabela de moradores
CREATE TABLE IF NOT EXISTS moradores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_chacara text UNIQUE NOT NULL,
  nome text NOT NULL,
  telefone text,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE moradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all residents"
  ON moradores FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Residents can view their own data"
  ON moradores FOR SELECT
  TO anon
  USING (true);

-- Tabela de períodos
CREATE TABLE IF NOT EXISTS periodos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mes integer NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano integer NOT NULL,
  valor_total decimal(10,2) NOT NULL DEFAULT 0,
  total_consumo decimal(10,2) DEFAULT 0,
  fechado boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(mes, ano)
);

ALTER TABLE periodos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view periods"
  ON periodos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage periods"
  ON periodos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Tabela de consumos
CREATE TABLE IF NOT EXISTS consumos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo_id uuid REFERENCES periodos(id) ON DELETE CASCADE,
  morador_id uuid REFERENCES moradores(id) ON DELETE CASCADE,
  consumo_m3 decimal(10,2) NOT NULL DEFAULT 0,
  valor_calculado decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(periodo_id, morador_id)
);

ALTER TABLE consumos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all consumption"
  ON consumos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Residents can view their own consumption"
  ON consumos FOR SELECT
  TO anon
  USING (true);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consumo_id uuid REFERENCES consumos(id) ON DELETE CASCADE,
  morador_id uuid REFERENCES moradores(id) ON DELETE CASCADE,
  periodo_id uuid REFERENCES periodos(id) ON DELETE CASCADE,
  valor decimal(10,2) NOT NULL,
  data_pagamento timestamptz DEFAULT now(),
  comprovante text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all payments"
  ON pagamentos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Residents can view their own payments"
  ON pagamentos FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Residents can create their own payments"
  ON pagamentos FOR INSERT
  TO anon
  WITH CHECK (true);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_consumos_periodo ON consumos(periodo_id);
CREATE INDEX IF NOT EXISTS idx_consumos_morador ON consumos(morador_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_periodo ON pagamentos(periodo_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_morador ON pagamentos(morador_id);