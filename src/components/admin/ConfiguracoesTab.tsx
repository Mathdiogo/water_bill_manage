import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Configuracao } from '../../types';
import { Settings, Save } from 'lucide-react';
import { Toast } from '../common/Toast';
import { maskPhoneInput, isValidPhone } from '../../lib/phoneUtils';

export function ConfiguracoesTab() {
  const [config, setConfig] = useState<Configuracao | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    chave_pix: '',
    nome_associacao: '',
    telefone_contato: '',
    evolution_api_url: '',
    evolution_api_key: '',
    evolution_instance_name: '',
    taxa_minima_com_hidrometro: '10.00',
    taxa_minima_sem_hidrometro: '50.00',
    taxa_associado: '8.00',
    percentual_multa_atraso: '10.00',
    faixa_normal_ate: '30',
    faixa_excedente_1_ate: '50',
    faixa_excedente_1_percentual: '30.00',
    faixa_excedente_2_percentual: '60.00',
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
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('configuracoes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setConfig(data);
      setFormData({
        chave_pix: data.chave_pix,
        nome_associacao: data.nome_associacao,
        telefone_contato: data.telefone_contato || '',
        evolution_api_url: data.evolution_api_url || '',
        evolution_api_key: data.evolution_api_key || '',
        evolution_instance_name: data.evolution_instance_name || '',
        taxa_minima_com_hidrometro: data.taxa_minima_com_hidrometro?.toString() || '10.00',
        taxa_minima_sem_hidrometro: data.taxa_minima_sem_hidrometro?.toString() || '50.00',
        taxa_associado: data.taxa_associado?.toString() || '8.00',
        percentual_multa_atraso: data.percentual_multa_atraso?.toString() || '10.00',
        faixa_normal_ate: data.faixa_normal_ate?.toString() || '30',
        faixa_excedente_1_ate: data.faixa_excedente_1_ate?.toString() || '50',
        faixa_excedente_1_percentual: data.faixa_excedente_1_percentual?.toString() || '30.00',
        faixa_excedente_2_percentual: data.faixa_excedente_2_percentual?.toString() || '60.00',
      });
    }
    setLoading(false);
  };

  const handlePhoneChange = (value: string) => {
    const formatted = maskPhoneInput(value);
    setFormData({ ...formData, telefone_contato: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar telefone se preenchido
    if (formData.telefone_contato && !isValidPhone(formData.telefone_contato)) {
      setToast({
        show: true,
        message: '❌ Telefone inválido! Use o formato: +55 (DDD) XXXXX-XXXX',
        type: 'error',
      });
      return;
    }
    
    setSaving(true);

    if (config?.id) {
      // Atualizar existente
      const { error } = await supabase
        .from('configuracoes')
        .update({
          chave_pix: formData.chave_pix,
          nome_associacao: formData.nome_associacao,
          telefone_contato: formData.telefone_contato || null,
          evolution_api_url: formData.evolution_api_url || null,
          evolution_api_key: formData.evolution_api_key || null,
          evolution_instance_name: formData.evolution_instance_name || null,
          taxa_minima_com_hidrometro: parseFloat(formData.taxa_minima_com_hidrometro),
          taxa_minima_sem_hidrometro: parseFloat(formData.taxa_minima_sem_hidrometro),
          taxa_associado: parseFloat(formData.taxa_associado),
          percentual_multa_atraso: parseFloat(formData.percentual_multa_atraso),
          faixa_normal_ate: parseInt(formData.faixa_normal_ate),
          faixa_excedente_1_ate: parseInt(formData.faixa_excedente_1_ate),
          faixa_excedente_1_percentual: parseFloat(formData.faixa_excedente_1_percentual),
          faixa_excedente_2_percentual: parseFloat(formData.faixa_excedente_2_percentual),
          updated_at: new Date().toISOString(),
        })
        .eq('id', config.id);

      if (!error) {
        setToast({
          show: true,
          message: '✅ Configurações salvas com sucesso!',
          type: 'success',
        });
        loadConfig();
      } else {
        setToast({
          show: true,
          message: '❌ Erro ao salvar configurações.',
          type: 'error',
        });
      }
    } else {
      // Criar nova
      const { error } = await supabase
        .from('configuracoes')
        .insert([{
          chave_pix: formData.chave_pix,
          nome_associacao: formData.nome_associacao,
          telefone_contato: formData.telefone_contato || null,
          evolution_api_url: formData.evolution_api_url || null,
          evolution_api_key: formData.evolution_api_key || null,
          evolution_instance_name: formData.evolution_instance_name || null,
          taxa_minima_com_hidrometro: parseFloat(formData.taxa_minima_com_hidrometro),
          taxa_minima_sem_hidrometro: parseFloat(formData.taxa_minima_sem_hidrometro),
          taxa_associado: parseFloat(formData.taxa_associado),
          percentual_multa_atraso: parseFloat(formData.percentual_multa_atraso),
          faixa_normal_ate: parseInt(formData.faixa_normal_ate),
          faixa_excedente_1_ate: parseInt(formData.faixa_excedente_1_ate),
          faixa_excedente_1_percentual: parseFloat(formData.faixa_excedente_1_percentual),
          faixa_excedente_2_percentual: parseFloat(formData.faixa_excedente_2_percentual),
        }]);

      if (!error) {
        setToast({
          show: true,
          message: '✅ Configurações criadas com sucesso!',
          type: 'success',
        });
        loadConfig();
      } else {
        setToast({
          show: true,
          message: '❌ Erro ao criar configurações.',
          type: 'error',
        });
      }
    }

    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Carregando...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
        <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm text-blue-900">
          💡 <strong>Dica:</strong> A chave PIX configurada aqui será usada automaticamente em todos os pagamentos. 
          O telefone de contato é opcional e pode ser usado para identificação da associação.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Nome da Associação */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            Nome da Associação *
          </label>
          <input
            type="text"
            value={formData.nome_associacao}
            onChange={(e) => setFormData({ ...formData, nome_associacao: e.target.value })}
            placeholder="Ex: AMCRS - Associação de Moradores"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Nome que aparecerá nas mensagens e documentos
          </p>
        </div>

        {/* Chave PIX */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            Chave PIX da Associação *
          </label>
          <input
            type="text"
            value={formData.chave_pix}
            onChange={(e) => setFormData({ ...formData, chave_pix: e.target.value })}
            placeholder="email@exemplo.com ou CPF/CNPJ"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            required
          />
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
            Esta chave será usada para todos os pagamentos via PIX
          </p>
        </div>

        {/* Telefone de Contato */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            Telefone de Contato (Opcional)
          </label>
          <input
            type="text"
            value={formData.telefone_contato}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="+55 (00) 00000-0000"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
            Formato: +55 (DDD) XXXXX-XXXX - Digite apenas os números
          </p>
        </div>

        {/* Divisor Taxas e Valores */}
        <div className="pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm mr-3">💰</span>
            Taxas e Valores de Cobrança
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Configure as taxas que serão aplicadas nos cálculos automáticos
          </p>
        </div>

        {/* Grid de Taxas Mínimas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taxa Mínima (COM Hidrômetro) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.taxa_minima_com_hidrometro}
                onChange={(e) => setFormData({ ...formData, taxa_minima_com_hidrometro: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Cobrado quando consumo = 0 m³ (tem hidrômetro)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taxa Mínima (SEM Hidrômetro) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.taxa_minima_sem_hidrometro}
                onChange={(e) => setFormData({ ...formData, taxa_minima_sem_hidrometro: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Cobrado quando consumo = 0 m³ (sem hidrômetro)
            </p>
          </div>
        </div>

        {/* Grid de Taxa de Associado e Multa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taxa de Associado *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.taxa_associado}
                onChange={(e) => setFormData({ ...formData, taxa_associado: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Valor fixo cobrado de todos os moradores
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Multa por Atraso *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.percentual_multa_atraso}
                onChange={(e) => setFormData({ ...formData, percentual_multa_atraso: e.target.value })}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <span className="absolute right-3 top-3 text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Percentual aplicado após o vencimento
            </p>
          </div>
        </div>

        {/* Divisor Faixas de Consumo */}
        <div className="pt-4 border-t">
          <h4 className="text-md font-semibold text-gray-800 mb-3">
            🎯 Faixas de Consumo Excedente
          </h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-900">
              <strong>Como funciona:</strong> Consumos até a "Faixa Normal" não têm taxa extra. 
              Acima disso, aplica-se percentual progressivo conforme o consumo aumenta.
            </p>
          </div>
        </div>

        {/* Grid Faixas de Consumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Faixa Normal (até) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={formData.faixa_normal_ate}
                onChange={(e) => setFormData({ ...formData, faixa_normal_ate: e.target.value })}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <span className="absolute right-3 top-3 text-gray-500">m³</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Sem taxa adicional
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              1ª Faixa Excedente (até) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={formData.faixa_excedente_1_ate}
                onChange={(e) => setFormData({ ...formData, faixa_excedente_1_ate: e.target.value })}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <span className="absolute right-3 top-3 text-gray-500">m³</span>
            </div>
            <div className="mt-2">
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.faixa_excedente_1_percentual}
                  onChange={(e) => setFormData({ ...formData, faixa_excedente_1_percentual: e.target.value })}
                  className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Taxa adicional
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2ª Faixa Excedente (acima) *
            </label>
            <div className="bg-gray-100 px-4 py-3 border border-gray-300 rounded-lg text-gray-600">
              Acima de {formData.faixa_excedente_1_ate} m³
            </div>
            <div className="mt-2">
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.faixa_excedente_2_percentual}
                  onChange={(e) => setFormData({ ...formData, faixa_excedente_2_percentual: e.target.value })}
                  className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Taxa adicional
              </p>
            </div>
          </div>
        </div>

        {/* Exemplo de Cálculo */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4">
          <h4 className="font-bold text-yellow-900 mb-2 flex items-center">
            <span className="mr-2">📊</span>
            Exemplo de Cálculo (Consumo de 55 m³)
          </h4>
          <div className="text-xs text-yellow-900 space-y-1 font-mono">
            <p>• 0 a {formData.faixa_normal_ate} m³: {formData.faixa_normal_ate} × R$ 4,08 = R$ {(parseInt(formData.faixa_normal_ate) * 4.08).toFixed(2)}</p>
            <p>• {formData.faixa_normal_ate} a {formData.faixa_excedente_1_ate} m³: {parseInt(formData.faixa_excedente_1_ate) - parseInt(formData.faixa_normal_ate)} × R$ 4,08 × 1,{formData.faixa_excedente_1_percentual} = R$ {((parseInt(formData.faixa_excedente_1_ate) - parseInt(formData.faixa_normal_ate)) * 4.08 * (1 + parseFloat(formData.faixa_excedente_1_percentual)/100)).toFixed(2)}</p>
            <p>• Acima de {formData.faixa_excedente_1_ate} m³: 5 × R$ 4,08 × 1,{formData.faixa_excedente_2_percentual} = R$ {(5 * 4.08 * (1 + parseFloat(formData.faixa_excedente_2_percentual)/100)).toFixed(2)}</p>
            <p className="pt-2 border-t border-yellow-300">• Taxa de Associado: R$ {formData.taxa_associado}</p>
            <p className="font-bold text-sm pt-1">• TOTAL: R$ {(
              (parseInt(formData.faixa_normal_ate) * 4.08) +
              ((parseInt(formData.faixa_excedente_1_ate) - parseInt(formData.faixa_normal_ate)) * 4.08 * (1 + parseFloat(formData.faixa_excedente_1_percentual)/100)) +
              (5 * 4.08 * (1 + parseFloat(formData.faixa_excedente_2_percentual)/100)) +
              parseFloat(formData.taxa_associado)
            ).toFixed(2)}</p>
          </div>
        </div>

        {/* Divisor Evolution API */}
        <div className="pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm mr-3">📱</span>
            Evolution API - WhatsApp Automático
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Configure sua instância da Evolution API para enviar mensagens automaticamente
          </p>
        </div>

        {/* Evolution API URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL da Evolution API
          </label>
          <input
            type="url"
            value={formData.evolution_api_url}
            onChange={(e) => setFormData({ ...formData, evolution_api_url: e.target.value })}
            placeholder="https://sua-evolution-api.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ex: https://evolution.seudominio.com ou http://localhost:8080
          </p>
        </div>

        {/* Evolution API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Key (Token de Autenticação)
          </label>
          <input
            type="password"
            value={formData.evolution_api_key}
            onChange={(e) => setFormData({ ...formData, evolution_api_key: e.target.value })}
            placeholder="Sua API Key da Evolution"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Token de autenticação configurado na Evolution API
          </p>
        </div>

        {/* Evolution Instance Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Instância
          </label>
          <input
            type="text"
            value={formData.evolution_instance_name}
            onChange={(e) => setFormData({ ...formData, evolution_instance_name: e.target.value })}
            placeholder="amcrs-whatsapp"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Nome da instância criada na Evolution API
          </p>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Salvar Configurações</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Guia de Instalação Evolution API */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6">
        <h3 className="font-bold text-green-900 mb-4 flex items-center text-lg">
          <span className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-xl mr-3">📚</span>
          Como instalar a Evolution API
        </h3>
        <div className="space-y-4 text-sm text-green-900">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <p className="font-semibold mb-2">🚀 Opção 1: Instalação Rápida (Docker)</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Instale Docker no seu servidor</li>
              <li>Execute: <code className="bg-green-100 px-2 py-1 rounded text-xs">docker run -d evolutionapi/evolution-api</code></li>
              <li>Acesse: http://seu-servidor:8080</li>
            </ol>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <p className="font-semibold mb-2">☁️ Opção 2: Usar Serviço Cloud</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Railway, Render ou Heroku (gratuito/barato)</li>
              <li>Deploy automático em poucos cliques</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 border border-green-200">
            <p className="font-semibold mb-2">📖 Links Úteis:</p>
            <ul className="space-y-1">
              <li>• Documentação: <a href="https://doc.evolution-api.com" target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline font-mono text-xs">doc.evolution-api.com</a></li>
              <li>• GitHub: <a href="https://github.com/EvolutionAPI/evolution-api" target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline font-mono text-xs">github.com/EvolutionAPI/evolution-api</a></li>
              <li>• Grupo Telegram: Suporte em português</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
            <p className="font-semibold text-yellow-900 mb-1">⚠️ Importante:</p>
            <p className="text-yellow-800 text-xs">
              Após instalar, você precisará criar uma instância e conectar seu número WhatsApp escaneando um QR Code.
              Guarde a API Key e o nome da instância para configurar aqui.
            </p>
          </div>
        </div>
      </div>

      {/* Informações sobre WhatsApp */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-3 flex items-center">
          <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm mr-3">?</span>
          Como funcionará o Disparo Automático?
        </h3>
        <div className="space-y-2 text-sm text-green-900">
          <p>
            ✅ <strong>100% Automático!</strong> Com a Evolution API configurada:
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Admin clica em "Disparar WhatsApp"</li>
            <li>Sistema envia todas as mensagens automaticamente</li>
            <li>As mensagens saem do número WhatsApp conectado na Evolution</li>
            <li>Moradores recebem instantaneamente</li>
            <li><strong>Admin não precisa fazer mais nada!</strong> 🎉</li>
          </ol>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
