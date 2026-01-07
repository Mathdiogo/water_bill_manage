-- Adicionar coluna de status aos pagamentos
ALTER TABLE pagamentos 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado'));

-- Atualizar pagamentos existentes para aprovado (para não quebrar)
UPDATE pagamentos SET status = 'aprovado' WHERE status IS NULL;

-- Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
