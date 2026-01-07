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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-base sm:text-lg">A</span>
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold">AMCRS</h1>
                <p className="text-[10px] sm:text-xs text-blue-100">Painel Admin</p>
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

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-8">
        <div className="bg-white rounded-xl shadow-sm mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab('moradores')}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-6 py-3 sm:py-4 border-b-2 font-medium transition-colors text-xs sm:text-base whitespace-nowrap ${
                  activeTab === 'moradores'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Moradores</span>
              </button>
              <button
                onClick={() => setActiveTab('periodos')}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-6 py-3 sm:py-4 border-b-2 font-medium transition-colors text-xs sm:text-base whitespace-nowrap ${
                  activeTab === 'periodos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Períodos</span>
              </button>
              <button
                onClick={() => setActiveTab('pagamentos')}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-6 py-3 sm:py-4 border-b-2 font-medium transition-colors text-xs sm:text-base whitespace-nowrap ${
                  activeTab === 'pagamentos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Pagamentos</span>
              </button>
              <button
                onClick={() => setActiveTab('configuracoes')}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-6 py-3 sm:py-4 border-b-2 font-medium transition-colors text-xs sm:text-base whitespace-nowrap ${
                  activeTab === 'configuracoes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Config</span>
              </button>
            </nav>
          </div>
        </div>

        <div className="mt-2 sm:mt-0">
          {activeTab === 'moradores' && <MoradoresTab />}
          {activeTab === 'periodos' && <PeriodosTab />}
          {activeTab === 'pagamentos' && <PagamentosTab />}
          {activeTab === 'configuracoes' && <ConfiguracoesTab />}
        </div>
      </div>
    </div>
  );
}
