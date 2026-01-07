-- Adicionar campo tem_hidrometro na tabela moradores
ALTER TABLE moradores 
ADD COLUMN tem_hidrometro BOOLEAN DEFAULT true;

-- Adicionar campos de despesas na tabela periodos
ALTER TABLE periodos 
ADD COLUMN despesa_energia DECIMAL(10,2) DEFAULT 0,
ADD COLUMN despesa_outros DECIMAL(10,2) DEFAULT 0,
ADD COLUMN despesa_servico_cobranca DECIMAL(10,2) DEFAULT 0,
ADD COLUMN despesa_extra_total DECIMAL(10,2) DEFAULT 0;

-- Adicionar campo para despesas extras individuais na tabela consumos
ALTER TABLE consumos 
ADD COLUMN despesa_extra DECIMAL(10,2) DEFAULT 0;

-- Adicionar campos de configuração de taxas
ALTER TABLE configuracoes 
ADD COLUMN taxa_minima_com_hidrometro DECIMAL(10,2) DEFAULT 10.00,
ADD COLUMN taxa_minima_sem_hidrometro DECIMAL(10,2) DEFAULT 50.00,
ADD COLUMN taxa_associado DECIMAL(10,2) DEFAULT 8.00,
ADD COLUMN percentual_multa_atraso DECIMAL(5,2) DEFAULT 10.00,
ADD COLUMN faixa_excedente_1_ate INTEGER DEFAULT 50,
ADD COLUMN faixa_excedente_1_percentual DECIMAL(5,2) DEFAULT 30.00,
ADD COLUMN faixa_excedente_2_percentual DECIMAL(5,2) DEFAULT 60.00,
ADD COLUMN faixa_normal_ate INTEGER DEFAULT 30;

COMMENT ON COLUMN moradores.tem_hidrometro IS 'Define se o morador tem hidrômetro instalado';
COMMENT ON COLUMN periodos.despesa_energia IS 'Custo de energia do período';
COMMENT ON COLUMN periodos.despesa_outros IS 'Outros custos do período';
COMMENT ON COLUMN periodos.despesa_servico_cobranca IS 'Custo do serviço de cobrança';
COMMENT ON COLUMN periodos.despesa_extra_total IS 'Total de despesas extras do período';
COMMENT ON COLUMN consumos.despesa_extra IS 'Despesa extra individual deste morador neste período';
COMMENT ON COLUMN configuracoes.taxa_minima_com_hidrometro IS 'Taxa mínima para moradores COM hidrômetro';
COMMENT ON COLUMN configuracoes.taxa_minima_sem_hidrometro IS 'Taxa mínima para moradores SEM hidrômetro';
COMMENT ON COLUMN configuracoes.taxa_associado IS 'Taxa de associado cobrada de todos';
COMMENT ON COLUMN configuracoes.percentual_multa_atraso IS 'Percentual de multa por atraso no pagamento';
COMMENT ON COLUMN configuracoes.faixa_normal_ate IS 'Consumo até este valor não tem taxa excedente (padrão: 30 m³)';
COMMENT ON COLUMN configuracoes.faixa_excedente_1_ate IS 'Consumo até este valor aplica faixa_excedente_1_percentual (padrão: 50 m³)';
COMMENT ON COLUMN configuracoes.faixa_excedente_1_percentual IS 'Percentual adicional para consumo entre faixa_normal_ate e faixa_excedente_1_ate';
COMMENT ON COLUMN configuracoes.faixa_excedente_2_percentual IS 'Percentual adicional para consumo acima de faixa_excedente_1_ate';
