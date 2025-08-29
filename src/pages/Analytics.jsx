import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import {
  TrendingUp, Users, Award, Clock, Target, BookOpen, 
  CheckCircle, AlertCircle, Calendar, Filter,
  Search, Eye, ChevronDown, ArrowUp, ArrowDown, Minus,
  User, Mail, MapPin, Building, RefreshCw, Star,
  Activity, BarChart3, Circle,
  X, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';

// Configuration API - remplacez par votre URL backend
const API_BASE_URL = 'http://localhost:3000/api';

// Fonction utilitaire pour les requêtes API
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Fonctions API Analytics intégrées
const getAllAnalyticsData = async (filters = {}) => {
  try {
    console.log('📊 Récupération de toutes les données analytics...');
    
    // Exécuter toutes les requêtes en parallèle
    const [
      overviewData,
      campaignsData,
      userProgressData,
      progressOverTimeData
    ] = await Promise.all([
      apiCall('/analytics/overview'),
      apiCall('/analytics/campaigns'),
      apiCall(`/analytics/users/progress?${new URLSearchParams(filters)}`),
      apiCall(`/analytics/progress-over-time?timeframe=${filters.timeframe || '30d'}`)
    ]);

    console.log('✅ Toutes les données analytics récupérées');
    
    return {
      success: true,
      data: {
        overview: overviewData.data,
        campaigns: campaignsData.data,
        userProgress: userProgressData.data,
        progressOverTime: progressOverTimeData.data
      }
    };
  } catch (error) {
    console.error('❌ Erreur récupération données analytics complètes:', error);
    throw error;
  }
};

const getUserProgressAnalytics = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      queryParams.append(key, filters[key]);
    }
  });
  
  const response = await apiCall(`/analytics/users/progress?${queryParams}`);
  return response;
};

const getUserDetailedProgress = async (campaignId, targetEmail) => {
  const response = await apiCall(`/learning/campaigns/${campaignId}/${encodeURIComponent(targetEmail)}/formations`);
  return response;
};

