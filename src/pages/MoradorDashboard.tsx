import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Consumo, Pagamento } from '../types';
import { LogOut, History, Droplets, CreditCard } from 'lucide-react';
import { PaymentModal } from '../components/morador/PaymentModal';
import { formatPhoneNumber } from '../lib/phoneUtils';

interface ConsumoComPagamento extends Consumo {
  pagamentos: Pagamento[];
}

export function MoradorDashboard() {
  const { morador, logout } = useAuth();
  const [consumos, setConsumos] = useState<ConsumoComPagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsumo, setSelectedConsumo] = useState<ConsumoComPagamento | null>(null);

  useEffect(() => {
    if (morador) {
      loadConsumos();
    }
  }, [morador]);

  const loadConsumos = async () => {
    if (!morador) return;

    setLoading(true);
    const { data } = await supabase
      .from('consumos')
      .select(`
        *,
        periodo:periodos(*),
        pagamentos(*)
      `)
      .eq('morador_id', morador.id)
      .order('created_at', { ascending: false });

    if (data) {
      setConsumos(data as any);
    }
    setLoading(false);
  };

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const consumoPendente = consumos.find((c) => c.pagamentos.length === 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold">AMCRS</h1>
                <p className="text-[10px] sm:text-xs text-blue-100">Chácara {morador?.numero_chacara}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-1.5 sm:space-x-2 bg-blue-700 hover:bg-blue-800 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Sair</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-bold text-blue-600">
                {morador?.numero_chacara}
              </span>
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{morador?.nome}</h2>
              <p className="text-sm sm:text-base text-gray-600">
                {morador?.telefone ? formatPhoneNumber(morador.telefone) : 'Bem-vindo ao sistema de pagamentos'}
              </p>
            </div>
          </div>
        </div>

        {consumoPendente && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-medium opacity-90">Pagamento Pendente</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                  R$ {consumoPendente.valor_calculado.toFixed(2)}
                </h3>
                <p className="text-sm sm:text-base text-blue-100">
                  Referente a {meses[consumoPendente.periodo!.mes - 1]} {consumoPendente.periodo!.ano}
                </p>
                <p className="text-xs sm:text-sm text-blue-100 mt-1">
                  Consumo: {consumoPendente.consumo_m3.toFixed(2)} m³
                </p>
              </div>
              <button
                onClick={() => setSelectedConsumo(consumoPendente)}
                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-colors shadow-md text-sm sm:text-base"
              >
                Pagar Agora
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex items-center space-x-2 mb-4 sm:mb-6">
            <History className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Histórico de Pagamentos</h3>
          </div>

          {loading ? (
            <div className="text-center py-8 text-sm sm:text-base text-gray-500">Carregando...</div>
          ) : consumos.length > 0 ? (
            <div className="space-y-3">
              {consumos.map((consumo) => {
                const pagamento = consumo.pagamentos[0];
                const isPago = pagamento && pagamento.status === 'aprovado';
                const isPendente = pagamento && pagamento.status === 'pendente';
                const isRejeitado = pagamento && pagamento.status === 'rejeitado';
                
                return (
                  <div
                    key={consumo.id}
                    className={`border-2 rounded-xl p-3 sm:p-4 transition-all ${
                      isPago
                        ? 'border-green-200 bg-green-50'
                        : isPendente
                        ? 'border-yellow-200 bg-yellow-50'
                        : isRejeitado
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
                      <div>
                        <div className="font-semibold text-sm sm:text-base text-gray-900">
                          {meses[consumo.periodo!.mes - 1]} {consumo.periodo!.ano}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">
                          Consumo: {consumo.consumo_m3.toFixed(2)} m³
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-lg sm:text-xl font-bold text-gray-900">
                          R$ {consumo.valor_calculado.toFixed(2)}
                        </div>
                        <div className="mt-1">
                          {isPago ? (
                            <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-green-600 text-white text-[10px] sm:text-xs font-medium rounded-full">
                              ✓ Pago
                            </span>
                          ) : isPendente ? (
                            <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-yellow-600 text-white text-[10px] sm:text-xs font-medium rounded-full">
                              ⏳ Aguardando Aprovação
                            </span>
                          ) : isRejeitado ? (
                            <button
                              onClick={() => setSelectedConsumo(consumo)}
                              className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-xs font-medium rounded-full transition-colors"
                            >
                              ✗ Rejeitado - Pagar Novamente
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedConsumo(consumo)}
                              className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-xs font-medium rounded-full transition-colors"
                            >
                              Pagar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    {isPago && pagamento && (
                      <div className="mt-3 pt-3 border-t border-green-200 text-xs sm:text-sm text-gray-600">
                        ✓ Aprovado em {new Date(pagamento.data_pagamento).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    {isPendente && (
                      <div className="mt-3 pt-3 border-t border-yellow-200 text-xs sm:text-sm text-yellow-700">
                        ⏳ Aguardando aprovação do administrador
                      </div>
                    )}
                    {isRejeitado && pagamento && (
                      <div className="mt-3 pt-3 border-t border-red-200 text-xs sm:text-sm text-red-700">
                        ✗ Pagamento rejeitado. Entre em contato com o administrador.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-sm sm:text-base text-gray-500">
              Nenhum histórico de consumo disponível
            </div>
          )}
        </div>
      </div>

      {selectedConsumo && (
        <PaymentModal
          consumo={selectedConsumo}
          morador={morador!}
          onClose={() => {
            setSelectedConsumo(null);
            loadConsumos();
          }}
        />
      )}
    </div>
  );
}
