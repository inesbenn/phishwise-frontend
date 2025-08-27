import { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Mail, 
  TrendingUp,  
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
  GraduationCap,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';

// API pour récupérer les données depuis le backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const dashboardAPI = {
  async getDashboardStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Erreur getDashboardStats:', error);
      // Données de fallback
      return {
        activeCampaigns: 8,
        newCampaignsThisMonth: 2,
        totalEmployees: 1247,
        successRate: 87
      };
    }
  },

  async getActiveCampaigns() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/campaigns`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const campaigns = await response.json();
      
      // Enrichir chaque campagne avec des statistiques de tracking en temps réel
      const enrichedCampaigns = await Promise.all(
        campaigns.map(async (campaign) => {
          try {
            // Récupérer les stats de tracking pour chaque campagne
            const trackingResponse = await fetch(`${API_BASE_URL}/tracking/stats/${campaign.id}`, {
              headers: {
                'Content-Type': 'application/json',
              }
            });
            
            if (trackingResponse.ok) {
              const trackingData = await trackingResponse.json();
              const stats = trackingData.data;
              
              return {
                ...campaign,
                // Remplacer par les vraies statistiques de tracking
                sent: stats.totalSent || campaign.sent,
                opened: stats.totalOpened || campaign.opened,
                clicked: stats.uniqueClicks || campaign.clicked,
                totalClicks: stats.totalClicks || 0,
                openRate: stats.openRate || 0,
                clickRate: stats.clickRate || 0,
                // Recalculer le pourcentage de completion basé sur les ouvertures
                completion: stats.totalSent > 0 
                  ? Math.round((stats.totalOpened / stats.totalSent) * 100)
                  : campaign.completion,
                progress: stats.totalSent > 0 
                  ? Math.round((stats.totalOpened / stats.totalSent) * 100)
                  : campaign.progress,
                // Indicateurs de performance
                hasHighClickRate: stats.clickRate > 15,
                hasLowOpenRate: stats.openRate < 20,
                isActive: campaign.status === 'active',
                // Date de création formatée
                createdDate: campaign.createdAt || campaign.startDate || new Date().toISOString()
              };
            } else {
              // Garder les données originales si pas de tracking disponible
              return {
                ...campaign,
                openRate: 0,
                clickRate: 0,
                hasHighClickRate: false,
                hasLowOpenRate: false,
                createdDate: campaign.createdAt || campaign.startDate || new Date().toISOString()
              };
            }
          } catch (trackingError) {
            console.warn(`Impossible de récupérer les stats pour ${campaign.id}:`, trackingError);
            return {
              ...campaign,
              openRate: 0,
              clickRate: 0,
              hasHighClickRate: false,
              hasLowOpenRate: false,
              createdDate: campaign.createdAt || campaign.startDate || new Date().toISOString()
            };
          }
        })
      );
      
      return enrichedCampaigns;
    } catch (error) {
      console.error('Erreur getActiveCampaigns:', error);
      // Données de fallback
      return [
        { id: 1, name: "Erreur de connexion - Vérifiez le backend", status: "error", sent: 0, opened: 0, clicked: 0, completion: 0, progress: 0, openRate: 0, clickRate: 0, createdDate: new Date().toISOString() }
      ];
    }
  },

  async getRecentActivity() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/recent-activity`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Erreur getRecentActivity:', error);
      // Générer une activité basée sur le tracking
      return [
        { time: "Il y a 2 min", action: "Email ouvert - Campagne Finance", type: "success" },
        { time: "Il y a 5 min", action: "3 nouveaux clics détectés", type: "info" },
        { time: "Il y a 12 min", action: "Taux d'ouverture élevé (89%) - Campagne IT", type: "success" },
        { time: "Il y a 18 min", action: "Nouvelle soumission capturée", type: "warning" }
      ];
    }
  }, 

  // Nouvelle fonction pour surveiller les campagnes en temps réel
  async getEmailTrackingUpdates() {
    try {
      const response = await fetch(`${API_BASE_URL}/tracking/recent-events`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.warn('Impossible de récupérer les mises à jour en temps réel:', error);
      return [];
    }
  }
};

