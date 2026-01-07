import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Users, Calendar, TrendingUp, Settings } from 'lucide-react';
import { MoradoresTab } from '../components/admin/MoradoresTab';
import { PeriodosTab } from '../components/admin/PeriodosTab';
import { PagamentosTab } from '../components/admin/PagamentosTab';
import { ConfiguracoesTab } from '../components/admin/ConfiguracoesTab';

type Tab = 'moradores' | 'periodos' | 'pagamentos' | 'configuracoes';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('moradores');
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">AMCRS</h1>
                <p className="text-xs text-blue-100">Painel Administrativo</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('moradores')}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'moradores'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Moradores</span>
              </button>
              <button
                onClick={() => setActiveTab('periodos')}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'periodos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Períodos e Consumo</span>
              </button>
              <button
                onClick={() => setActiveTab('pagamentos')}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'pagamentos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Pagamentos</span>
              </button>
              <button
                onClick={() => setActiveTab('configuracoes')}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'configuracoes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Configurações</span>
              </button>
            </nav>
          </div>
        </div>

        <div>
          {activeTab === 'moradores' && <MoradoresTab />}
          {activeTab === 'periodos' && <PeriodosTab />}
          {activeTab === 'pagamentos' && <PagamentosTab />}
          {activeTab === 'configuracoes' && <ConfiguracoesTab />}
        </div>
      </div>
    </div>
  );
}
