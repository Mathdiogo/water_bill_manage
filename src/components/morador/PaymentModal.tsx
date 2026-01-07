import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Consumo, Morador } from '../../types';
import { X, Copy, CheckCircle, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ConfirmModal } from '../common/ConfirmModal';
import { Toast } from '../common/Toast';

interface PaymentModalProps {
  consumo: Consumo;
  morador: Morador;
  onClose: () => void;
}

export function PaymentModal({ consumo, morador, onClose }: PaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [chavePix, setChavePix] = useState('seuemail@example.com');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const { data } = await supabase
      .from('configuracoes')
      .select('chave_pix')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setChavePix(data.chave_pix);
    }
  };

  const valorFormatado = consumo.valor_calculado.toFixed(2);
  
  // Gera o PIX Copia e Cola (formato simplificado)
  const pixCopyPaste = `${chavePix}`;
  
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCopyPaste);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirmPayment = async () => {
    setShowConfirm(false);
    setConfirming(true);
    try {
      const { error } = await supabase.from('pagamentos').insert([{
        consumo_id: consumo.id,
        morador_id: morador.id,
        periodo_id: consumo.periodo_id,
        valor: consumo.valor_calculado,
        status: 'pendente',
        comprovante: `Pagamento via PIX - ${new Date().toLocaleString('pt-BR')}`,
      }]);

      if (!error) {
        setToast({
          show: true,
          message: '✅ Pagamento enviado! Aguarde aprovação.',
          type: 'success',
        });
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        console.error('Erro ao registrar pagamento:', error);
        setToast({
          show: true,
          message: '❌ Erro ao registrar pagamento. Tente novamente.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      setToast({
        show: true,
        message: '❌ Erro ao registrar pagamento. Tente novamente.',
        type: 'error',
      });
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagamento via PIX</h2>
          <p className="text-sm text-gray-600">
            Chácara {morador.numero_chacara} - {morador.nome}
          </p>
        </div>

        {/* Valor a Pagar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 mb-6 text-white text-center">
          <div className="text-sm font-medium mb-1 opacity-90">Valor a Pagar</div>
          <div className="text-4xl font-bold mb-2">
            R$ {valorFormatado}
          </div>
          <div className="text-sm opacity-90">
            {meses[consumo.periodo!.mes - 1]} {consumo.periodo!.ano}
          </div>
          {consumo.consumo_m3 > 0 && (
            <div className="text-xs mt-2 opacity-80">
              Consumo: {consumo.consumo_m3.toFixed(2)} m³
            </div>
          )}
        </div>

        {/* QR Code */}
        {showQRCode ? (
          <div className="bg-white border-2 border-blue-200 rounded-xl p-6 mb-6 text-center">
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              <QRCodeSVG value={pixCopyPaste} size={200} level="H" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Escaneie o QR Code com o app do seu banco
            </p>
            <button
              onClick={() => setShowQRCode(false)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Voltar para chave PIX
            </button>
          </div>
        ) : (
          <>
            {/* Chave PIX */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave PIX (Email)
              </label>
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={chavePix}
                  readOnly
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm"
                />
                <button
                  onClick={handleCopy}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors"
                  title="Copiar chave PIX"
                >
                  {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              {copied && (
                <p className="text-green-600 text-sm font-medium">✅ Chave PIX copiada!</p>
              )}
              
              <button
                onClick={() => setShowQRCode(true)}
                className="w-full mt-3 flex items-center justify-center space-x-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <QrCode className="w-5 h-5" />
                <span>Ver QR Code</span>
              </button>
            </div>

            {/* Instruções */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-2">i</span>
                Como Pagar
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-900">
                <li>Abra o app do seu banco</li>
                <li>Escolha a opção <strong>PIX</strong></li>
                <li>Cole a chave PIX ou escaneie o QR Code</li>
                <li>Confirme o valor de <strong>R$ {valorFormatado}</strong></li>
                <li>Complete o pagamento</li>
                <li>Volte aqui e clique em "Confirmar Pagamento"</li>
              </ol>
            </div>
          </>
        )}

        {/* Botões de Ação */}
        <div className="space-y-3">
          <button
            onClick={() => setShowConfirm(true)}
            disabled={confirming}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {confirming ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Confirmando...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Confirmar Pagamento</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>

        {/* Aviso */}
        <p className="text-xs text-gray-500 text-center mt-4">
          ⚠️ Clique em "Confirmar Pagamento" apenas após realizar o pagamento
        </p>

        {/* Modais */}
        <ConfirmModal
          isOpen={showConfirm}
          title="Confirmar Pagamento"
          message="Você confirma que realizou o pagamento via PIX?"
          confirmText="Sim, Confirmar"
          cancelText="Cancelar"
          type="success"
          onConfirm={handleConfirmPayment}
          onCancel={() => setShowConfirm(false)}
        />

        <Toast
          message={toast.message}
          type={toast.type}
          isOpen={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
        />
      </div>
    </div>
  );
}
