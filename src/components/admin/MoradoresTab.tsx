import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Morador } from '../../types';
import { Plus, Trash2, UserCheck, UserX } from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';
import { Toast } from '../common/Toast';
import { maskPhoneInput, formatPhoneNumber, isValidPhone } from '../../lib/phoneUtils';

export function MoradoresTab() {
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    numero_chacara: '',
    nome: '',
    telefone: '',
    tem_hidrometro: true,
  });
  
  // Estados para modais
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    moradorId: string | null;
  }>({
    show: false,
    moradorId: null,
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
    loadMoradores();
  }, []);

  const loadMoradores = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('moradores')
      .select('*')
      .order('numero_chacara');
    if (data) setMoradores(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar telefone se preenchido
    if (formData.telefone && !isValidPhone(formData.telefone)) {
      setToast({
        show: true,
        message: '❌ Telefone inválido! Use o formato: +55 (DDD) XXXXX-XXXX',
        type: 'error',
      });
      return;
    }
    
    const { error } = await supabase.from('moradores').insert([formData]);
    if (!error) {
      setFormData({ numero_chacara: '', nome: '', telefone: '', tem_hidrometro: true });
      setShowForm(false);
      setToast({
        show: true,
        message: '✅ Morador cadastrado com sucesso!',
        type: 'success',
      });
      loadMoradores();
    } else {
      setToast({
        show: true,
        message: '❌ Erro ao cadastrar morador. Verifique os dados.',
        type: 'error',
      });
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = maskPhoneInput(value);
    setFormData({ ...formData, telefone: formatted });
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    await supabase.from('moradores').update({ ativo: !ativo }).eq('id', id);
    setToast({
      show: true,
      message: ativo ? '⚠️ Morador desativado' : '✅ Morador ativado',
      type: ativo ? 'warning' : 'success',
    });
    loadMoradores();
  };

  const deleteMorador = async (id: string) => {
    setConfirmModal({ show: true, moradorId: id });
  };

  const executeDelete = async () => {
    if (!confirmModal.moradorId) return;
    
    setConfirmModal({ show: false, moradorId: null });
    
    const { error } = await supabase
      .from('moradores')
      .delete()
      .eq('id', confirmModal.moradorId);
    
    if (!error) {
      setToast({
        show: true,
        message: '✅ Morador removido com sucesso!',
        type: 'success',
      });
      loadMoradores();
    } else {
      setToast({
        show: true,
        message: '❌ Erro ao remover morador. Tente novamente.',
        type: 'error',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Carregando...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Moradores Cadastrados</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Novo Morador</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Cadastrar Novo Morador</h3>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Número da Chácara *
                </label>
                <input
                  type="text"
                  value={formData.numero_chacara}
                  onChange={(e) => setFormData({ ...formData, numero_chacara: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+55 (00) 00000-0000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Digite apenas os números
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.tem_hidrometro}
                  onChange={(e) => setFormData({ ...formData, tem_hidrometro: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Tem Hidrômetro Instalado</span>
                  <p className="text-xs text-gray-500">
                    Define a taxa mínima aplicada quando consumo = 0 m³
                  </p>
                </div>
              </label>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Cadastrar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Chácara
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Nome
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Telefone
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Hidrômetro
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {moradores.map((morador) => (
                <tr key={morador.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm font-medium text-gray-900">
                      Chácara {morador.numero_chacara}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-gray-900">{morador.nome}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-gray-500">
                      {morador.telefone ? formatPhoneNumber(morador.telefone) : '-'}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                    {morador.tem_hidrometro ? (
                      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium bg-blue-100 text-blue-800">
                        ✓ Sim
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-600">
                        ✗ Não
                      </span>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  {morador.ativo ? (
                    <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-800">
                      <UserCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-800">
                      <UserX className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                      Inativo
                    </span>
                  )}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                  <button
                    onClick={() => toggleAtivo(morador.id, morador.ativo)}
                    className="text-blue-600 hover:text-blue-900 mr-2 sm:mr-4 text-[10px] sm:text-sm"
                  >
                    {morador.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => deleteMorador(morador.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {moradores.length === 0 && (
          <div className="text-center py-12 text-sm sm:text-base text-gray-500">
            Nenhum morador cadastrado ainda
          </div>
        )}
      </div>

      {/* Modais */}
      <ConfirmModal
        isOpen={confirmModal.show}
        title="Remover Morador"
        message="Tem certeza que deseja remover este morador? Esta ação não pode ser desfeita."
        confirmText="Sim, Remover"
        cancelText="Cancelar"
        type="danger"
        onConfirm={executeDelete}
        onCancel={() => setConfirmModal({ show: false, moradorId: null })}
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
