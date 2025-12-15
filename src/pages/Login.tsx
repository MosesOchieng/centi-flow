import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(email, password);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <img 
            src="/1735912600698.jpeg" 
            alt="Centi Flow Logo" 
            className="auth-logo"
          />
          <h1>Centi Flow</h1>
          <p>B2B Service Exchange Platform</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Login</h2>
          <div className="form-group">
            <label>Business Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="business@example.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter password"
            />
          </div>
          {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
          <button type="submit" className="btn-primary btn-full">
            Login
          </button>
          <p className="auth-link">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}


