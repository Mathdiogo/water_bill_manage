-- Script opcional para popular o banco com dados de exemplo
-- Execute este script apenas se quiser testar o sistema com dados fictícios

-- Inserir moradores de exemplo
INSERT INTO moradores (numero_chacara, nome, telefone, ativo) VALUES
('01', 'João Silva', '(11) 98765-4321', true),
('02', 'Maria Santos', '(11) 98765-4322', true),
('03', 'Pedro Oliveira', '(11) 98765-4323', true),
('05', 'Ana Costa', '(11) 98765-4324', true),
('07', 'Carlos Souza', '(11) 98765-4325', true)
ON CONFLICT (numero_chacara) DO NOTHING;

-- Inserir período de exemplo (Janeiro 2025)
INSERT INTO periodos (mes, ano, valor_total, total_consumo, fechado)
VALUES (1, 2025, 1500.00, 0, false)
ON CONFLICT (mes, ano) DO NOTHING;
