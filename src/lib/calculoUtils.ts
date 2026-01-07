import { Configuracao, Morador, Periodo } from '../types';

export interface DetalhamentoCalculo {
  consumo_m3: number;
  valor_base: number;
  valor_faixa_normal: number;
  valor_faixa_excedente_1: number;
  valor_faixa_excedente_2: number;
  taxa_associado: number;
  despesa_extra: number;
  subtotal: number;
  taxa_minima?: number;
  valor_total: number;
  descricao: string[];
}

/**
 * Calcula o valor da água para um morador com base no consumo e configurações
 * Implementa a lógica completa da planilha Excel:
 * - Taxa mínima para consumo zero
 * - Taxa excedente progressiva
 * - Taxa de associado
 * - Despesas extras
 */
export function calcularValorAgua(
  consumo_m3: number,
  valor_m3: number,
  morador: Morador,
  config: Configuracao,
  despesa_extra: number = 0
): DetalhamentoCalculo {
  const descricao: string[] = [];
  
  // Se consumo é zero, aplica taxa mínima
  if (consumo_m3 === 0) {
    const taxa_minima = morador.tem_hidrometro 
      ? config.taxa_minima_com_hidrometro 
      : config.taxa_minima_sem_hidrometro;
    
    const valor_total = taxa_minima + config.taxa_associado + despesa_extra;
    
    descricao.push(
      `Consumo zero - Taxa mínima ${morador.tem_hidrometro ? '(com hidrômetro)' : '(sem hidrômetro)'}: R$ ${taxa_minima.toFixed(2)}`,
      `Taxa de Associado: R$ ${config.taxa_associado.toFixed(2)}`
    );
    
    if (despesa_extra > 0) {
      descricao.push(`Despesa Extra: R$ ${despesa_extra.toFixed(2)}`);
    }
    
    return {
      consumo_m3: 0,
      valor_base: 0,
      valor_faixa_normal: 0,
      valor_faixa_excedente_1: 0,
      valor_faixa_excedente_2: 0,
      taxa_associado: config.taxa_associado,
      despesa_extra,
      subtotal: taxa_minima,
      taxa_minima,
      valor_total,
      descricao,
    };
  }

  // Cálculo com consumo > 0
  let valor_faixa_normal = 0;
  let valor_faixa_excedente_1 = 0;
  let valor_faixa_excedente_2 = 0;
  
  // Faixa Normal (0 até faixa_normal_ate, ex: 0 a 30 m³)
  if (consumo_m3 <= config.faixa_normal_ate) {
    valor_faixa_normal = consumo_m3 * valor_m3;
    descricao.push(`Faixa Normal (0 a ${config.faixa_normal_ate} m³): ${consumo_m3.toFixed(2)} × R$ ${valor_m3.toFixed(2)} = R$ ${valor_faixa_normal.toFixed(2)}`);
  } else {
    valor_faixa_normal = config.faixa_normal_ate * valor_m3;
    descricao.push(`Faixa Normal (0 a ${config.faixa_normal_ate} m³): ${config.faixa_normal_ate} × R$ ${valor_m3.toFixed(2)} = R$ ${valor_faixa_normal.toFixed(2)}`);
    
    // Faixa Excedente 1 (faixa_normal_ate até faixa_excedente_1_ate, ex: 30 a 50 m³)
    if (consumo_m3 <= config.faixa_excedente_1_ate) {
      const consumo_excedente_1 = consumo_m3 - config.faixa_normal_ate;
      const percentual_1 = 1 + (config.faixa_excedente_1_percentual / 100);
      valor_faixa_excedente_1 = consumo_excedente_1 * valor_m3 * percentual_1;
      descricao.push(
        `1ª Faixa Excedente (${config.faixa_normal_ate} a ${config.faixa_excedente_1_ate} m³):`,
        `  ${consumo_excedente_1.toFixed(2)} × R$ ${valor_m3.toFixed(2)} × ${percentual_1.toFixed(2)} (+${config.faixa_excedente_1_percentual}%) = R$ ${valor_faixa_excedente_1.toFixed(2)}`
      );
    } else {
      // Consome toda a faixa 1
      const consumo_excedente_1 = config.faixa_excedente_1_ate - config.faixa_normal_ate;
      const percentual_1 = 1 + (config.faixa_excedente_1_percentual / 100);
      valor_faixa_excedente_1 = consumo_excedente_1 * valor_m3 * percentual_1;
      descricao.push(
        `1ª Faixa Excedente (${config.faixa_normal_ate} a ${config.faixa_excedente_1_ate} m³):`,
        `  ${consumo_excedente_1} × R$ ${valor_m3.toFixed(2)} × ${percentual_1.toFixed(2)} (+${config.faixa_excedente_1_percentual}%) = R$ ${valor_faixa_excedente_1.toFixed(2)}`
      );
      
      // Faixa Excedente 2 (acima de faixa_excedente_1_ate, ex: acima de 50 m³)
      const consumo_excedente_2 = consumo_m3 - config.faixa_excedente_1_ate;
      const percentual_2 = 1 + (config.faixa_excedente_2_percentual / 100);
      valor_faixa_excedente_2 = consumo_excedente_2 * valor_m3 * percentual_2;
      descricao.push(
        `2ª Faixa Excedente (acima de ${config.faixa_excedente_1_ate} m³):`,
        `  ${consumo_excedente_2.toFixed(2)} × R$ ${valor_m3.toFixed(2)} × ${percentual_2.toFixed(2)} (+${config.faixa_excedente_2_percentual}%) = R$ ${valor_faixa_excedente_2.toFixed(2)}`
      );
    }
  }
  
  const valor_base = valor_faixa_normal + valor_faixa_excedente_1 + valor_faixa_excedente_2;
  const subtotal = valor_base;
  
  descricao.push(`Subtotal Consumo: R$ ${subtotal.toFixed(2)}`);
  descricao.push(`Taxa de Associado: R$ ${config.taxa_associado.toFixed(2)}`);
  
  if (despesa_extra > 0) {
    descricao.push(`Despesa Extra: R$ ${despesa_extra.toFixed(2)}`);
  }
  
  const valor_total = subtotal + config.taxa_associado + despesa_extra;

  return {
    consumo_m3,
    valor_base,
    valor_faixa_normal,
    valor_faixa_excedente_1,
    valor_faixa_excedente_2,
    taxa_associado: config.taxa_associado,
    despesa_extra,
    subtotal,
    valor_total,
    descricao,
  };
}

/**
 * Calcula o valor do M³ com base nas despesas do período
 */
export function calcularValorM3(periodo: Periodo, totalConsumoM3: number): number {
  if (totalConsumoM3 === 0) return 0;
  
  const totalDespesas = 
    (periodo.despesa_energia || 0) + 
    (periodo.despesa_outros || 0) + 
    (periodo.despesa_servico_cobranca || 0) + 
    (periodo.despesa_extra_total || 0);
  
  return totalDespesas / totalConsumoM3;
}

/**
 * Calcula o total de despesas de um período
 */
export function calcularTotalDespesas(periodo: Periodo): number {
  return (
    (periodo.despesa_energia || 0) + 
    (periodo.despesa_outros || 0) + 
    (periodo.despesa_servico_cobranca || 0) + 
    (periodo.despesa_extra_total || 0)
  );
}
