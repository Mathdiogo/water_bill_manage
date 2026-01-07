export interface Morador {
  id: string;
  numero_chacara: string;
  nome: string;
  telefone: string | null;
  ativo: boolean;
  tem_hidrometro: boolean;
  created_at: string;
}

export interface Periodo {
  id: string;
  mes: number;
  ano: number;
  valor_total: number;
  total_consumo: number;
  fechado: boolean;
  despesa_energia: number;
  despesa_outros: number;
  despesa_servico_cobranca: number;
  despesa_extra_total: number;
  created_at: string;
}

export interface Consumo {
  id: string;
  periodo_id: string;
  morador_id: string;
  consumo_m3: number;
  valor_calculado: number;
  despesa_extra: number;
  created_at: string;
  morador?: Morador;
  periodo?: Periodo;
}

export interface Pagamento {
  id: string;
  consumo_id: string;
  morador_id: string;
  periodo_id: string;
  valor: number;
  data_pagamento: string;
  comprovante: string | null;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  created_at: string;
  periodo?: Periodo;
}

export interface Configuracao {
  id: string;
  chave_pix: string;
  nome_associacao: string;
  telefone_contato: string | null;
  mensagem_cobranca_template: string | null;
  evolution_api_url: string | null;
  evolution_api_key: string | null;
  evolution_instance_name: string | null;
  taxa_minima_com_hidrometro: number;
  taxa_minima_sem_hidrometro: number;
  taxa_associado: number;
  percentual_multa_atraso: number;
  faixa_normal_ate: number;
  faixa_excedente_1_ate: number;
  faixa_excedente_1_percentual: number;
  faixa_excedente_2_percentual: number;
  created_at: string;
  updated_at: string;
}
