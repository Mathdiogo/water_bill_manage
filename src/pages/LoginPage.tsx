import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Droplets, User, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Morador } from '../types';

export function LoginPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [numeroChacara, setNumeroChacara] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para confirmação do morador
  const [showConfirmMorador, setShowConfirmMorador] = useState(false);
  const [moradorData, setMoradorData] = useState<Morador | null>(null);
  
  const { loginAdmin, loginMorador } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isAdmin) {
        await loginAdmin(email, password);
      } else {
        // Buscar dados do morador para confirmação
        const { data, error: fetchError } = await supabase
          .from('moradores')
          .select('*')
          .eq('numero_chacara', numeroChacara)
          .eq('ativo', true)
          .single();

        if (fetchError || !data) {
          throw new Error('Chácara não encontrada ou inativa');
        }

        // Mostrar tela de confirmação
        setMoradorData(data);
        setShowConfirmMorador(true);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
      setLoading(false);
    }
  };

  const handleConfirmMorador = async () => {
    setLoading(true);
    try {
      await loginMorador(numeroChacara);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
      setShowConfirmMorador(false);
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setShowConfirmMorador(false);
    setMoradorData(null);
    setNumeroChacara('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Droplets className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">AMCRS</h1>
          <p className="text-gray-600">Sistema de Pagamento de Água</p>
        </div>

        {/* Tela de Confirmação do Morador */}
        {showConfirmMorador && moradorData ? (
          <div className="space-y-6">
            <button
              onClick={handleBackToForm}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </button>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-2">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900">
                Confirme sua identidade
              </h2>
              
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Você está acessando a área de:</p>
                  <p className="text-2xl font-bold text-blue-900">{moradorData.nome}</p>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <p className="text-sm text-gray-600">Chácara nº</p>
                  <p className="text-xl font-semibold text-blue-700">{moradorData.numero_chacara}</p>
                </div>
                {moradorData.telefone && (
                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="text-lg font-medium text-gray-700">{moradorData.telefone}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 space-y-2">
                <p className="text-lg font-semibold text-gray-700">
                  ✅ É você mesmo?
                </p>
                <p className="text-sm text-gray-500">
                  Confirme para acessar seu painel
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={handleConfirmMorador}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
              >
                {loading ? 'Entrando...' : '✓ Sim, sou eu! Continuar'}
              </button>
              
              <button
                onClick={handleBackToForm}
                disabled={loading}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                ✗ Não sou eu
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Formulário de Login Normal */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsAdmin(false)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  !isAdmin
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                Morador
              </button>
              <button
                type="button"
                onClick={() => setIsAdmin(true)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  isAdmin
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                Administrador
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isAdmin ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Número da Chácara
                  </label>
                  <input
                    type="text"
                    value={numeroChacara}
                    onChange={(e) => setNumeroChacara(e.target.value)}
                    placeholder="Ex: 15"
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-2xl text-center font-semibold"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Digite apenas o número da sua chácara
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
              >
                {loading ? 'Entrando...' : isAdmin ? 'Entrar' : '🔐 Entrar na Minha Conta'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
