import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import './Layout.css';

export default function Layout() {
  const { currentBusiness, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogoClick = (e: React.MouseEvent) => {
    // Check if Ctrl/Cmd key is pressed for admin access
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      navigate('/admin');
    }
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand" onClick={handleLogoClick} style={{ cursor: 'pointer' }} title="Click logo (Ctrl/Cmd) to access admin">
          <img 
            src="/1735912600698.jpeg" 
            alt="Centi Flow Logo" 
            className="navbar-logo"
          />
          <h1>Centi Flow</h1>
        </div>
        <div className="navbar-user">
          <span>{currentBusiness?.name}</span>
          <button onClick={logout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="layout-container">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <span className="nav-icon">📊</span>
              Dashboard
            </Link>
            <Link
              to="/marketplace"
              className={`nav-link ${isActive('/marketplace') || isActive('/tasks') || isActive('/barter') ? 'active' : ''}`}
            >
              <span className="nav-icon">➕</span>
              Offer Service
            </Link>
            <Link
              to="/services"
              className={`nav-link ${isActive('/services') || isActive('/service-hours') || isActive('/pools') || isActive('/subscriptions') ? 'active' : ''}`}
            >
              <span className="nav-icon">⏱️</span>
              Services
            </Link>
            <Link
              to="/wallet"
              className={`nav-link ${isActive('/wallet') ? 'active' : ''}`}
            >
              <span className="nav-icon">💳</span>
              Wallet
            </Link>
          </nav>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


