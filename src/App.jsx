import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage  from './pages/HomePage';
import UsersPage from './pages/UsersPage';
import CampaignWizard from './pages/CampaignWizard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/campaign-wizard" element={<CampaignWizard />} />

      </Routes>
    </BrowserRouter>
  );
}
