import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useWalletStore } from './store/walletStore';
import { useReputationStore } from './store/reputationStore';
import Layout from './components/Layout';
import Splash from './pages/Splash';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Marketplace from './pages/Marketplace';
import Services from './pages/Services';
import ActiveJobs from './pages/ActiveJobs';
import Admin from './pages/Admin';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated, currentBusiness, loadBusiness } = useAuthStore();
  const { initializeWallet, applyDecayToBalance } = useWalletStore();
  const { initializeReputation } = useReputationStore();

  useEffect(() => {
    // Show splash for 2.5 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    // Load business from localStorage on mount
    const savedBusinessId = localStorage.getItem('currentBusinessId');
    if (savedBusinessId && !isAuthenticated) {
      loadBusiness(savedBusinessId);
    }
  }, []);

  useEffect(() => {
    // Initialize wallet and reputation when business is authenticated
    if (isAuthenticated && currentBusiness) {
      initializeWallet(currentBusiness.id);
      initializeReputation(currentBusiness.id);

      // Apply decay daily check
      const decayInterval = setInterval(() => {
        applyDecayToBalance();
      }, 24 * 60 * 60 * 1000); // Check daily

      return () => clearInterval(decayInterval);
    }
  }, [isAuthenticated, currentBusiness, initializeWallet, initializeReputation, applyDecayToBalance]);

  return (
    <BrowserRouter>
      {showSplash ? (
        <Splash />
      ) : (
        <Routes>
          <Route path="/welcome" element={!isAuthenticated ? <Welcome /> : <Navigate to="/" />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
          <Route
            path="/"
            element={isAuthenticated ? <Layout /> : <Navigate to="/welcome" />}
          >
            <Route index element={<Dashboard />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="services" element={<Services />} />
            <Route path="active-jobs" element={<ActiveJobs />} />
          </Route>
          <Route path="/admin" element={<Admin />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;


