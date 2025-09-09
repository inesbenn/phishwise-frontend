//src/Pages/LoginPage.jsx
import { useState } from 'react';
import client from '../api/client'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data } = await client.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      window.location.href = '/home';
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Security Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-12 left-8 text-cyan-300/30 text-3xl animate-bounce delay-1000" style={{animationDuration: '3s'}}>🛡️</div>
        <div className="absolute top-20 right-16 text-purple-300/30 text-2xl animate-bounce delay-2000" style={{animationDuration: '4s'}}>🔒</div>
        <div className="absolute bottom-32 left-12 text-pink-300/30 text-4xl animate-bounce delay-500" style={{animationDuration: '3.5s'}}>🎯</div>
        <div className="absolute bottom-16 right-12 text-cyan-300/30 text-2xl animate-bounce delay-1500" style={{animationDuration: '2.5s'}}>⚡</div>
        <div className="absolute top-1/3 left-1/6 text-emerald-300/20 text-xl animate-bounce delay-3000" style={{animationDuration: '4.5s'}}>🔐</div>
        <div className="absolute bottom-1/3 right-1/5 text-orange-300/20 text-3xl animate-bounce delay-2500" style={{animationDuration: '3.2s'}}>🔍</div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center items-start space-y-12 text-white px-16 xl:px-24 2xl:px-32">
          <div className="space-y-8">
            <h1 className="text-6xl xl:text-7xl 2xl:text-8xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent leading-tight">
              PhishWise
            </h1>
            <p className="text-2xl xl:text-3xl 2xl:text-4xl text-gray-300 leading-relaxed max-w-3xl">
              Protégez votre organisation contre les attaques de phishing grâce à notre plateforme de simulation et de formation avancée.
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-center space-x-6 text-cyan-300">
              <div className="w-16 h-16 xl:w-18 xl:h-18 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl xl:text-4xl">🎯</span>
              </div>
              <span className="text-xl xl:text-2xl">Simulations réalistes de phishing</span>
            </div>
            <div className="flex items-center space-x-6 text-purple-300">
              <div className="w-16 h-16 xl:w-18 xl:h-18 bg-purple-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl xl:text-4xl">📊</span>
              </div>
              <span className="text-xl xl:text-2xl">Analyses détaillées et rapports</span>
            </div>
            <div className="flex items-center space-x-6 text-pink-300">
              <div className="w-16 h-16 xl:w-18 xl:h-18 bg-pink-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl xl:text-4xl">🛡️</span>
              </div>
              <span className="text-xl xl:text-2xl">Formation personnalisée</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 lg:w-1/2 xl:w-2/5 flex flex-col justify-center items-center p-6 sm:p-8 md:p-12 lg:p-16">
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-12 sm:mb-16">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              PhishWise
            </h1>
            <p className="text-gray-300 text-base sm:text-lg md:text-xl mt-4">
              Plateforme de sécurité avancée
            </p>
          </div>

          {/* Login Card */}
          <div className="w-full max-w-lg backdrop-blur-lg bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8 sm:p-10 md:p-12 space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Connexion</h2>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl text-center backdrop-blur-sm text-base sm:text-lg">
                {error}
              </div>
            )}

            {/* Login Form */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="email" className="text-gray-300 text-base sm:text-lg font-medium block">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 sm:py-5 bg-white/10 border border-white/20 rounded-xl text-white text-base sm:text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  placeholder="votre.email@exemple.com"
                  required
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="password" className="text-gray-300 text-base sm:text-lg font-medium block">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 sm:py-5 bg-white/10 border border-white/20 rounded-xl text-white text-base sm:text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-base sm:text-lg">
                <label className="flex items-center text-gray-300 cursor-pointer">
                  <input type="checkbox" className="mr-4 w-5 h-5 rounded border-white/20 bg-white/10 text-cyan-400 focus:ring-cyan-400" />
                  Se souvenir de moi
                </label>
                <a href="#!" className="text-cyan-400 hover:text-cyan-300 transition-colors text-center sm:text-right">
                  Mot de passe oublié ?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-4 sm:py-5 px-8 rounded-xl font-medium text-base sm:text-lg hover:from-cyan-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-4"></div>
                    Connexion...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </button>
            </div>
          </div>

          {/* Sign up link */}
        
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm border-t border-white/10">
        <div className="w-full px-6 py-4 text-center">
          <div className="text-gray-300 text-sm sm:text-base">© 2025 PhishWise. Tous droits réservés.</div>
        </div>
      </div>
    </div>
  );
}