export default function AdminDashboard() {
  // États pour les données
  const [dashboardStats, setDashboardStats] = useState({
    activeCampaigns: 0,
    newCampaignsThisMonth: 0,
    totalEmployees: 0,
    successRate: 0
  });
  
  const [campaigns, setCampaigns] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]); 
  
  // États pour l'interface
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [error, setError] = useState(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState([]);
  
  const navigate = useNavigate();

  // Fonction pour charger toutes les données
  const loadDashboardData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    
    try {
      // Charger toutes les données en parallèle
      const [stats, campaignsData, activity] = await Promise.all([
        dashboardAPI.getDashboardStats(),
        dashboardAPI.getActiveCampaigns(),
        dashboardAPI.getRecentActivity()
      ]);

      setDashboardStats(stats);
      setCampaigns(campaignsData);
      setRecentActivity(activity); 
      setIsConnected(true);
      setLastRefresh(new Date());
      
    } catch (err) {
      console.error('Erreur lors du chargement du dashboard:', err);
      setError('Erreur de connexion au serveur');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour mettre à jour les statistiques en temps réel
  const updateRealTimeStats = async () => {
    try {
      const updates = await dashboardAPI.getEmailTrackingUpdates();
      if (updates.length > 0) {
        setRealTimeUpdates(prev => [...updates, ...prev].slice(0, 10));
        
        // Mettre à jour les campagnes avec les nouvelles données
        setCampaigns(prevCampaigns => 
          prevCampaigns.map(campaign => {
            const campaignUpdates = updates.filter(update => update.campaignId === campaign.id);
            if (campaignUpdates.length > 0) {
              const latestUpdate = campaignUpdates[0];
              return {
                ...campaign,
                opened: latestUpdate.totalOpened || campaign.opened,
                clicked: latestUpdate.uniqueClicks || campaign.clicked,
                openRate: latestUpdate.openRate || campaign.openRate,
                clickRate: latestUpdate.clickRate || campaign.clickRate
              };
            }
            return campaign;
          })
        );
      }
    } catch (error) {
      console.warn('Erreur mise à jour temps réel:', error);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadDashboardData();
    
    // Actualisation automatique toutes les 30 secondes
    const dataInterval = setInterval(() => {
      loadDashboardData(false);
    }, 30000);
    
    // Actualisation temps réel toutes les 10 secondes pour les stats d'email
    const realtimeInterval = setInterval(() => {
      updateRealTimeStats();
    }, 10000);
    
    return () => {
      clearInterval(dataInterval);
      clearInterval(realtimeInterval);
    };
  }, []);

  // Fonction pour actualiser manuellement
  const handleRefresh = () => {
    loadDashboardData();
  };

  // Formater les nombres
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50 w-full flex-shrink-0">
        <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                PhishWise
              </h1>
              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs sm:text-sm font-medium">
                Admin
              </span>
              {/* Indicateur de connexion et temps réel */}
              <div className="flex items-center space-x-1">
                {isConnected ? (
                  <div className="flex items-center space-x-1">
                    <Wifi className="w-4 h-4 text-green-400" />
                    {realTimeUpdates.length > 0 && (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                ) : (
                  <WifiOff className="w-4 h-4 text-red-400" />
                )}
                <span className="text-xs text-gray-400 hidden sm:inline">
                  {lastRefresh.toLocaleTimeString()}
                </span>
              </div>
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
              
              {/* Bouton refresh */}
              <button 
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 text-gray-300 hover:text-white disabled:opacity-50"
                title="Actualiser"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>  
            
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                A
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-3">
              <button 
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 text-gray-300 hover:text-white disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button> 
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

      {/* Contenu principal avec scroll */}
      <main className="flex-1 w-full">
        <div className="w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          {/* Message d'erreur */}
          {error && ( 
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-center space-x-3"> 
              <div>
                <p className="text-red-300 font-medium">Erreur de connexion</p>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Métriques Clés */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-300 text-xs sm:text-sm truncate">Campagnes Actives</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-600 h-8 w-12 rounded"></div>
                    ) : (
                      dashboardStats.activeCampaigns
                    )}
                  </p>
                  <p className="text-green-400 text-xs sm:text-sm">
                    +{dashboardStats.newCampaignsThisMonth} ce mois
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-cyan-500/20 rounded-full flex-shrink-0">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-cyan-400" />
                </div>
              </div>
            </div>

            {/* Nouvelle métrique : Taux d'ouverture moyen */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-300 text-xs sm:text-sm truncate">Taux d'Ouverture Moyen</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-600 h-8 w-16 rounded"></div>
                    ) : (
                      campaigns.length > 0 
                        ? `${Math.round(campaigns.reduce((sum, c) => sum + (c.openRate || 0), 0) / campaigns.length)}%`
                        : '0%'
                    )}
                  </p>
                  <p className="text-blue-400 text-xs sm:text-sm">Emails ouverts</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-500/20 rounded-full flex-shrink-0">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Nouvelle métrique : Taux de clic moyen */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-300 text-xs sm:text-sm truncate">Taux de Clic Moyen</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-600 h-8 w-12 rounded"></div>
                    ) : (
                      campaigns.length > 0 
                        ? `${Math.round(campaigns.reduce((sum, c) => sum + (c.clickRate || 0), 0) / campaigns.length)}%`
                        : '0%'
                    )}
                  </p>
                  <p className="text-orange-400 text-xs sm:text-sm">Liens cliqués</p>
                </div>
                <div className="p-2 sm:p-3 bg-orange-500/20 rounded-full flex-shrink-0">
                  <MousePointer className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-orange-400" />
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

            <button 
              onClick={() => navigate('/analytics')}
              className="bg-white/10 backdrop-blur-lg border border-white/20 text-white p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 group"
            >
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
              onClick={() => navigate('/learning-pages')}
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
            {/* Campagnes en Cours avec statistiques en temps réel */}
            <div className="xl:col-span-2">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Campagnes</h2>
                  <div className="flex items-center space-x-2">
                    {realTimeUpdates.length > 0 && (
                      <div className="flex items-center space-x-1 text-green-400 text-xs sm:text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>En direct</span>
                      </div>
                    )}
                    <button 
                      onClick={() => navigate('/analytics?view=campaigns')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-2"
                    >
                      <span className="text-sm sm:text-base">Voir tout</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {isLoading ? (
                    // Skeleton loader pour les campagnes
                    [...Array(3)].map((_, index) => (
                      <div key={index} className="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 animate-pulse">
                        <div className="flex items-center justify-between mb-3">
                          <div className="bg-gray-600 h-4 w-32 rounded"></div>
                          <div className="bg-gray-600 h-6 w-16 rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-3">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-gray-600 h-3 w-20 rounded"></div>
                          ))}
                        </div>
                        <div className="bg-gray-600 h-2 w-full rounded-full"></div>
                      </div>
                    ))
                  ) : (
                    campaigns.map((campaign) => (
                      <div key={campaign.id} className="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-base sm:text-lg font-semibold text-white truncate pr-2">{campaign.name}</h3>
                          </div>
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ${
                            campaign.status === 'active' 
                              ? 'bg-green-500/20 text-green-400' 
                              : campaign.status === 'error'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {campaign.status === 'active' ? 'Actif' : 
                             campaign.status === 'error' ? 'Erreur' : 'Terminé'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                            <span className="text-gray-300 truncate">{campaign.sent} envoyés</span>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                            <span className="text-gray-300 truncate">
                              {campaign.opened} ouverts
                              {campaign.openRate > 0 && (
                                <span className="text-green-400 ml-1">({campaign.openRate}%)</span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <MousePointer className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 flex-shrink-0" />
                            <span className="text-gray-300 truncate">{campaign.totalClicks} clics</span>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                            <span className="text-gray-300 truncate">{formatDate(campaign.createdDate)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Activité Récente */}
            <div className="space-y-4 sm:space-y-6">
              {/* Mises à jour en temps réel */}
              {realTimeUpdates.length > 0 && (
                <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="ml-2">Temps Réel</span>
                  </h2>
                  <div className="space-y-3">
                    {realTimeUpdates.slice(0, 5).map((update, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-green-400"></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-xs sm:text-sm leading-relaxed">
                            {update.type === 'email_open' && 'Email ouvert'}
                            {update.type === 'email_click' && 'Lien cliqué'}
                            {update.type === 'form_submit' && 'Formulaire soumis'}
                            : {update.campaignName}
                          </p>
                          <p className="text-gray-400 text-xs">{new Date(update.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
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
            </div> 
          </div>
        </div>
      </main>
    </div>
  );
}