import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import LandingPage from './components/LandingPage.jsx';
import LoginPage from './components/LoginPage.jsx';
import RegisterPage from './components/RegisterPage.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import DashboardHome from './components/DashboardHome.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import PatentsPage from './components/PatentsPage.jsx';
import NewFilingPage from './components/NewFilingPage.jsx';
import AnalysisPage from './components/AnalysisPage.jsx'; 
import SettingsPage from './components/SettingsPage.jsx';
import SearchResultsPage from './components/SearchResultsPage.jsx'; 
import PatentDetailsPage from './components/PatentDetailsPage.jsx';
import LegalDashboardPage from './components/LegalDashboardPage.jsx';
import LandscapeVisualizationPage from './components/LandscapeVisualizationPage.jsx';
import FilingTrackerPage from './components/FilingTrackerPage.jsx';
import PricingPage from './components/PricingPage.jsx';
import AdminMonitoringDashboard from './components/AdminMonitoringDashboard.jsx';

import { authAPI } from './services/ai.js';
import 'leaflet/dist/leaflet.css';

const LoginWithNav = ({ onLogin }) => {
  const navigate = useNavigate();
  return <LoginPage onLogin={onLogin} onNavigate={(path) => navigate(`/${path}`)} />;
};

const RegisterWithNav = ({ onLogin }) => {
  const navigate = useNavigate();
  return <RegisterPage onLogin={onLogin} onNavigate={(path) => navigate(`/${path}`)} />;
};

const LandingWithNav = () => {
  const navigate = useNavigate();
  return <LandingPage onNavigate={(path) => navigate(path)} />;
};

const DashboardWithRouter = ({ user, handleLogout, handleUpdateUser }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path, keyword = '') => {
    if (path === 'dashboard' || path === 'overview') {
      navigate('/overview');
    } else if (path === 'search' && keyword) {
      navigate('/search', { state: { keyword } });
    } else {
      navigate(`/${path}`);
    }
  };

  const getCurrentPageId = () => {
    const path = location.pathname.substring(1); 
    return path.split('/')[0] || 'dashboard';
  };

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
  const isSuperAdmin = user?.role === 'ADMIN' || user?.email === ADMIN_EMAIL;

  return (
    <DashboardLayout
      user={user}
      onLogout={handleLogout}
      currentPage={getCurrentPageId()} 
      onNavigate={handleNavigate} 
    >
      <Routes>
        <Route path="overview" element={<DashboardHome user={user} onNavigate={handleNavigate} />} />
        <Route path="profile" element={<ProfilePage user={user} onUpdateUser={handleUpdateUser} onBack={() => navigate('/overview')} />} />
        <Route path="patents" element={<PatentsWithNav />} />
        <Route path="new-filing" element={<NewFilingPage />} />
        <Route path="ai-analysis" element={<AnalysisPage />} />
        <Route path="settings" element={<SettingsPage user={user} />} />
        <Route path="search" element={<SearchWithNav />} />
        <Route path="patent-details" element={<DetailsWithNav />} />
        <Route path="legal-dashboard" element={<LegalDashboardPage />} />
        <Route path="landscape" element={<LandscapeVisualizationPage />} />
        <Route path="filing-tracker" element={<FilingTrackerPage user={user} onNavigate={handleNavigate} />} />
        <Route path="pricing" element={<PricingPage onNavigate={handleNavigate} onUpdateUser={handleUpdateUser} />} />
        
        <Route path="admin-monitoring" element={
          isSuperAdmin ? (
            <AdminMonitoringDashboard />
          ) : (
            <Navigate to="/overview" replace />
          )
        } />

        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

const PatentsWithNav = () => {
  const navigate = useNavigate();
  return <PatentsPage onViewPatent={(patent) => navigate('/patent-details', { state: { patent } })} />;
};

const SearchWithNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialKeyword = location.state?.keyword || '';
  return <SearchResultsPage initialKeyword={initialKeyword} onViewPatent={(patent) => navigate('/patent-details', { state: { patent } })} />;
};

const DetailsWithNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const patent = location.state?.patent;
  if (!patent) return <Navigate to="/search" />;
  return <PatentDetailsPage patent={patent} onBack={() => navigate(-1)} />;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        setLoading(false);
      } else if (token) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error(error);
          handleLogout();
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleUpdateUser = (updates) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-white">
      <Routes>
        <Route path="/" element={<LandingWithNav />} />
        <Route 
          path="/login" 
          element={!user ? <LoginWithNav onLogin={handleLogin} /> : <Navigate to="/overview" />} 
        />
        <Route 
          path="/register" 
          element={!user ? <RegisterWithNav onLogin={handleLogin} /> : <Navigate to="/overview" />} 
        />
        <Route 
          path="/*" 
          element={
            user ? (
              <DashboardWithRouter 
                user={user} 
                handleLogout={handleLogout} 
                handleUpdateUser={handleUpdateUser} 
              />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </div>
  );
};

export default App;