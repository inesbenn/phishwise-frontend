// src/components/PermissionDenied.jsx
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PermissionDenied = ({ requiredRoles = [], currentRoute }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Accès Refusé</h1>
          <p className="text-gray-300">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
        
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-300 text-sm">
            <strong>Votre rôle:</strong> {user?.role || 'Non défini'}
          </p>
          {requiredRoles.length > 0 && (
            <p className="text-red-300 text-sm mt-1">
              <strong>Rôles requis:</strong> {requiredRoles.join(', ')}
            </p>
          )}
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/home')}
            className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au dashboard</span>
          </button>
          
          <p className="text-gray-400 text-xs">
            Si vous pensez que c'est une erreur, contactez votre administrateur.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PermissionDenied;