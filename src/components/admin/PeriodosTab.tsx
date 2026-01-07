import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Periodo, Morador, Configuracao } from '../../types';
import { Plus, Calculator } from 'lucide-react';
import { Toast } from '../common/Toast';
import { calcularValorAgua, calcularValorM3 } from '../../lib/calculoUtils';

export function PeriodosTab() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState<string | null>(null);
  const [consumos, setConsumos] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    despesa_energia: '',
    despesa_outros: '',
    despesa_servico_cobranca: '',
    despesa_extra_total: '',
  });
  
  // Estado para toast
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedPeriodo) {
      loadConsumos(selectedPeriodo);
    }
  }, [selectedPeriodo]);

  const loadData = async () => {
    setLoading(true);
    const [periodosRes, moradoresRes] = await Promise.all([
      supabase.from('periodos').select('*').order('ano', { ascending: false }).order('mes', { ascending: false }),
      supabase.from('moradores').select('*').eq('ativo', true).order('numero_chacara'),
    ]);
    if (periodosRes.data) setPeriodos(periodosRes.data);
    if (moradoresRes.data) setMoradores(moradoresRes.data);
    setLoading(false);
  };

  const loadConsumos = async (periodoId: string) => {
    const { data } = await supabase
      .from('consumos')
      .select('morador_id, consumo_m3')
      .eq('periodo_id', periodoId);

    if (data) {
      const consumosMap: Record<string, number> = {};
      data.forEach((c) => {
        consumosMap[c.morador_id] = c.consumo_m3;
      });
      setConsumos(consumosMap);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const despesa_energia = parseFloat(formData.despesa_energia) || 0;
    const despesa_outros = parseFloat(formData.despesa_outros) || 0;
    const despesa_servico_cobranca = parseFloat(formData.despesa_servico_cobranca) || 0;
    const despesa_extra_total = parseFloat(formData.despesa_extra_total) || 0;
    const valor_total = despesa_energia + despesa_outros + despesa_servico_cobranca + despesa_extra_total;
    
    const { data, error } = await supabase
      .from('periodos')
      .insert([{
        mes: formData.mes,
        ano: formData.ano,
        valor_total,
        despesa_energia,
        despesa_outros,
        despesa_servico_cobranca,
        despesa_extra_total,
        total_consumo: 0,
      }])
      .select()
      .single();

    if (!error && data) {
      setFormData({ 
        mes: new Date().getMonth() + 1, 
        ano: new Date().getFullYear(), 
        despesa_energia: '',
        despesa_outros: '',
        despesa_servico_cobranca: '',
        despesa_extra_total: '',
      });
      setShowForm(false);
      setToast({
        show: true,
        message: '✅ Período criado com sucesso!',
        type: 'success',
      });
      loadData();
      setSelectedPeriodo(data.id);
    } else {
      setToast({
        show: true,
        message: '❌ Erro ao criar período!',
        type: 'error',
      });
    }
  };

  const calcularValores = async () => {
    if (!selectedPeriodo) return;

    const periodo = periodos.find((p) => p.id === selectedPeriodo);
    if (!periodo) {
      setToast({
        show: true,
        message: '❌ Período não encontrado!',
        type: 'error',
      });
      return;
    }

    // Buscar configurações
    const { data: configData } = await supabase
      .from('configuracoes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!configData) {
      setToast({
        show: true,
        message: '❌ Configure as taxas em Configurações antes de calcular!',
        type: 'error',
      });
      return;
    }

    const config: Configuracao = configData;

    // Calcular consumo total
    const totalConsumo = Object.values(consumos).reduce((sum, val) => sum + (val || 0), 0);

    if (totalConsumo === 0) {
      setToast({
        show: true,
        message: '⚠️ Nenhum consumo registrado ainda!',
        type: 'warning',
      });
      return;
    }

    // Calcular valor do m³
    const valor_m3 = calcularValorM3(periodo, totalConsumo);

    // Atualizar total_consumo do período
    await supabase
      .from('periodos')
      .update({ total_consumo: totalConsumo })
      .eq('id', selectedPeriodo);

    // Calcular e salvar consumos individuais
    let processados = 0;
    for (const [moradorId, consumo_m3] of Object.entries(consumos)) {
      // Buscar dados do morador
      const morador = moradores.find(m => m.id === moradorId);
      if (!morador) continue;

      // Calcular valor com a nova lógica
      const calculo = calcularValorAgua(consumo_m3, valor_m3, morador, config, 0);

      const { data: existing } = await supabase
        .from('consumos')
        .select('id')
        .eq('periodo_id', selectedPeriodo)
        .eq('morador_id', moradorId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('consumos')
          .update({ 
            consumo_m3, 
            valor_calculado: calculo.valor_total,
            despesa_extra: 0,
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('consumos')
          .insert([{ 
            periodo_id: selectedPeriodo, 
            morador_id: moradorId, 
            consumo_m3, 
            valor_calculado: calculo.valor_total,
            despesa_extra: 0,
          }]);
      }
      processados++;
    }

    setToast({
      show: true,
      message: `✅ ${processados} valores calculados e salvos com sucesso!`,
      type: 'success',
    });
    loadData();
  };

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Períodos e Consumo</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Período</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Criar Novo Período - Informe as Despesas</h3>
          <p className="text-sm text-gray-600 mb-6">
            💡 O valor total será calculado automaticamente somando todas as despesas abaixo
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mês *</label>
                <select
                  value={formData.mes}
                  onChange={(e) => setFormData({ ...formData, mes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {meses.map((mes, idx) => (
                    <option key={idx} value={idx + 1}>{mes}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ano *</label>
                <input
                  type="number"
                  value={formData.ano}
                  onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-2">💰</span>
                Despesas do Período
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Energia (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.despesa_energia}
                    onChange={(e) => setFormData({ ...formData, despesa_energia: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Outros (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.despesa_outros}
                    onChange={(e) => setFormData({ ...formData, despesa_outros: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serviço de Cobrança (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.despesa_servico_cobranca}
                    onChange={(e) => setFormData({ ...formData, despesa_servico_cobranca: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Despesas Extras (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.despesa_extra_total}
                    onChange={(e) => setFormData({ ...formData, despesa_extra_total: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Total Calculado */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Total de Despesas:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    R$ {(
                      (parseFloat(formData.despesa_energia) || 0) +
                      (parseFloat(formData.despesa_outros) || 0) +
                      (parseFloat(formData.despesa_servico_cobranca) || 0) +
                      (parseFloat(formData.despesa_extra_total) || 0)
                    ).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Este valor será dividido pelo consumo total para calcular o valor do m³
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Criar Período
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Períodos</h3>
          <div className="space-y-2">
            {periodos.map((periodo) => (
              <button
                key={periodo.id}
                onClick={() => setSelectedPeriodo(periodo.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedPeriodo === periodo.id
                    ? 'bg-blue-100 border-2 border-blue-600 text-blue-900'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="font-medium">{meses[periodo.mes - 1]} {periodo.ano}</div>
                <div className="text-sm text-gray-600">
                  Total: R$ {periodo.valor_total.toFixed(2)}
                </div>
              </button>
            ))}
            {periodos.length === 0 && (
              <p className="text-gray-500 text-sm">Nenhum período cadastrado</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          {selectedPeriodo ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Consumo dos Moradores</h3>
                <button
                  onClick={calcularValores}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Calcular Valores</span>
                </button>
              </div>
              <div className="space-y-3">
                {moradores.map((morador) => (
                  <div key={morador.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Chácara {morador.numero_chacara}</div>
                      <div className="text-sm text-gray-500">{morador.nome}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        value={consumos[morador.id] || ''}
                        onChange={(e) => setConsumos({ ...consumos, [morador.id]: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">m³</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Selecione um período para gerenciar o consumo
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
