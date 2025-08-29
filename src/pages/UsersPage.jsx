//src/pages/UsersPage.jsx
import { useEffect, useState } from 'react';
import {
  Users, Search, Plus, Edit, Trash2, Mail, Shield, UserCheck, UserX,
  ChevronLeft, ChevronRight, Filter, Bell, Menu, X, Save, XCircle,
  AlertCircle, CheckCircle, Eye, Loader2, EyeOff
} from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export default function FullScreenUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [modalFormData, setModalFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'User',
    status: 'active',
  });

  const { user: currentUser } = useAuth();
  const perPage = 12; 

  /**
   * Fetches the list of users from the API using the configured client.
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await client.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Fetch users error:', err);
      if (err.response?.status === 403) {
        setError('Accès refusé. Vous n\'avez pas les permissions nécessaires pour consulter les utilisateurs.');
      } else if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else {
        setError('Impossible de charger les utilisateurs: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  }; 

  useEffect(() => { 
    fetchUsers();
  }, []); 
 
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
 
  useEffect(() => {
    if (showModal) {
      setModalFormData(editData ? {
        ...editData,
        password: '' // Toujours vide pour la sécurité
      } : {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'User',
        status: 'active',
      }); 
      setError('');
      setSuccess('');
      setShowPassword(false);
    }
  }, [editData, showModal]);

  /**
   * Filters the user list based on search term, role, and status. 
   */
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
 
  const handleDeleteInitiate = (id) => {
    setUserToDeleteId(id);
    setShowDeleteConfirmModal(true);
  };
 
  const handleDeleteConfirm = async () => {
    try {
      setError('');
      await client.delete(`/users/${userToDeleteId}`);
      setUsers(prev => prev.filter(u => u._id !== userToDeleteId));
      setSuccess('Utilisateur supprimé avec succès');
    } catch (err) {
      console.error('Delete user error:', err);
      if (err.response?.status === 403) {
        setError('Accès refusé. Vous n\'avez pas les permissions pour supprimer cet utilisateur.');
      } else if (err.response?.status === 404) {
        setError('Utilisateur non trouvé.');
      } else {
        setError('Erreur lors de la suppression: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setShowDeleteConfirmModal(false);
      setUserToDeleteId(null);
    }
  };

  const handleSubmit = async () => { 
    setError('');
    setSuccess('');

    // Validation côté client
    if (!modalFormData.firstName || !modalFormData.lastName || !modalFormData.email) {
      setError('Tous les champs requis doivent être remplis.');
      return;
    }

    // Validation mot de passe pour création
    if (!editData && !modalFormData.password) {
      setError('Le mot de passe est requis pour créer un utilisateur.');
      return;
    }

    // Validation mot de passe si fourni
    if (modalFormData.password && modalFormData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(modalFormData.email)) {
      setError('Le format de l\'e-mail est incorrect. Veuillez entrer un e-mail valide.');
      return;
    }

    // Validation unicité email
    const isDuplicateEmail = users.some(user => 
      user.email === modalFormData.email && 
      (editData ? user._id !== editData._id : true)
    );

    if (isDuplicateEmail) {
      setError('Cette adresse e-mail est déjà utilisée par un autre utilisateur.');
      return;
    }

    try {
      setSubmitting(true);
      const submitData = { ...modalFormData };
      
      // Si pas de mot de passe pour modification, on l'enlève
      if (editData && !modalFormData.password) {
        delete submitData.password;
      }

      if (editData && editData._id) {
        // Mise à jour utilisateur existant
        const response = await client.put(`/users/${editData._id}`, submitData);
        setUsers(prev => prev.map(u => u._id === editData._id ? response.data.user : u));
        setSuccess('Utilisateur modifié avec succès');
      } else {
        // Création nouvel utilisateur
        await client.post('/users', submitData);
        await fetchUsers();
        setSuccess('Utilisateur créé avec succès');
      }
      setShowModal(false);
      setEditData(null);
    } catch (err) {
      console.error('Submit user error:', err);
      if (err.response?.status === 403) {
        setError('Accès refusé. Vous n\'avez pas les permissions pour effectuer cette action.');
      } else if (err.response?.status === 400) {
        const backendErrors = err.response?.data?.errors;
        if (backendErrors && Array.isArray(backendErrors)) {
          setError(backendErrors.map(e => e.msg).join(', '));
        } else {
          setError(err.response?.data?.message || 'Données invalides.');
        }
      } else {
        setError('Erreur lors de la sauvegarde: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setSubmitting(false);
    }
  };
 
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive': return 'bg-red-500/20 text-red-400 border-red-500/30'; 
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  }; 
 
  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return <Shield className="w-4 h-4 text-purple-400" />;
      case 'Manager': return <UserCheck className="w-4 h-4 text-blue-400" />;
      case 'Analyste': return <Eye className="w-4 h-4 text-cyan-400" />;
      case 'Cible': return <Users className="w-4 h-4 text-rose-400" />;
      default: return <Users className="w-4 h-4 text-gray-400" />;
    }
  };
 
  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif'; 
      default: return status;
    }
  };
 
  const statCardClasses = {
    cyan: {
      bgColor: 'bg-cyan-500/20',
      textColor: 'text-cyan-400',
      iconColor: 'text-cyan-400'
    },
    green: {
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400',
      iconColor: 'text-green-400'
    },
    red: {
      bgColor: 'bg-red-500/20',
      textColor: 'text-red-400', 
      iconColor: 'text-red-400' 
    }
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length
  };

  if (currentUser && currentUser.role !== 'Admin') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center p-8 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Accès Refusé</h2>
          <p className="text-gray-300">Seuls les administrateurs peuvent accéder à la gestion des utilisateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden font-inter">
      {/* Notifications */}
      {success && !showModal && (
        <div className="fixed top-4 right-4 z-50 bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg flex items-center space-x-2 backdrop-blur-lg animate-fade-in-down">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">{success}</span>
        </div>
      )}
      
      {error && !showModal && (
        <div className="fixed top-4 right-4 z-50 bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg flex items-center space-x-2 backdrop-blur-lg animate-fade-in-down">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 h-16 flex items-center px-6 md:px-10 z-30">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              PhishWise
            </h1>
            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-medium hidden sm:block">
              Admin Dashboard
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Rechercher..."
                value={filter}
                onChange={e => { setFilter(e.target.value); setPage(1); }}
                className="pl-10 pr-4 py-2 w-64 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm transition-colors duration-200"
              />
            </div>
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer transition-colors duration-200" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">2</span>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
            </div>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-300 rounded-lg hover:bg-white/10 transition-colors duration-200">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-black/90 backdrop-blur-lg border-b border-white/10 p-4 md:hidden z-20 animate-fade-in-down">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Rechercher..."
                value={filter}
                onChange={e => { setFilter(e.target.value); setPage(1); }}
                className="pl-10 pr-4 py-2 w-full bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm transition-colors duration-200"
              />
            </div> 
            <div className="flex items-center justify-between text-gray-300 px-2 py-2 border-t border-white/10 pt-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
                <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ml-2">2</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto p-6 md:p-10 z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {[
            { label: 'Total', value: stats.total, icon: Users, color: 'cyan' },
            { label: 'Actifs', value: stats.active, icon: UserCheck, color: 'green' },
            { label: 'Inactifs', value: stats.inactive, icon: UserX, color: 'red' }
          ].map((stat, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 shadow-lg hover:shadow-cyan-500/20 transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">{stat.label}</p>
                  <p className={`text-2xl font-bold ${statCardClasses[stat.color].textColor}`}>{stat.value}</p>
                </div>
                <div className={`p-3 ${statCardClasses[stat.color].bgColor} rounded-full`}>
                  <stat.icon className={`w-6 h-6 ${statCardClasses[stat.color].iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-slate-800/70 backdrop-blur-lg rounded-xl border border-white/20 p-4 mb-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <select
                value={roleFilter} 
                onChange={e => { setRoleFilter(e.target.value); setPage(1); }} 
                className="px-4 py-2 bg-slate-700 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm w-full sm:w-auto"
              >
                <option value="" className="bg-slate-700 text-white">Tous les rôles</option>
                <option value="Admin" className="bg-slate-700 text-white">Admin</option>
                <option value="Manager" className="bg-slate-700 text-white">Manager</option>
                <option value="Analyste" className="bg-slate-700 text-white">Analyste</option>
                <option value="Cible" className="bg-slate-700 text-white">Cible</option>
              </select>

              <select
                value={statusFilter} 
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }} 
                className="px-4 py-2 bg-slate-700 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm w-full sm:w-auto"
              >
                <option value="" className="bg-slate-700 text-white">Tous les statuts</option>
                <option value="active" className="bg-slate-700 text-white">Actif</option>
                <option value="inactive" className="bg-slate-700 text-white">Inactif</option> 
              </select>
            </div>

            <button 
              onClick={() => { setEditData(null); setShowModal(true); }}
              className="flex items-center justify-center space-x-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg shadow-md hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un utilisateur</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 flex-1 flex flex-col overflow-hidden shadow-lg">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Gestion des utilisateurs</h2>
            <span className="text-gray-400 text-sm hidden sm:block">{filtered.length} utilisateur(s) trouvé(s)</span>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin text-cyan-400 w-10 h-10" />
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left table-auto">
                <thead className="sticky top-0 bg-white/5 backdrop-blur-lg border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4 text-gray-300 font-medium whitespace-nowrap">Utilisateur</th>
                    <th className="py-3 px-4 text-gray-300 font-medium hidden sm:table-cell whitespace-nowrap">Email</th>
                    <th className="py-3 px-4 text-gray-300 font-medium whitespace-nowrap">Rôle</th>
                    <th className="py-3 px-4 text-gray-300 font-medium whitespace-nowrap">Statut</th>
                    <th className="py-3 px-4 text-gray-300 font-medium text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(user => (
                    <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {user.firstName?.charAt(0).toUpperCase()}{user.lastName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium whitespace-nowrap">{user.firstName} {user.lastName}</p>
                            <p className="text-gray-400 text-xs sm:hidden">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-300 break-all">{user.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2 whitespace-nowrap">
                          {getRoleIcon(user.role)}
                          <span className="text-white">{user.role}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)} whitespace-nowrap`}>
                          {getStatusLabel(user.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => { setEditData(user); setShowModal(true); }}
                            className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInitiate(user._id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {displayed.length === 0 && !loading && (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-gray-300">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg mb-2">Aucun utilisateur trouvé</p>
                        <p className="text-gray-400">Modifiez vos filtres ou ajoutez un utilisateur</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg bg-white/10 border border-white/20 text-white disabled:opacity-50 hover:bg-white/20 transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {[...Array(pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  i + 1 === page
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md'
                    : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              disabled={page === pages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg bg-white/10 border border-white/20 text-white disabled:opacity-50 hover:bg-white/20 transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* User Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl border border-white/20 w-full max-w-md shadow-xl animate-scale-in relative">
            
            {/* Modal-specific Notifications */}
            {success && (
              <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] z-50 bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg flex items-center space-x-2 backdrop-blur-lg animate-fade-in-down">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">{success}</span>
              </div>
            )}
            
            {error && (
              <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] z-50 bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg flex items-center space-x-2 backdrop-blur-lg animate-fade-in-down">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editData ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors duration-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    name="firstName"
                    type="text"
                    required
                    value={modalFormData.firstName}
                    onChange={(e) => setModalFormData({ ...modalFormData, firstName: e.target.value })}
                    placeholder="Prénom"
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-200"
                  />
                  <input
                    name="lastName"
                    type="text"
                    required
                    value={modalFormData.lastName}
                    onChange={(e) => setModalFormData({ ...modalFormData, lastName: e.target.value })}
                    placeholder="Nom"
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-200"
                  />
                </div>

                <input
                  name="email"
                  type="email"
                  required
                  value={modalFormData.email}
                  onChange={(e) => setModalFormData({ ...modalFormData, email: e.target.value })}
                  placeholder="Email"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-200"
                />

                {/* Champ mot de passe avec bouton voir/cacher */}
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={modalFormData.password}
                    onChange={(e) => setModalFormData({ ...modalFormData, password: e.target.value })}
                    placeholder={editData ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe *"}
                    className="w-full px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {!editData && (
                  <p className="text-xs text-gray-400 -mt-2">Le mot de passe doit contenir au moins 6 caractères</p>
                )}

                <select
                  name="role"
                  required
                  value={modalFormData.role}
                  onChange={(e) => setModalFormData({ ...modalFormData, role: e.target.value })} 
                  className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-200"
                >
                  <option value="User" className="bg-slate-700 text-white">User</option>
                  <option value="Manager" className="bg-slate-700 text-white">Manager</option>
                  <option value="Admin" className="bg-slate-700 text-white">Admin</option>
                  <option value="Analyste" className="bg-slate-700 text-white">Analyste</option>
                  <option value="Cible" className="bg-slate-700 text-white">Cible</option>
                </select>

                <select
                  name="status"
                  required
                  value={modalFormData.status}
                  onChange={(e) => setModalFormData({ ...modalFormData, status: e.target.value })} 
                  className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-200"
                >  
                  <option value="active" className="bg-slate-700 text-white">Actif</option>  
                  <option value="inactive" className="bg-slate-700 text-white">Inactif</option> 
                </select>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                    disabled={submitting}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 justify-center min-w-[100px]"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{editData ? 'Modifier' : 'Créer'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl border border-white/20 w-full max-w-sm shadow-xl animate-scale-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Confirmer la suppression</h3>
                <button onClick={() => setShowDeleteConfirmModal(false)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors duration-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-300 mb-6">Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
