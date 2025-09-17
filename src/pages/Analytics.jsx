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
  X, ChevronLeft, ChevronRight, Loader2,
  Shield, AlertTriangle, Ban, FileText, Download,
  Globe, Zap, Bug, Lock, ExternalLink, Clock3,
  CheckCircle2, XCircle, AlertOctagon, Info
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

// Nouvelles fonctions API pour les incidents
const getIncidentsOverview = async () => {
  try {
    const [statistics, dashboard, realtime] = await Promise.all([
      apiCall('/incidents/statistics'),
      apiCall('/incidents/dashboard'),
      apiCall('/incidents/metrics/realtime')
    ]);

    return {
      success: true,
      data: {
        statistics: statistics.data,
        dashboard: dashboard.data,
        realtime: realtime.data
      }
    };
  } catch (error) {
    console.error('❌ Erreur récupération overview incidents:', error);
    throw error;
  }
};

const getIncidents = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });
    
    const response = await apiCall(`/incidents?${queryParams}`);
    return response;
  } catch (error) {
    console.error('❌ Erreur récupération incidents:', error);
    throw error;
  }
};

const getIncidentById = async (id) => {
  try {
    const response = await apiCall(`/incidents/${id}`);
    return response;
  } catch (error) {
    console.error(`❌ Erreur récupération incident ${id}:`, error);
    throw error;
  }
};

const markAsFalsePositive = async (id, adminNote = '') => {
  try {
    const response = await apiCall(`/incidents/${id}/false-positive`, {
      method: 'PATCH',
      body: JSON.stringify({ adminNote })
    });
    return response;
  } catch (error) {
    console.error(`❌ Erreur marquage faux positif ${id}:`, error);
    throw error;
  }
};

const markAsResolved = async (id) => {
  try {
    const response = await apiCall(`/incidents/${id}/resolve`, {
      method: 'PATCH'
    });
    return response;
  } catch (error) {
    console.error(`❌ Erreur marquage résolu ${id}:`, error);
    throw error;
  }
};

const exportIncidents = async (format = 'json', startDate, endDate) => {
  try {
    const params = new URLSearchParams({ format });
    
    const defaultEndDate = new Date().toISOString();
    const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    if (startDate) {
      params.append('startDate', startDate);
    } else {
      params.append('startDate', defaultStartDate);
    }
    
    if (endDate) {
      params.append('endDate', endDate);
    } else {
      params.append('endDate', defaultEndDate);
    }
    
    console.log('📥 Export des incidents:', { format, startDate: startDate || defaultStartDate, endDate: endDate || defaultEndDate });
    
    const response = await fetch(`${API_BASE_URL}/incidents/export?${params}`);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erreur export:', response.status, errorData);
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    if (format === 'csv') {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `incidents_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true, message: 'Export CSV terminé' };
    } else {
      const data = await response.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `incidents_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Export JSON terminé', data };
    }
  } catch (error) {
    console.error('❌ Erreur export incidents:', error);
    throw error;
  }
};

