// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import UsersPage from './pages/UsersPage';
import CampaignWizard from './pages/CampaignWizard';
import LearningPagesManagement from './pages/LearningPagesManagement';
import TrainingView from './pages/TrainingView';
import Analytics from './pages/Analytics';
import URLScanner from './components/URLScanner'; // 🆕 Import du nouveau composant
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
        />
        <Routes>
          {/* Route publique */}
          <Route path="/" element={<LoginPage />} />
          
          {/* Routes protégées */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute requiredRoles={['Admin', 'Manager', 'Analyste']}>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/users" 
            element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <UsersPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/campaign-wizard" 
            element={
              <ProtectedRoute requiredRoles={['Admin', 'Manager']}>
                <CampaignWizard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/learning-pages" 
            element={
              <ProtectedRoute requiredRoles={['Admin', 'Manager', 'Analyste']}>
                <LearningPagesManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute requiredRoles={['Admin', 'Manager', 'Analyste']}>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/training/:campaignId" 
            element={
              <ProtectedRoute requiredRoles={['Admin', 'Manager', 'Analyste', 'Cible']}>
                <TrainingView />
              </ProtectedRoute>
            } 
          />
          
          {/* 🆕 NOUVELLE ROUTE : Scanner d'URL */}
          <Route 
            path="/url-scanner" 
            element={
              <ProtectedRoute requiredRoles={['Admin', 'Manager', 'Analyste', 'Cible']}>
                <URLScanner />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
