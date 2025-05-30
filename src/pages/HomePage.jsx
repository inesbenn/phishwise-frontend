import { useState, useEffect } from 'react';

import { 
  Shield, 
  Users, 
  Mail, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  BarChart3, 
  Settings, 
  Bell, 
  Search,
  ChevronRight,
  Target,
  BookOpen,
  Activity,
  Calendar,
  Eye,
  MousePointer,
  UserCheck,
  Clock,
  Menu,
  X,
  FileText,
  Edit3,
  GraduationCap
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeNotifications, setActiveNotifications] = useState(3);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [campaigns, setCampaigns] = useState([
    { id: 1, name: "Campagne Black Friday", status: "active", sent: 245, opened: 89, clicked: 12, completion: 65, progress: 75 },
    { id: 2, name: "Simulation IT Support", status: "active", sent: 156, opened: 67, clicked: 8, completion: 45, progress: 60 },
    { id: 3, name: "Test Phishing RH", status: "completed", sent: 89, opened: 78, clicked: 3, completion: 92, progress: 100 }
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { time: "Il y a 5 min", action: "12 employés ont terminé leur formation", type: "success" },
    { time: "Il y a 15 min", action: "Nouvelle campagne 'Black Friday' lancée", type: "info" },
    { time: "Il y a 1h", action: "Alerte: Taux de clic élevé (15%) détecté", type: "warning" },
    { time: "Il y a 2h", action: "245 emails envoyés avec succès", type: "success" }
  ]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50 w-full">
        <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                PhishWise
              </h1>
              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs sm:text-sm font-medium">
                Admin
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 w-40 lg:w-60 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
                />
              </div>
              <div className="relative">
                <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-gray-300 hover:text-white cursor-pointer" />
                {activeNotifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                    {activeNotifications}
                  </span>
                )}
              </div>
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                A
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-3">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer" />
                {activeNotifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {activeNotifications}
                  </span>
                )}
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-300 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-white/10">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 w-full bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  A
                </div>
                <span className="text-white text-sm">Admin</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Métriques Clés */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-300 text-xs sm:text-sm truncate">Campagnes Actives</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">8</p>
                <p className="text-green-400 text-xs sm:text-sm">+2 ce mois</p>
              </div>
              <div className="p-2 sm:p-3 bg-cyan-500/20 rounded-full flex-shrink-0">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-300 text-xs sm:text-sm truncate">Employés Sensibilisés</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">1,247</p>
                <p className="text-green-400 text-xs sm:text-sm">+156 ce mois</p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-500/20 rounded-full flex-shrink-0">
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-300 text-xs sm:text-sm truncate">Taux de Réussite</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">87%</p>
                <p className="text-green-400 text-xs sm:text-sm">+5% vs mois dernier</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-500/20 rounded-full flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-300 text-xs sm:text-sm truncate">Alertes Actives</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">3</p>
                <p className="text-red-400 text-xs sm:text-sm">Nécessitent attention</p>
              </div>
              <div className="p-2 sm:p-3 bg-red-500/20 rounded-full flex-shrink-0">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions Rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <button 
            onClick={() => window.location.href = '/campaign-wizard'}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 group"
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-white/20 rounded-full flex-shrink-0">
                <Plus className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              </div>
              <div className="text-left min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-semibold truncate">Nouvelle Campagne</h3>
                <p className="text-xs sm:text-sm opacity-90">Créer une simulation de phishing</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-auto mt-2 group-hover:translate-x-1 transition-transform" />
          </button>

          <button className="bg-white/10 backdrop-blur-lg border border-white/20 text-white p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 group">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-cyan-500/20 rounded-full flex-shrink-0">
                <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-cyan-400" />
              </div>
              <div className="text-left min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-semibold truncate">Analytics</h3>
                <p className="text-xs sm:text-sm text-gray-300">Rapports détaillés</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-auto mt-2 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => window.location.href = '/users'}
            className="bg-white/10 backdrop-blur-lg border border-white/20 text-white p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 group"
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-purple-500/20 rounded-full flex-shrink-0">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-400" />
              </div>
              <div className="text-left min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-semibold truncate">Utilisateurs</h3>
                <p className="text-xs sm:text-sm text-gray-300">Gérer les accès</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-auto mt-2 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => window.location.href = '/learning-pages'}
            className="bg-white/10 backdrop-blur-lg border border-white/20 text-white p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 group"
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-green-500/20 rounded-full flex-shrink-0">
                <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-400" />
              </div>
              <div className="text-left min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-semibold truncate">Pages d'Apprentissage</h3>
                <p className="text-xs sm:text-sm text-gray-300">Créer et modifier les formations</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-auto mt-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Campagnes en Cours */}
          <div className="xl:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Campagnes en Cours</h2>
                <button className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-2">
                  <span className="text-sm sm:text-base">Voir tout</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base sm:text-lg font-semibold text-white truncate pr-2">{campaign.name}</h3>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ${
                        campaign.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {campaign.status === 'active' ? 'Actif' : 'Terminé'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-3 text-xs sm:text-sm">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                        <span className="text-gray-300 truncate">{campaign.sent} envoyés</span>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 truncate">{campaign.opened} ouverts</span>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <MousePointer className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 flex-shrink-0" />
                        <span className="text-gray-300 truncate">{campaign.clicked} clics</span>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                        <span className="text-gray-300 truncate">{campaign.completion}% formés</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-white/10 rounded-full h-1.5 sm:h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-purple-400 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                        style={{ width: `${campaign.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activité Récente */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Activité Récente</h2>
              <div className="space-y-3 sm:space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.type === 'success' ? 'bg-green-400' :
                      activity.type === 'warning' ? 'bg-orange-400' : 'bg-blue-400'
                    }`}></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs sm:text-sm leading-relaxed">{activity.action}</p>
                      <p className="text-gray-400 text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Recommandations IA</h2>
              <div className="space-y-3">
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                  <p className="text-cyan-300 text-xs sm:text-sm leading-relaxed">
                    📊 Le département Finance montre un taux de clic élevé. Envisagez une formation ciblée.
                  </p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-purple-300 text-xs sm:text-sm leading-relaxed">
                    🎯 Moment optimal pour une campagne : Vendredi 14h-16h (taux d'ouverture +23%).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}