// Couleurs pour les graphiques
const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#6366F1',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  orange: '#F97316'
};

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Analytics() {
  // États pour les données
  const [data, setData] = useState({
    overview: null,
    campaigns: [],
    userProgress: { users: [], summary: {} },
    progressOverTime: [],
    incidents: {
      overview: null,
      list: [],
      pagination: { currentPage: 1, totalPages: 1, totalIncidents: 0 }
    }
  });
  
  // États de l'interface
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'totalFormationsCompleted', direction: 'desc' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingIncident, setLoadingIncident] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // États spécifiques aux incidents
  const [incidentFilters, setIncidentFilters] = useState({
    riskLevel: '',
    incidentType: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Chargement initial des données
  useEffect(() => {
    if (viewMode === 'incidents') {
      loadIncidentsData();
    } else {
      loadAnalyticsData();
    }
  }, [selectedTimeframe, viewMode]);

  // Recharger les données utilisateurs quand les filtres changent
  useEffect(() => {
    if (viewMode === 'users') {
      loadUserProgressData();
    }
  }, [viewMode, selectedCampaign, searchTerm, sortConfig, pagination.currentPage]);

  // Recharger les incidents quand les filtres changent
  useEffect(() => {
    if (viewMode === 'incidents') {
      loadIncidentsList();
    }
  }, [incidentFilters, pagination.currentPage]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filters = { timeframe: selectedTimeframe };
      const analyticsData = await getAllAnalyticsData(filters);
      
      if (analyticsData.success) {
        setData(prev => ({
          ...prev,
          overview: analyticsData.data.overview,
          campaigns: analyticsData.data.campaigns,
          userProgress: analyticsData.data.userProgress,
          progressOverTime: analyticsData.data.progressOverTime
        }));
      }
    } catch (err) {
      console.error('Erreur chargement analytics:', err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const loadIncidentsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [overviewData, incidentsData] = await Promise.all([
        getIncidentsOverview(),
        getIncidents({
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          ...incidentFilters
        })
      ]);

      if (overviewData.success && incidentsData.success) {
        setData(prev => ({
          ...prev,
          incidents: {
            overview: overviewData.data,
            list: incidentsData.data.incidents,
            pagination: incidentsData.data.pagination
          }
        }));
        setPagination(incidentsData.data.pagination);
      }
    } catch (err) {
      console.error('Erreur chargement incidents:', err);
      setError(err.message || 'Erreur lors du chargement des incidents');
    } finally {
      setIsLoading(false);
    }
  };

  const loadIncidentsList = async () => {
    try {
      const incidentsData = await getIncidents({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...incidentFilters
      });

      if (incidentsData.success) {
        setData(prev => ({
          ...prev,
          incidents: {
            ...prev.incidents,
            list: incidentsData.data.incidents,
            pagination: incidentsData.data.pagination
          }
        }));
        setPagination(incidentsData.data.pagination);
      }
    } catch (err) {
      console.error('Erreur chargement liste incidents:', err);
      setError(err.message);
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

      const userProgressData = await apiCall(`/analytics/users/progress?${new URLSearchParams(filters)}`);
      
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

  const loadIncidentDetails = async (incident) => {
    try {
      setLoadingIncident(true);
      const incidentDetails = await getIncidentById(incident._id);
      
      if (incidentDetails.success) {
        setSelectedIncident(incidentDetails.data);
      }
    } catch (err) {
      console.error('Erreur chargement détails incident:', err);
      setSelectedIncident(incident);
    } finally {
      setLoadingIncident(false);
    }
  };

  const handleMarkAsFalsePositive = async (incidentId, note = '') => {
    try {
      const result = await markAsFalsePositive(incidentId, note);
      if (result.success) {
        loadIncidentsList();
        if (selectedIncident && selectedIncident._id === incidentId) {
          setSelectedIncident(null);
        }
      }
    } catch (err) {
      console.error('Erreur marquage faux positif:', err);
    }
  };

  const handleMarkAsResolved = async (incidentId) => {
    try {
      const result = await markAsResolved(incidentId);
      if (result.success) {
        loadIncidentsList();
        if (selectedIncident && selectedIncident._id === incidentId) {
          setSelectedIncident(null);
        }
      }
    } catch (err) {
      console.error('Erreur marquage résolu:', err);
    }
  };

  const handleExport = async (format) => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      await exportIncidents(format, startDate, endDate);
      
      console.log(`✅ Export ${format.toUpperCase()} réussi`);
      
    } catch (err) {
      console.error('Erreur export:', err);
      setError(err.message || 'Erreur lors de l\'export');
    }
  };

  const handleRefresh = () => {
    if (viewMode === 'incidents') {
      loadIncidentsData();
    } else {
      loadAnalyticsData();
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleIncidentSort = (key) => {
    setIncidentFilters(prev => ({
      ...prev,
      sortBy: key,
      sortOrder: prev.sortBy === key && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Fonctions utilitaires
  const formatTime = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('fr-FR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'not_started': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getIncidentTypeIcon = (type) => {
    switch (type) {
      case 'phishing': return <AlertTriangle className="w-4 h-4" />;
      case 'malware': return <Bug className="w-4 h-4" />;
      case 'scam': return <AlertOctagon className="w-4 h-4" />;
      case 'suspicious_domain': return <Globe className="w-4 h-4" />;
      case 'ip_address_access': return <Lock className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getSortIcon = (key, currentSortConfig = sortConfig) => {
    if (currentSortConfig.key !== key) return <Minus className="w-4 h-4 opacity-30" />;
    return currentSortConfig.direction === 'asc' ? 
      <ArrowUp className="w-4 h-4 text-cyan-400" /> : 
      <ArrowDown className="w-4 h-4 text-cyan-400" />;
  };

  const getIncidentSortIcon = (key) => {
    if (incidentFilters.sortBy !== key) return <Minus className="w-4 h-4 opacity-30" />;
    return incidentFilters.sortOrder === 'asc' ? 
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

  const prepareRiskDistribution = () => {
    if (!data.incidents.overview?.statistics?.riskLevelStats) return [];
    
    return data.incidents.overview.statistics.riskLevelStats.map(stat => ({
      name: stat._id === 'high' ? 'Élevé' : stat._id === 'medium' ? 'Moyen' : 'Faible',
      value: stat.count,
      color: stat._id === 'high' ? COLORS.error : stat._id === 'medium' ? COLORS.warning : COLORS.success
    }));
  };

  const prepareCampaignData = () => {
    return (data.campaigns || []).map(campaign => ({
      name: campaign.name.length > 20 ? campaign.name.substring(0, 20) + '...' : campaign.name,
      totalUsers: campaign.totalUsers,
      completed: campaign.completedUsers,
      completionRate: campaign.completionRate
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
  if (isLoading && !data.overview && viewMode !== 'incidents') {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Chargement des données analytics...</p>
        </div>
      </div>
    );
  }

  if (isLoading && !data.incidents.overview && viewMode === 'incidents') {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Chargement des données incidents...</p>
        </div>
      </div>
    );
  }

  // Affichage d'erreur
  if (error && !data.overview && !data.incidents.overview) {
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
                Analytics & Incidents
              </h1>
              <p className="text-gray-300 mt-1">Suivi des progrès et surveillance des menaces</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Navigation des vues */}
              <div className="flex bg-gray-800/80 rounded-lg p-1">
                {[
                  { key: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
                  { key: 'campaigns', label: 'Campagnes', icon: Target },
                  { key: 'users', label: 'Utilisateurs', icon: Users },
                  { key: 'incidents', label: 'Incidents', icon: Shield }
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
              {(viewMode === 'overview' || viewMode === 'incidents') && (
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
                    title: 'Badges Gagnés',
                    value: `${data.overview.badgesEarned || 0}`,
                    change: '+12%',
                    subtext: 'ce mois',
                    icon: Award,
                    color: 'text-purple-400'
                  },
                  {
                    title: 'Temps Total',
                    value: `${data.overview.totalTimeSpent || 0}h`,
                    change: `${data.overview.activeUsers || 0}`,
                    subtext: 'utilisateurs actifs',
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
                         campaign.status === 'completed' ? 'Terminée' : 'Terminé'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-300 text-sm">Progression</p>
                        <p className="text-white text-xl font-semibold">{campaign.averageProgress || 0}%</p>
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
                          onClick={() => setSelectedUser(user)}
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

          {/* Vue Incidents */}
          {viewMode === 'incidents' && (
            <div className="space-y-6">
              {/* Métriques des incidents */}
              {data.incidents.overview && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[
                    {
                      title: 'Total Incidents',
                      value: data.incidents.overview.statistics?.totalIncidents?.toLocaleString() || '0',
                      change: `+${data.incidents.overview.realtime?.incidentsLast5min || 0}`,
                      subtext: 'dernière heure',
                      icon: Shield,
                      color: 'text-blue-400'
                    },
                    {
                      title: 'Incidents Critiques',
                      value: `${data.incidents.overview.realtime?.criticalIncidents || 0}`,
                      change: data.incidents.overview.realtime?.status === 'critical' ? 'CRITIQUE' : 
                             data.incidents.overview.realtime?.status === 'warning' ? 'ALERTE' : 'NORMAL',
                      subtext: 'statut système',
                      icon: AlertTriangle,
                      color: data.incidents.overview.realtime?.status === 'critical' ? 'text-red-400' : 
                             data.incidents.overview.realtime?.status === 'warning' ? 'text-yellow-400' : 'text-green-400'
                    },
                    {
                      title: 'Menaces Bloquées',
                      value: `${data.incidents.overview.statistics?.summary?.blockedIncidents || 0}`,
                      change: `${Math.round((data.incidents.overview.statistics?.summary?.blockedIncidents / data.incidents.overview.statistics?.totalIncidents) * 100 || 0)}%`,
                      subtext: 'taux de protection',
                      icon: Ban,
                      color: 'text-red-400'
                    },
                    {
                      title: 'Aujourd\'hui',
                      value: `${data.incidents.overview.dashboard?.metrics?.incidentsToday || 0}`,
                      change: `${data.incidents.overview.dashboard?.metrics?.averagePerDay || 0}`,
                      subtext: 'moyenne/jour',
                      icon: Clock3,
                      color: 'text-orange-400'
                    }
                  ].map((metric, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-300 text-sm">{metric.title}</p>
                          <p className="text-white text-2xl font-bold mt-1">{metric.value}</p>
                          <p className={`${metric.color} text-sm mt-1`}>{metric.change} {metric.subtext}</p>
                        </div>
                        <div className={`p-3 rounded-full bg-white/10 ${metric.color}`}>
                          <metric.icon className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Graphiques des incidents */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Distribution des niveaux de risque */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                    <Circle className="w-5 h-5 mr-2" />
                    Répartition par Niveau de Risque
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prepareRiskDistribution()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {prepareRiskDistribution().map((entry, index) => (
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
                    {prepareRiskDistribution().map((entry, index) => (
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

                {/* Top menaces */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Top 5 Menaces Détectées
                  </h3>
                  <div className="space-y-3">
                    {(data.incidents.overview?.realtime?.activeThreats || []).slice(0, 5).map((threat, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getIncidentTypeIcon(threat._id)}
                          <div>
                            <p className="text-white font-medium capitalize">{threat._id}</p>
                            <p className="text-gray-400 text-sm">Sévérité: {threat.severity}</p>
                          </div>
                        </div>
                        <span className="text-cyan-400 font-bold">{threat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filtres et actions */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-wrap gap-4">
                    <select
                      value={incidentFilters.riskLevel}
                      onChange={(e) => setIncidentFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
                      className="bg-gray-800/80 border border-gray-600 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">Tous les niveaux</option>
                      <option value="high">Élevé</option>
                      <option value="medium">Moyen</option>
                      <option value="low">Faible</option>
                    </select>

                    <select
                      value={incidentFilters.incidentType}
                      onChange={(e) => setIncidentFilters(prev => ({ ...prev, incidentType: e.target.value }))}
                      className="bg-gray-800/80 border border-gray-600 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">Tous les types</option>
                      <option value="phishing">Phishing</option>
                      <option value="malware">Malware</option>
                      <option value="scam">Scam</option>
                      <option value="suspicious_domain">Domaine Suspect</option>
                      <option value="ip_address_access">Accès IP</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport('json')}
                      className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export JSON</span>
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tableau des incidents - SANS COLONNE STATUT */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-white/20">
                  <h3 className="text-white text-lg font-semibold flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Liste des Incidents ({data.incidents.pagination?.totalIncidents || 0})
                  </h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        {[
                          { key: 'url', label: 'URL / Domaine' },
                          { key: 'incidentType', label: 'Type' },
                          { key: 'riskLevel', label: 'Niveau' },
                          { key: 'riskScore', label: 'Score' },
                          { key: 'createdAt', label: 'Détecté le' },
                          { key: 'actions', label: 'Actions' }
                        ].map(({ key, label }) => (
                          <th 
                            key={key}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => key !== 'actions' && handleIncidentSort(key)}
                          >
                            <div className="flex items-center space-x-1">
                              <span>{label}</span>
                              {key !== 'actions' && getIncidentSortIcon(key)}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {(data.incidents.list || []).map((incident, index) => (
                        <tr 
                          key={incident._id} 
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-white truncate max-w-xs">
                                {incident.url}
                              </div>
                              <div className="flex items-center text-xs text-gray-400">
                                <Globe className="w-3 h-3 mr-1" />
                                {incident.domain}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getIncidentTypeIcon(incident.incidentType)}
                              <span className="text-sm text-white capitalize">
                                {incident.incidentType.replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskLevelColor(incident.riskLevel)}`}>
                              {incident.riskLevel === 'high' ? 'Élevé' : 
                               incident.riskLevel === 'medium' ? 'Moyen' : 'Faible'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-white font-medium mr-2">{incident.riskScore}</span>
                              <div className="w-12 bg-gray-700 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full transition-all duration-300 ${
                                    incident.riskScore >= 70 ? 'bg-red-500' :
                                    incident.riskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${incident.riskScore}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="text-sm text-white">{formatDateTime(incident.createdAt)}</div>
                              <div className="flex items-center space-x-2">
                                {incident.blocked && (
                                  <div className="flex items-center text-red-400">
                                    <Ban className="w-3 h-3 mr-1" />
                                    <span className="text-xs">Bloqué</span>
                                  </div>
                                )}
                                {incident.verified && (
                                  <CheckCircle className="w-3 h-3 text-blue-400" />
                                )}
                                {incident.falsePositive && (
                                  <XCircle className="w-3 h-3 text-yellow-400" />
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => loadIncidentDetails(incident)}
                                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                                title="Voir détails"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {!incident.verified && !incident.falsePositive && (
                                <>
                                  <button
                                    onClick={() => handleMarkAsResolved(incident._id)}
                                    className="text-green-400 hover:text-green-300 transition-colors"
                                    title="Marquer comme résolu"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleMarkAsFalsePositive(incident._id)}
                                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                    title="Marquer comme faux positif"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {(data.incidents.list || []).length === 0 && (
                  <div className="text-center py-12">
                    <Shield className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-300">
                      Aucun incident trouvé
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      {isLoading ? 'Chargement en cours...' : 'Aucun incident ne correspond aux critères sélectionnés.'}
                    </p>
                  </div>
                )}

                {/* Pagination des incidents */}
                {data.incidents.pagination && data.incidents.pagination.totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-white/20 flex items-center justify-between">
                    <div className="text-sm text-gray-300">
                      Affichage de {((data.incidents.pagination.currentPage - 1) * 20) + 1} à {Math.min(data.incidents.pagination.currentPage * 20, data.incidents.pagination.totalIncidents)} sur {data.incidents.pagination.totalIncidents} incidents
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                        disabled={data.incidents.pagination.currentPage === 1}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, data.incidents.pagination.totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                              className={`px-3 py-1 text-sm rounded ${
                                data.incidents.pagination.currentPage === page
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
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(data.incidents.pagination.totalPages, prev.currentPage + 1) }))}
                        disabled={data.incidents.pagination.currentPage === data.incidents.pagination.totalPages}
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

      {/* Panel de détails utilisateur */}
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
 
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-cyan-400 text-xl font-bold">{selectedUser.totalFormationsStarted || 0}</p>
                    <p className="text-gray-300 text-xs">Commencées</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-green-400 text-xl font-bold">{selectedUser.totalFormationsCompleted || 0}</p>
                    <p className="text-gray-300 text-xs">Terminées</p>
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
              </>
            )}
          </div>
        </div>
      )}

      {/* Panel de détails incident */}
      {selectedIncident && (
        <div className="bg-black/40 backdrop-blur-lg border-t border-white/20 flex-shrink-0 max-h-96 overflow-y-auto">
          <div className="p-6">
            {loadingIncident ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mr-3" />
                <span className="text-white">Chargement des détails incident...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                      selectedIncident.riskLevel === 'high' ? 'bg-red-500' :
                      selectedIncident.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}>
                      {getIncidentTypeIcon(selectedIncident.incidentType)}
                    </div>
                    <div>
                      <h3 className="text-white text-xl font-semibold">
                        Incident #{selectedIncident._id?.slice(-8)}
                      </h3>
                      <p className="text-gray-300">{selectedIncident.incidentType.replace('_', ' ')} • Score: {selectedIncident.riskScore}/100</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <p className="text-gray-400 text-sm">{formatDateTime(selectedIncident.createdAt)}</p>
                        {selectedIncident.blocked && (
                          <span className="text-red-400 text-sm font-medium">• BLOQUÉ</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Détails de l'incident */}
                <div className="space-y-6">
                  {/* URL et domaine */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3 flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      URL et Domaine
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-gray-400 text-xs">URL complète:</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-white text-sm break-all">{selectedIncident.url}</p>
                          <button
                            onClick={() => window.open(selectedIncident.url, '_blank')}
                            className="text-cyan-400 hover:text-cyan-300"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Domaine:</p>
                        <p className="text-white text-sm">{selectedIncident.domain}</p>
                      </div>
                    </div>
                  </div>

                  {/* Protection et actions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3">Protection</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Bloqué:</span>
                          <span className={selectedIncident.blocked ? 'text-red-400 font-medium' : 'text-gray-400'}>
                            {selectedIncident.blocked ? 'Oui' : 'Non'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Vérifié:</span>
                          <span className={selectedIncident.verified ? 'text-green-400' : 'text-gray-400'}>
                            {selectedIncident.verified ? 'Oui' : 'Non'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Faux positif:</span>
                          <span className={selectedIncident.falsePositive ? 'text-yellow-400' : 'text-gray-400'}>
                            {selectedIncident.falsePositive ? 'Oui' : 'Non'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3">Actions</h4>
                      <div className="space-y-2">
                        {!selectedIncident.verified && !selectedIncident.falsePositive && (
                          <>
                            <button
                              onClick={() => handleMarkAsResolved(selectedIncident._id)}
                              className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Marquer résolu</span>
                            </button>
                            <button
                              onClick={() => handleMarkAsFalsePositive(selectedIncident._id, 'Marqué depuis les détails')}
                              className="w-full flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Faux positif</span>
                            </button>
                          </>
                        )}
                        {selectedIncident.verified && (
                          <div className="text-center text-green-400 text-sm">
                            <CheckCircle className="w-4 h-4 mx-auto mb-1" />
                            Incident traité
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menaces détectées */}
                  {selectedIncident.threats && selectedIncident.threats.length > 0 && (
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Menaces Détectées ({selectedIncident.threats.length})
                      </h4>
                      <div className="space-y-3">
                        {selectedIncident.threats.map((threat, index) => (
                          <div key={index} className="border border-white/10 rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium capitalize">{threat.type}</span>
                              <span className={`px-2 py-1 text-xs rounded ${
                                threat.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                                threat.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {threat.severity}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm">{threat.message}</p>
                            {threat.details && Object.keys(threat.details).length > 0 && (
                              <div className="mt-2 text-xs text-gray-400">
                                <pre className="whitespace-pre-wrap">
                                  {JSON.stringify(threat.details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Informations techniques */}
                  {selectedIncident.clientInfo && (
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3 flex items-center">
                        <Info className="w-4 h-4 mr-2" />
                        Informations Techniques
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {selectedIncident.clientInfo.userAgent && (
                          <div>
                            <p className="text-gray-400">User Agent:</p>
                            <p className="text-white break-all">{selectedIncident.clientInfo.userAgent.substring(0, 100)}...</p>
                          </div>
                        )}
                        {selectedIncident.clientInfo.extensionVersion && (
                          <div>
                            <p className="text-gray-400">Version Extension:</p>
                            <p className="text-white">{selectedIncident.clientInfo.extensionVersion}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-400">Signalé par:</p>
                          <p className="text-white capitalize">{selectedIncident.reportedBy}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Action utilisateur:</p>
                          <p className="text-white capitalize">{selectedIncident.userAction}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {(selectedIncident.notes || selectedIncident.adminNotes) && (
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Notes
                      </h4>
                      {selectedIncident.notes && (
                        <div className="mb-3">
                          <p className="text-gray-400 text-xs mb-1">Notes utilisateur:</p>
                          <p className="text-white text-sm">{selectedIncident.notes}</p>
                        </div>
                      )}
                      {selectedIncident.adminNotes && (
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Notes admin:</p>
                          <p className="text-white text-sm">{selectedIncident.adminNotes}</p>
                        </div>
                      )}
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