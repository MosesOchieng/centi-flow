import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/store/adminStore';
import { format } from 'date-fns';
import './Admin.css';

export default function Admin() {
  const navigate = useNavigate();
  const { 
    isAdmin, 
    login, 
    logout, 
    pendingBusinesses, 
    allBusinesses,
    loadPendingBusinesses,
    loadAllBusinesses,
    approveBusiness,
    rejectBusiness
  } = useAdminStore();

  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    // Check if already logged in
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (adminLoggedIn === 'true') {
      useAdminStore.setState({ isAdmin: true });
      loadPendingBusinesses();
      loadAllBusinesses();
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadPendingBusinesses();
      loadAllBusinesses();
    }
  }, [isAdmin]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (login(password)) {
      loadPendingBusinesses();
      loadAllBusinesses();
    } else {
      setLoginError('Invalid password');
    }
  };

  const handleApprove = async (businessId: string) => {
    setIsProcessing(businessId);
    await approveBusiness(businessId);
    setIsProcessing(null);
  };

  const handleReject = async (businessId: string) => {
    setIsProcessing(businessId);
    await rejectBusiness(businessId);
    setIsProcessing(null);
  };

  if (!isAdmin) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <img 
              src="/1735912600698.jpeg" 
              alt="Centi Flow Logo" 
              className="admin-logo"
            />
            <h1>Admin Login</h1>
            <p>Enter admin password to access the admin panel</p>
          </div>

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label>Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
              />
              {loginError && (
                <span className="error-message">{loginError}</span>
              )}
            </div>

            <button type="submit" className="btn-admin-login">
              Login
            </button>
          </form>

          <button 
            className="btn-back-to-app"
            onClick={() => navigate('/')}
          >
            ← Back to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Admin Panel</h1>
          <p>Manage business verifications and platform settings</p>
        </div>
        <button onClick={logout} className="btn-logout">
          Logout
        </button>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending KYC ({pendingBusinesses.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Businesses ({allBusinesses.length})
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'pending' ? (
          <div className="businesses-list">
            {pendingBusinesses.length > 0 ? (
              pendingBusinesses.map(business => (
                <div key={business.id} className="business-card">
                  <div className="business-info">
                    <h3>{business.name}</h3>
                    <p className="business-email">{business.email}</p>
                    <div className="business-meta">
                      <span>Registered: {format(business.createdAt, 'MMM dd, yyyy')}</span>
                      <span className="status-badge status-pending">Pending Review</span>
                    </div>
                  </div>
                  <div className="business-actions">
                    <button
                      className="btn-approve"
                      onClick={() => handleApprove(business.id)}
                      disabled={isProcessing === business.id}
                    >
                      {isProcessing === business.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleReject(business.id)}
                      disabled={isProcessing === business.id}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No pending KYC requests</p>
              </div>
            )}
          </div>
        ) : (
          <div className="businesses-list">
            {allBusinesses.length > 0 ? (
              <table className="businesses-table">
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Email</th>
                    <th>KYC Status</th>
                    <th>Verified</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allBusinesses.map(business => (
                    <tr key={business.id}>
                      <td>{business.name}</td>
                      <td>{business.email}</td>
                      <td>
                        <span className={`status-badge status-${business.kycStatus || 'incomplete'}`}>
                          {business.kycStatus || 'Incomplete'}
                        </span>
                      </td>
                      <td>
                        {business.verified ? (
                          <span className="verified-badge">✓ Verified</span>
                        ) : (
                          <span className="not-verified-badge">Not Verified</span>
                        )}
                      </td>
                      <td>{format(business.createdAt, 'MMM dd, yyyy')}</td>
                      <td>
                        {!business.verified && business.kycStatus === 'pending' && (
                          <div className="table-actions">
                            <button
                              className="btn-approve-small"
                              onClick={() => handleApprove(business.id)}
                              disabled={isProcessing === business.id}
                            >
                              Approve
                            </button>
                            <button
                              className="btn-reject-small"
                              onClick={() => handleReject(business.id)}
                              disabled={isProcessing === business.id}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>No businesses found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

