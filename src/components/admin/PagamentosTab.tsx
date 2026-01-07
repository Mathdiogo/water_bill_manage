import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Periodo, Consumo, Pagamento } from '../../types';
import { CheckCircle, XCircle, RefreshCw, Check, X, Clock, MessageCircle, CheckCheck } from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';
import { Toast } from '../common/Toast';
import { phoneToWhatsApp } from '../../lib/phoneUtils';

interface ConsumoComDetalhes extends Consumo {
  pagamentos: Pagamento[];
}

// Chave para localStorage
const WHATSAPP_ENVIOS_KEY = 'whatsapp_envios_';

export function PagamentosTab() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState<string | null>(null);
  const [consumos, setConsumos] = useState<ConsumoComDetalhes[]>([]);
  const [loading, setLoading] = useState(true);
  const [enviadosWhatsApp, setEnviadosWhatsApp] = useState<Set<string>>(new Set());
  
  // Estados para modais
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    type: 'approve' | 'reject' | null;
    pagamentoId: string | null;
  }>({
    show: false,
    type: null,
    pagamentoId: null,
  });
  
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
    loadPeriodos();
  }, []);

  useEffect(() => {
    if (selectedPeriodo) {
      loadConsumos(selectedPeriodo);
      loadEnviadosWhatsApp(selectedPeriodo);
    }
  }, [selectedPeriodo]);

  const loadEnviadosWhatsApp = (periodoId: string) => {
    const key = WHATSAPP_ENVIOS_KEY + periodoId;
    const saved = localStorage.getItem(key);
    if (saved) {
      setEnviadosWhatsApp(new Set(JSON.parse(saved)));
    } else {
      setEnviadosWhatsApp(new Set());
    }
  };

  const marcarEnvioWhatsApp = (moradorId: string) => {
    if (!selectedPeriodo) return;
    const key = WHATSAPP_ENVIOS_KEY + selectedPeriodo;
    const novosEnviados = new Set(enviadosWhatsApp);
    novosEnviados.add(moradorId);
    setEnviadosWhatsApp(novosEnviados);
    localStorage.setItem(key, JSON.stringify([...novosEnviados]));
  };

  const limparEnviosWhatsApp = () => {
    if (!selectedPeriodo) return;
    const key = WHATSAPP_ENVIOS_KEY + selectedPeriodo;
    localStorage.removeItem(key);
    setEnviadosWhatsApp(new Set());
    setToast({
      show: true,
      message: '🔄 Marcações de envio limpas!',
      type: 'success',
    });
  };

  const loadPeriodos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('periodos')
      .select('*')
      .order('ano', { ascending: false })
      .order('mes', { ascending: false });
    if (data) {
      setPeriodos(data);
      if (data.length > 0) setSelectedPeriodo(data[0].id);
    }
    setLoading(false);
  };

  const loadConsumos = async (periodoId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('consumos')
      .select(`
        *,
        morador:moradores(*),
        pagamentos(*)
      `)
      .eq('periodo_id', periodoId);

    if (data) {
      setConsumos(data as any);
    }
    setLoading(false);
  };

  const handleRefresh = () => {
    if (selectedPeriodo) {
      loadConsumos(selectedPeriodo);
    }
  };

  const handleApprovePayment = async (pagamentoId: string) => {
    setConfirmModal({ show: true, type: 'approve', pagamentoId });
  };

  const handleRejectPayment = async (pagamentoId: string) => {
    setConfirmModal({ show: true, type: 'reject', pagamentoId });
  };

  const executeApprove = async () => {
    if (!confirmModal.pagamentoId) return;
    
    setConfirmModal({ show: false, type: null, pagamentoId: null });
    
    const { error } = await supabase
      .from('pagamentos')
      .update({ status: 'aprovado' })
      .eq('id', confirmModal.pagamentoId);
    
    if (!error) {
      setToast({
        show: true,
        message: '✅ Pagamento aprovado com sucesso!',
        type: 'success',
      });
      handleRefresh();
    } else {
      setToast({
        show: true,
        message: '❌ Erro ao aprovar pagamento. Tente novamente.',
        type: 'error',
      });
    }
  };

  const executeReject = async () => {
    if (!confirmModal.pagamentoId) return;
    
    setConfirmModal({ show: false, type: null, pagamentoId: null });
    
    const { error } = await supabase
      .from('pagamentos')
      .update({ status: 'rejeitado' })
      .eq('id', confirmModal.pagamentoId);
    
    if (!error) {
      setToast({
        show: true,
        message: '⚠️ Pagamento rejeitado. O morador poderá enviar novamente.',
        type: 'warning',
      });
      handleRefresh();
    } else {
      setToast({
        show: true,
        message: '❌ Erro ao rejeitar pagamento. Tente novamente.',
        type: 'error',
      });
    }
  };

  const handleEnviarWhatsAppMorador = (consumo: ConsumoComDetalhes) => {
    if (!periodo || !consumo.morador) return;
    
    const morador = consumo.morador;
    if (!morador.telefone) {
      setToast({
        show: true,
        message: '❌ Morador sem telefone cadastrado!',
        type: 'error',
      });
      return;
    }

    const mesNome = meses[periodo.mes - 1];
    const linkSite = window.location.origin;
    const telefone = phoneToWhatsApp(morador.telefone);
    
    // Mensagem personalizada
    const mensagem = `🌊 *AMCRS - Pagamento de Água*\n\n` +
      `Olá *${morador.nome}*!\n\n` +
      `A conta de água da sua Chácara *${morador.numero_chacara}* referente a *${mesNome}/${periodo.ano}* está disponível para pagamento.\n\n` +
      `💰 *Valor:* R$ ${consumo.valor_calculado.toFixed(2)}\n` +
      `📊 *Consumo:* ${consumo.consumo_m3.toFixed(2)} m³\n\n` +
      `Para pagar via PIX, acesse:\n${linkSite}\n\n` +
      `_Faça login com o número da sua chácara._`;

    const mensagemCodificada = encodeURIComponent(mensagem);
    const urlWhatsApp = `https://wa.me/${telefone}?text=${mensagemCodificada}`;
    
    // Marcar como enviado
    marcarEnvioWhatsApp(morador.id);
    
    // Abrir WhatsApp
    window.open(urlWhatsApp, '_blank');
    
    setToast({
      show: true,
      message: `✅ WhatsApp aberto para ${morador.nome}`,
      type: 'success',
    });
  };

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const periodo = periodos.find((p) => p.id === selectedPeriodo);
  const totalAprovado = consumos.reduce((sum, c) => {
    const pagAprovado = c.pagamentos.find(p => p.status === 'aprovado');
    return sum + (pagAprovado ? c.valor_calculado : 0);
  }, 0);
  const totalPendente = consumos.reduce((sum, c) => {
    const pagPendente = c.pagamentos.find(p => p.status === 'pendente');
    return sum + (pagPendente ? c.valor_calculado : 0);
  }, 0);
  const totalSemPagamento = consumos.reduce((sum, c) => {
    return sum + (c.pagamentos.length === 0 ? c.valor_calculado : 0);
  }, 0);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Carregando...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Controle de Pagamentos</h2>
        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
          <button
            onClick={limparEnviosWhatsApp}
            disabled={loading || !selectedPeriodo || enviadosWhatsApp.size === 0}
            className="flex items-center justify-center space-x-1.5 sm:space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm flex-1 sm:flex-initial"
            title="Limpar marcações de WhatsApp enviado"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Limpar Envios</span>
            <span className="sm:hidden">Limpar</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center justify-center space-x-1.5 sm:space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm flex-1 sm:flex-initial"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="text-[10px] sm:text-sm text-blue-600 font-medium">Período</div>
          <div className="text-lg sm:text-2xl font-bold text-blue-900 mt-1">
            {periodo ? `${meses[periodo.mes - 1]} ${periodo.ano}` : '-'}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <div className="text-[10px] sm:text-sm text-green-600 font-medium">✓ Aprovados</div>
          <div className="text-lg sm:text-2xl font-bold text-green-900 mt-1">
            R$ {totalAprovado.toFixed(2)}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <div className="text-[10px] sm:text-sm text-yellow-600 font-medium">⏳ Pendentes</div>
          <div className="text-lg sm:text-2xl font-bold text-yellow-900 mt-1">
            R$ {totalPendente.toFixed(2)}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <div className="text-[10px] sm:text-sm text-red-600 font-medium">✗ Não Pagos</div>
          <div className="text-lg sm:text-2xl font-bold text-red-900 mt-1">
            R$ {totalSemPagamento.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {periodos.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPeriodo(p.id)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap transition-colors text-xs sm:text-sm ${
              selectedPeriodo === p.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {meses[p.mes - 1]} {p.ano}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Chácara
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Morador
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Consumo
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Valor
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {consumos.map((consumo) => {
              const pagamento = consumo.pagamentos[0];
              const status = (pagamento?.status || 'sem_pagamento') as 'sem_pagamento' | 'pendente' | 'aprovado' | 'rejeitado';
              
              return (
              <tr key={consumo.id} className="hover:bg-gray-50">
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm font-medium text-gray-900">
                    Chácara {consumo.morador?.numero_chacara}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm text-gray-900">{consumo.morador?.nome}</div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm text-gray-900">{consumo.consumo_m3.toFixed(2)} m³</div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm font-medium text-gray-900">
                    R$ {consumo.valor_calculado.toFixed(2)}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                  {status === 'aprovado' ? (
                    <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">Aprovado</span>
                      <span className="sm:hidden">✓</span>
                    </span>
                  ) : status === 'pendente' ? (
                    <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">Pendente</span>
                      <span className="sm:hidden">⏳</span>
                    </span>
                  ) : status === 'rejeitado' ? (
                    <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-red-100 text-red-800">
                      <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">Rejeitado</span>
                      <span className="sm:hidden">✗</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-800">
                      <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">Não Pago</span>
                      <span className="sm:hidden">-</span>
                    </span>
                  )}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                    {status === 'pendente' && (
                      <>
                        <button
                          onClick={() => handleApprovePayment(pagamento.id)}
                          className="inline-flex items-center px-2 sm:px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] sm:text-xs font-medium rounded transition-colors w-full sm:w-auto justify-center"
                          title="Aprovar pagamento"
                        >
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Aprovar</span>
                        </button>
                        <button
                          onClick={() => handleRejectPayment(pagamento.id)}
                          className="inline-flex items-center px-2 sm:px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-xs font-medium rounded transition-colors w-full sm:w-auto justify-center"
                          title="Rejeitar pagamento"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Rejeitar</span>
                        </button>
                      </>
                    )}
                    {status === 'aprovado' && (
                      <span className="text-[10px] sm:text-xs text-gray-500">
                        {new Date(pagamento.data_pagamento).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    {(status === 'sem_pagamento' || status === 'rejeitado') && consumo.morador?.telefone && (
                      <button
                        onClick={() => handleEnviarWhatsAppMorador(consumo)}
                        className={`inline-flex items-center px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded transition-colors w-full sm:w-auto justify-center ${
                          enviadosWhatsApp.has(consumo.morador?.id || '')
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        title={
                          enviadosWhatsApp.has(consumo.morador?.id || '')
                            ? 'WhatsApp já enviado - Clique para reenviar'
                            : 'Enviar cobrança via WhatsApp'
                        }
                      >
                        {enviadosWhatsApp.has(consumo.morador?.id || '') ? (
                          <>
                            <CheckCheck className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                            <span className="hidden sm:inline">Enviado</span>
                          </>
                        ) : (
                          <>
                            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                            <span className="hidden sm:inline">WhatsApp</span>
                            <span className="sm:hidden">Msg</span>
                          </>
                        )}
                      </button>
                    )}
                    {(status === 'sem_pagamento' || status === 'rejeitado') && !consumo.morador?.telefone && (
                      <span className="text-[10px] sm:text-xs text-gray-400 italic">Sem tel.</span>
                    )}
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        </div>
        {consumos.length === 0 && (
          <div className="text-center py-12 text-sm sm:text-base text-gray-500">
            Nenhum consumo registrado para este período
          </div>
        )}
      </div>

      {/* Modais */}
      <ConfirmModal
        isOpen={confirmModal.show}
        title={
          confirmModal.type === 'approve' 
            ? 'Aprovar Pagamento' 
            : 'Rejeitar Pagamento'
        }
        message={
          confirmModal.type === 'approve'
            ? 'Você confirma que deseja aprovar este pagamento?'
            : 'Tem certeza que deseja rejeitar este pagamento? O morador poderá enviar um novo comprovante.'
        }
        confirmText={
          confirmModal.type === 'approve' 
            ? 'Sim, Aprovar' 
            : 'Sim, Rejeitar'
        }
        cancelText="Cancelar"
        type={
          confirmModal.type === 'approve' 
            ? 'success' 
            : 'danger'
        }
        onConfirm={
          confirmModal.type === 'approve' 
            ? executeApprove 
            : executeReject
        }
        onCancel={() => setConfirmModal({ show: false, type: null, pagamentoId: null })}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