// Couleurs pour les graphiques
const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#6366F1',
  purple: '#8B5CF6'
};

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Analytics() {
  // États pour les données
  const [data, setData] = useState({
    overview: null,
    campaigns: [],
    userProgress: { users: [], summary: {} },
    progressOverTime: []
  });
  
  // États de l'interface
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'averageScore', direction: 'desc' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Chargement initial des données
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeframe]);

  // Recharger les données utilisateurs quand les filtres changent
  useEffect(() => {
    if (viewMode === 'users') {
      loadUserProgressData();
    }
  }, [viewMode, selectedCampaign, searchTerm, sortConfig, pagination.currentPage]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Chargement des données analytics...');
      
      const filters = {
        timeframe: selectedTimeframe
      };

      // Charger toutes les données analytics
      const analyticsData = await getAllAnalyticsData(filters);
      
      if (analyticsData.success) {
        setData(analyticsData.data);
        console.log('Données analytics chargées avec succès:', analyticsData.data);
      } else {
        throw new Error('Erreur lors du chargement des données');
      }
      
    } catch (err) {
      console.error('Erreur chargement analytics:', err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProgressData = async () => {
    try {
      const filters = {
        campaignId: selectedCampaign,
        search: searchTerm,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      };

      const userProgressData = await getUserProgressAnalytics(filters);
      
      if (userProgressData.success) {
        setData(prev => ({
          ...prev,
          userProgress: userProgressData.data
        }));
        
        setPagination(userProgressData.data.pagination);
      }
      
    } catch (err) {
      console.error('Erreur chargement données utilisateurs:', err);
      setError(err.message);
    }
  };

  const loadUserDetails = async (user) => {
    try {
      setLoadingUser(true);
      
      const userDetails = await getUserDetailedProgress(user.campaignId, user.targetEmail);
      
      if (userDetails.success) {
        // Combiner les données utilisateur existantes avec les détails des formations
        const detailedUser = {
          ...user,
          // Détails supplémentaires de l'utilisateur
          user: userDetails.data.user,
          overallStats: userDetails.data.overallStats,
          // Formations avec détails complets
          formations: userDetails.data.formations.map(formation => ({
            formationId: formation._id,
            formationTitle: formation.title,
            description: formation.description,
            category: formation.category,
            estimatedTime: formation.estimatedTime,
            status: formation.progress?.status || 'not_started',
            overallProgress: formation.progress?.overallProgress || 0,
            completedAt: formation.progress?.completedAt,
            badgeEarned: formation.progress?.badgeEarned || false,
            badge: formation.badge,
            modules: formation.modules || [],
            timeSpent: 0 // Sera calculé depuis les modules si disponible
          }))
        };
        
        setSelectedUser(detailedUser);
      }
      
    } catch (err) {
      console.error('Erreur chargement détails utilisateur:', err);
      // Utiliser les données existantes en cas d'erreur
      setSelectedUser(user);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'not_started': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <Minus className="w-4 h-4 opacity-30" />;
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="w-4 h-4 text-cyan-400" /> : 
      <ArrowDown className="w-4 h-4 text-cyan-400" />;
  };

  const prepareStatusDistribution = () => {
    if (!data.overview) return [];
    
    const { totalUsers, activeUsers, completedUsers } = data.overview;
    const notStarted = totalUsers - activeUsers;
    const inProgress = activeUsers - completedUsers;

    return [
      { name: 'Terminé', value: completedUsers, color: COLORS.success },
      { name: 'En cours', value: inProgress, color: COLORS.warning },
      { name: 'Non commencé', value: notStarted, color: COLORS.error }
    ].filter(item => item.value > 0);
  };

  const prepareCampaignData = () => {
    return (data.campaigns || []).map(campaign => ({
      name: campaign.name.length > 20 ? campaign.name.substring(0, 20) + '...' : campaign.name,
      totalUsers: campaign.totalUsers,
      completed: campaign.completedUsers,
      completionRate: campaign.completionRate,
      averageScore: campaign.averageScore
    }));
  };

  const filteredUsers = (data.userProgress.users || []).filter(user => {
    if (selectedCampaign !== 'all' && user.campaignId !== selectedCampaign) return false;
    
    const searchMatch = searchTerm === '' || 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.targetEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.position && user.position.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return searchMatch;
  });

  // Affichage du loading initial
  if (isLoading && !data.overview) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Chargement des données analytics...</p>
        </div>
      </div>
    );
  }

  // Affichage d'erreur
  if (error && !data.overview) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-4">Erreur lors du chargement des données</p>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10 flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Analytics & Rapports
              </h1>
              <p className="text-gray-300 mt-1">Suivi des progrès et performances de formation</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Navigation des vues */}
              <div className="flex bg-gray-800/80 rounded-lg p-1">
                {[
                  { key: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
                  { key: 'campaigns', label: 'Campagnes', icon: Target },
                  { key: 'users', label: 'Utilisateurs', icon: Users }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setViewMode(key)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === key
                        ? 'bg-cyan-600 text-white shadow-lg'
                        : 'text-gray-200 hover:text-white hover:bg-gray-700/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* Sélecteur de période pour overview */}
              {viewMode === 'overview' && (
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="bg-gray-800/80 border border-gray-600 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="7d">7 derniers jours</option>
                  <option value="30d">30 derniers jours</option>
                  <option value="90d">90 derniers jours</option>
                  <option value="1y">1 an</option>
                </select>
              )}

              <button 
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-gray-800/80 hover:bg-gray-700/80 text-white px-4 py-2 rounded-lg transition-colors border border-gray-600 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualiser</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full px-6 py-6 overflow-y-auto">
          {/* Vue d'ensemble */}
          {viewMode === 'overview' && data.overview && (
            <>
              {/* Métriques principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  {
                    title: 'Utilisateurs Totaux',
                    value: data.overview.totalUsers?.toLocaleString() || '0',
                    change: `${data.overview.engagement?.engagementRate || 0}%`,
                    subtext: 'taux d\'engagement',
                    icon: Users,
                    color: 'text-blue-400'
                  },
                  {
                    title: 'Formations Terminées',
                    value: data.overview.completedFormations?.toLocaleString() || '0',
                    change: `${data.overview.engagement?.completionRate || 0}%`,
                    subtext: 'taux de completion',
                    icon: CheckCircle,
                    color: 'text-green-400'
                  },
                  {
                    title: 'Score Moyen',
                    value: `${data.overview.averageScore || 0}%`,
                    change: '+3%',
                    subtext: 'ce mois',
                    icon: Award,
                    color: 'text-purple-400'
                  },
                  {
                    title: 'Temps Total',
                    value: `${data.overview.totalTimeSpent || 0}h`,
                    change: `${data.overview.badgesEarned || 0}`,
                    subtext: 'badges gagnés',
                    icon: Clock,
                    color: 'text-orange-400'
                  }
                ].map((metric, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">{metric.title}</p>
                        <p className="text-white text-2xl font-bold mt-1">{metric.value}</p>
                        <p className="text-green-400 text-sm mt-1">{metric.change} {metric.subtext}</p>
                      </div>
                      <div className={`p-3 rounded-full bg-white/10 ${metric.color}`}>
                        <metric.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Graphiques */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Distribution des statuts */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                    <Circle className="w-5 h-5 mr-2" />
                    Distribution des Progrès
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prepareStatusDistribution()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {prepareStatusDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center space-x-4 mt-4">
                    {prepareStatusDistribution().map((entry, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-gray-300 text-sm">{entry.name} ({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Évolution dans le temps */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Évolution des Progrès
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.progressOverTime || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="rgba(255,255,255,0.5)"
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="completed" 
                        stackId="1" 
                        stroke={COLORS.success} 
                        fill={COLORS.success}
                        fillOpacity={0.8}
                        name="Terminées"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="started" 
                        stackId="1" 
                        stroke={COLORS.warning} 
                        fill={COLORS.warning}
                        fillOpacity={0.6}
                        name="Commencées"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* Vue Campagnes */}
          {viewMode === 'campaigns' && (
            <div className="space-y-8">
              {/* Performance par campagne */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h3 className="text-white text-lg font-semibold mb-6 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Performance par Campagne
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={prepareCampaignData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Bar dataKey="totalUsers" fill={COLORS.primary} name="Total Utilisateurs" />
                    <Bar dataKey="completed" fill={COLORS.success} name="Terminés" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Détail des campagnes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(data.campaigns || []).map((campaign) => (
                  <div key={campaign.id} className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white text-lg font-semibold">{campaign.name}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'running' ? 'bg-green-500/20 text-green-400' :
                        campaign.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {campaign.status === 'running' ? 'En cours' : 
                         campaign.status === 'completed' ? 'Terminée' : 'Terminer'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-gray-300 text-sm">Progression</p>
                        <p className="text-white text-xl font-semibold">{campaign.averageProgress || 0}%</p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">Score moyen</p>
                        <p className="text-white text-xl font-semibold">{campaign.averageScore || 0}%</p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">Taux completion</p>
                        <p className="text-white text-xl font-semibold">{campaign.completionRate || 0}%</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-300 mb-1">
                        <span>Utilisateurs terminés</span>
                        <span>{campaign.completedUsers || 0}/{campaign.totalUsers || 0}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${campaign.totalUsers > 0 ? (campaign.completedUsers / campaign.totalUsers) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-white text-sm font-medium flex items-center">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Formations:
                      </h5>
                      {campaign.formations && campaign.formations.length > 0 ? (
                        campaign.formations.map((formation, formIndex) => (
                          <div key={formIndex} className="flex justify-between items-center text-sm bg-white/5 rounded p-2">
                            <span className="text-gray-300">{formation.name}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-green-400">{formation.completion}%</span>
                              <span className="text-blue-400">({formation.avgScore}%)</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-sm">Aucune formation assignée</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vue Utilisateurs */}
          {viewMode === 'users' && (
            <div className="space-y-6">
              {/* Filtres et recherche */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Rechercher par nom, email, poste..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full bg-gray-800/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                    </div>
                  </div>
                  
                  <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="bg-gray-800/80 border border-gray-600 rounded-lg text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">Toutes les campagnes</option>
                    {(data.campaigns || []).map(campaign => (
                      <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Résumé des utilisateurs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total', value: data.userProgress.summary?.totalUsers || 0, color: 'text-blue-400' },
                  { label: 'Terminé', value: data.userProgress.summary?.completedUsers || 0, color: 'text-green-400' },
                  { label: 'En cours', value: data.userProgress.summary?.inProgressUsers || 0, color: 'text-yellow-400' },
                  { label: 'Non commencé', value: data.userProgress.summary?.notStartedUsers || 0, color: 'text-gray-400' }
                ].map((stat, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-4">
                    <p className={`${stat.color} text-2xl font-bold`}>{stat.value}</p>
                    <p className="text-gray-300 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Tableau des utilisateurs */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-white/20">
                  <h3 className="text-white text-lg font-semibold flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Détails des Utilisateurs ({filteredUsers.length})
                  </h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        {[
                          { key: 'firstName', label: 'Utilisateur' },
                          { key: 'position', label: 'Poste' },
                          { key: 'office', label: 'Bureau' },
                          { key: 'totalFormationsCompleted', label: 'Formations' },
                          { key: 'averageScore', label: 'Score Moyen' },
                          { key: 'totalTimeSpentMinutes', label: 'Temps' },
                          { key: 'totalBadgesEarned', label: 'Badges' },
                          { key: 'lastActivity', label: 'Dernière Activité' }
                        ].map(({ key, label }) => (
                          <th 
                            key={key}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => handleSort(key)}
                          >
                            <div className="flex items-center space-x-1">
                              <span>{label}</span>
                              {getSortIcon(key)}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredUsers.map((user, index) => (
                        <tr 
                          key={user.targetEmail} 
                          className="hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={() => loadUserDetails(user)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-300">{user.targetEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {user.position || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {user.office || user.country || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              <span className="text-white font-medium mr-2">
                                {user.totalFormationsCompleted || 0}/{user.totalFormationsStarted || 0}
                              </span>
                              <div className="w-16 bg-gray-700 rounded-full h-1.5">
                                <div 
                                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${user.completionRatePercentage || 0}%` 
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              <span className="text-white font-medium">{Math.round(user.averageScore || 0)}%</span>
                              <div className={`ml-2 w-2 h-2 rounded-full ${
                                (user.averageScore || 0) >= 80 ? 'bg-green-500' :
                                (user.averageScore || 0) >= 60 ? 'bg-yellow-500' : 
                                (user.averageScore || 0) > 0 ? 'bg-red-500' : 'bg-gray-500'
                              }`} />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatTime(user.totalTimeSpentMinutes || user.totalTimeSpent || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center text-yellow-400">
                              <Award className="w-4 h-4 mr-1" />
                              {user.totalBadgesEarned || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {user.lastActivity ? formatDate(user.lastActivity) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-300">
                      Aucun utilisateur trouvé
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      {isLoading ? 'Chargement en cours...' : 'Essayez de modifier vos critères de recherche.'}
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-white/20 flex items-center justify-between">
                    <div className="text-sm text-gray-300">
                      Affichage de {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} à {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} sur {pagination.totalItems} éléments
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                        disabled={pagination.currentPage === 1}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                              className={`px-3 py-1 text-sm rounded ${
                                pagination.currentPage === page
                                  ? 'bg-cyan-600 text-white'
                                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panel de détails utilisateur (affiché en bas) */}
      {selectedUser && (
        <div className="bg-black/40 backdrop-blur-lg border-t border-white/20 flex-shrink-0 max-h-96 overflow-y-auto">
          <div className="p-6">
            {loadingUser ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mr-3" />
                <span className="text-white">Chargement des détails utilisateur...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedUser.firstName?.charAt(0) || 'U'}{selectedUser.lastName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="text-white text-xl font-semibold">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h3>
                      <p className="text-gray-300">{selectedUser.position || 'Poste non spécifié'} • {selectedUser.office || selectedUser.country || 'Bureau non spécifié'}</p>
                      <p className="text-gray-400 text-sm">{selectedUser.targetEmail}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Statistiques détaillées de l'utilisateur */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-cyan-400 text-xl font-bold">{selectedUser.totalFormationsStarted || 0}</p>
                    <p className="text-gray-300 text-xs">Commencées</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-green-400 text-xl font-bold">{selectedUser.totalFormationsCompleted || 0}</p>
                    <p className="text-gray-300 text-xs">Terminées</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-purple-400 text-xl font-bold">{Math.round(selectedUser.averageScore || 0)}%</p>
                    <p className="text-gray-300 text-xs">Score Moyen</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-orange-400 text-xl font-bold">{formatTime(selectedUser.totalTimeSpentMinutes || selectedUser.totalTimeSpent || 0)}</p>
                    <p className="text-gray-300 text-xs">Temps Total</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-yellow-400 text-xl font-bold">{selectedUser.totalBadgesEarned || 0}</p>
                    <p className="text-gray-300 text-xs">Badges</p>
                  </div>
                </div>

                {/* Informations personnelles additionnelles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-300 text-xs mb-1">Pays</p>
                    <p className="text-white font-medium">{selectedUser.country || 'Non spécifié'}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-300 text-xs mb-1">Bureau</p>
                    <p className="text-white font-medium">{selectedUser.office || 'Non spécifié'}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-300 text-xs mb-1">Dernière Activité</p>
                    <p className="text-white font-medium">{selectedUser.lastActivity ? formatDate(selectedUser.lastActivity) : 'Aucune activité'}</p>
                  </div>
                </div>

                {/* Formations de l'utilisateur avec détails complets */}
                <div>
                  <h4 className="text-white font-semibold mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Formations Détaillées ({(selectedUser.formations || []).length})
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selectedUser.formations || []).map((formation, index) => (
                      <div key={formation.formationId || index} className="bg-white/5 rounded-lg p-5 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-white font-medium text-sm">{formation.formationTitle || formation.title || 'Formation sans nom'}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(formation.status)}`}>
                            {formation.status === 'completed' ? 'Terminé' :
                             formation.status === 'in_progress' ? 'En cours' : 'Non commencé'}
                          </span>
                        </div>
                        
                        {/* Description de la formation */}
                        {formation.description && (
                          <p className="text-gray-300 text-xs mb-3 line-clamp-2">{formation.description}</p>
                        )}

                        {/* Catégorie et temps estimé */}
                        <div className="flex justify-between text-xs text-gray-400 mb-3">
                          {formation.category && (
                            <span className="bg-white/10 px-2 py-1 rounded">{formation.category}</span>
                          )}
                          {formation.estimatedTime && (
                            <span>{formatTime(formation.estimatedTime)}</span>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-300">Progression:</span>
                            <span className="text-white font-medium">{Math.round(formation.overallProgress || 0)}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${formation.overallProgress || 0}%` }}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-300">Score: </span>
                              <span className="text-white font-medium">
                                {formation.bestScore ? `${Math.round(formation.bestScore)}%` : 
                                 formation.averageScore ? `${Math.round(formation.averageScore)}%` : '-'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-300">Temps passé: </span>
                              <span className="text-white font-medium">
                                {formatTime(formation.timeSpent || 0)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Nombre de modules */}
                          {formation.modules && formation.modules.length > 0 && (
                            <div className="text-xs">
                              <span className="text-gray-300">Modules: </span>
                              <span className="text-white font-medium">{formation.modules.length}</span>
                            </div>
                          )}
                          
                          {formation.completedAt && (
                            <div className="text-xs text-gray-400 mt-2">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              Terminé le {formatDate(formation.completedAt)}
                            </div>
                          )}
                          
                          {formation.badgeEarned && formation.badge && (
                            <div className="flex items-center mt-2 bg-yellow-500/10 rounded p-2">
                              <Star className="w-4 h-4 text-yellow-400 mr-2" />
                              <div>
                                <span className="text-yellow-400 text-xs font-medium">Badge obtenu</span>
                                <p className="text-yellow-300 text-xs">{formation.badge.name || 'Badge de formation'}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {(selectedUser.formations || []).length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-gray-400 mt-2">Aucune formation assignée pour cet utilisateur</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}