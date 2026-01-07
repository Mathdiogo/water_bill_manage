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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Droplets className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold">AMCRS</h1>
                <p className="text-xs text-blue-100">Chácara {morador?.numero_chacara}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {morador?.numero_chacara}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{morador?.nome}</h2>
              <p className="text-gray-600">
                {morador?.telefone ? formatPhoneNumber(morador.telefone) : 'Bem-vindo ao sistema de pagamentos'}
              </p>
            </div>
          </div>
        </div>

        {consumoPendente && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 mb-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Pagamento Pendente</span>
                </div>
                <h3 className="text-3xl font-bold mb-2">
                  R$ {consumoPendente.valor_calculado.toFixed(2)}
                </h3>
                <p className="text-blue-100">
                  Referente a {meses[consumoPendente.periodo!.mes - 1]} {consumoPendente.periodo!.ano}
                </p>
                <p className="text-sm text-blue-100 mt-1">
                  Consumo: {consumoPendente.consumo_m3.toFixed(2)} m³
                </p>
              </div>
              <button
                onClick={() => setSelectedConsumo(consumoPendente)}
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl transition-colors shadow-md"
              >
                Pagar Agora
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <History className="w-5 h-5 text-gray-600" />
            <h3 className="text-xl font-bold text-gray-900">Histórico de Pagamentos</h3>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
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
                    className={`border-2 rounded-xl p-4 transition-all ${
                      isPago
                        ? 'border-green-200 bg-green-50'
                        : isPendente
                        ? 'border-yellow-200 bg-yellow-50'
                        : isRejeitado
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {meses[consumo.periodo!.mes - 1]} {consumo.periodo!.ano}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Consumo: {consumo.consumo_m3.toFixed(2)} m³
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          R$ {consumo.valor_calculado.toFixed(2)}
                        </div>
                        <div className="mt-1">
                          {isPago ? (
                            <span className="inline-block px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                              ✓ Pago
                            </span>
                          ) : isPendente ? (
                            <span className="inline-block px-3 py-1 bg-yellow-600 text-white text-xs font-medium rounded-full">
                              ⏳ Aguardando Aprovação
                            </span>
                          ) : isRejeitado ? (
                            <button
                              onClick={() => setSelectedConsumo(consumo)}
                              className="inline-block px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-full transition-colors"
                            >
                              ✗ Rejeitado - Pagar Novamente
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedConsumo(consumo)}
                              className="inline-block px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-full transition-colors"
                            >
                              Pagar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    {isPago && pagamento && (
                      <div className="mt-3 pt-3 border-t border-green-200 text-sm text-gray-600">
                        ✓ Aprovado em {new Date(pagamento.data_pagamento).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    {isPendente && (
                      <div className="mt-3 pt-3 border-t border-yellow-200 text-sm text-yellow-700">
                        ⏳ Aguardando aprovação do administrador
                      </div>
                    )}
                    {isRejeitado && pagamento && (
                      <div className="mt-3 pt-3 border-t border-red-200 text-sm text-red-700">
                        ✗ Pagamento rejeitado. Entre em contato com o administrador.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
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
