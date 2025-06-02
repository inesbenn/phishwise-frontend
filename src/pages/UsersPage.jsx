import { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Shield,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Eye,
  Bell,
  Menu,
  X,
  Save,
  XCircle,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function ModernUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNotifications, setActiveNotifications] = useState(2);
  const perPage = 8;
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Configuration de l'API - ajustez l'URL selon votre configuration
  const API_BASE_URL = 'http://localhost:3000/api'; // Changez si nécessaire

  // Fonction utilitaire pour les appels API
  const apiCall = async (method, endpoint, data = null) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur ${response.status}`);
    }

    return response.json();
  };

  // Récupérer tous les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiCall('GET', '/users');
      setUsers(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
      setError('Impossible de charger les utilisateurs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Afficher les messages temporaires
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Filter & paginate
  const filtered = users.filter(u => {
    const matchesSearch = u.firstName.toLowerCase().includes(filter.toLowerCase()) ||
                         u.lastName.toLowerCase().includes(filter.toLowerCase()) ||
                         u.email.toLowerCase().includes(filter.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesStatus = !statusFilter || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  const total = filtered.length;
  const pages = Math.ceil(total / perPage);
  const displayed = filtered.slice((page - 1) * perPage, page * perPage);

  // Supprimer un utilisateur
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        setError('');
        await apiCall('DELETE', `/users/${id}`);
        setUsers(prev => prev.filter(u => u._id !== id));
        setSuccess('Utilisateur supprimé avec succès');
      } catch (err) {
        console.error('Erreur suppression:', err);
        setError('Erreur lors de la suppression: ' + err.message);
      }
    }
  };

  // Créer ou mettre à jour un utilisateur
  const handleSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError('');

      if (editData && editData._id) {
        // Mise à jour
        const updatedUser = await apiCall('PUT', `/users/${editData._id}`, data);
        setUsers(prev => prev.map(u => u._id === editData._id ? updatedUser.user : u));
        setSuccess('Utilisateur modifié avec succès');
      } else {
        // Création - ajouter le mot de passe requis
        const newUserData = { ...data, password: 'TempPassword123!' }; // Mot de passe temporaire
        const result = await apiCall('POST', '/users', newUserData);
        // Recharger la liste pour avoir l'utilisateur complet
        await fetchUsers();
        setSuccess('Utilisateur créé avec succès');
      }
      
      setShowModal(false);
      setEditData(null);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      setError('Erreur lors de la sauvegarde: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'suspended':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin':
        return <Shield className="w-4 h-4 text-purple-400" />;
      case 'Manager':
        return <UserCheck className="w-4 h-4 text-blue-400" />;
      case 'Analyste':
        return <Eye className="w-4 h-4 text-cyan-400" />;
      default:
        return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'suspended': return 'Suspendu';
      default: return status;
    }
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    suspended: users.filter(u => u.status === 'suspended').length
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
      {/* Messages de notification */}
      {success && (
        <div className="fixed top-4 right-4 z-50 bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg flex items-center space-x-2 backdrop-blur-lg">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}
      
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center space-x-2 backdrop-blur-lg">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40 w-full">
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
                  placeholder="Rechercher un utilisateur..."
                  value={filter}
                  onChange={e => { setFilter(e.target.value); setPage(1); }}
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
                  placeholder="Rechercher un utilisateur..."
                  value={filter}
                  onChange={e => { setFilter(e.target.value); setPage(1); }}
                  className="pl-10 pr-4 py-2 w-full bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-300 text-xs sm:text-sm truncate">Total Utilisateurs</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="p-2 sm:p-3 bg-cyan-500/20 rounded-full flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-300 text-xs sm:text-sm truncate">Actifs</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-400">{stats.active}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-500/20 rounded-full flex-shrink-0">
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-300 text-xs sm:text-sm truncate">Inactifs</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-400">{stats.inactive}</p>
              </div>
              <div className="p-2 sm:p-3 bg-red-500/20 rounded-full flex-shrink-0">
                <UserX className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-300 text-xs sm:text-sm truncate">Suspendus</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-400">{stats.suspended}</p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-500/20 rounded-full flex-shrink-0">
                <UserX className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions & Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={roleFilter}
                  onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm min-w-32"
                >
                  <option value="">Tous les rôles</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Analyste">Analyste</option>
                  <option value="Cible">Cible</option>
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm min-w-32"
                >
                  <option value="">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="suspended">Suspendu</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
             
              
              <button 
                onClick={() => { setEditData(null); setShowModal(true); }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Ajouter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            <p className="text-gray-300 mt-4">Chargement des utilisateurs...</p>
          </div>
        )}

        {/* Users Table/Cards */}
        {!loading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/20 p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Liste des Utilisateurs</h2>
              <span className="text-gray-400 text-sm">{filtered.length} utilisateur(s) trouvé(s)</span>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Utilisateur</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Rôle</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Statut</th>
                    
                    <th className="text-right py-3 px-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(user => (
                    <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">{user.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role)}
                          <span className="text-white">{user.role}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                          {getStatusLabel(user.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-300 text-sm">
                          {user.office && <div>{user.office}</div>}
                          {user.country && <div className="text-gray-400">{user.country}</div>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => { setEditData(user); setShowModal(true); }}
                            className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {displayed.map(user => (
                <div key={user._id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{user.firstName} {user.lastName}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-300 text-sm">{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        <span className="text-white text-sm">{user.role}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                        {getStatusLabel(user.status)}
                      </span>
                    </div>
                  </div>

                  {(user.office || user.country) && (
                    <div className="text-gray-300 text-sm mb-3">
                      {user.office && <div>{user.office}</div>}
                      {user.country && <div className="text-gray-400">{user.country}</div>}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => { setEditData(user); setShowModal(true); }}
                      className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {displayed.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 text-lg mb-2">Aucun utilisateur trouvé</p>
                <p className="text-gray-400">Essayez de modifier vos filtres ou d'ajouter un nouvel utilisateur</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg bg-white/10 border border-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex space-x-1">
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    i + 1 === page
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <button
              disabled={page === pages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg bg-white/10 border border-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Modal Form for create/edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl border border-white/20 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editData ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  firstName: formData.get('firstName'),
                  lastName: formData.get('lastName'),
                  email: formData.get('email'),
                  role: formData.get('role'),
                  status: formData.get('status')
                };
                handleSubmit(data);
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Prénom
                    </label>
                    <input
                      name="firstName"
                      type="text"
                      required
                      defaultValue={editData?.firstName || ''}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom
                    </label>
                    <input
                      name="lastName"
                      type="text"
                      required
                      defaultValue={editData?.lastName || ''}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={editData?.email || ''}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="adresse@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rôle
                  </label>
                  <select
                    name="role"
                    required
                    defaultValue={editData?.role || 'User'}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="User">User</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Statut
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue={editData?.status || 'active'}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center space-x-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Annuler</span>
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editData ? 'Modifier' : 'Créer'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
