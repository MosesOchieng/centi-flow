import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import './Auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    verified: false
  });
  const { register } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register({ ...formData, password: formData.password });
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
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
          <h2>Register Business</h2>
          <div className="form-group">
            <label>Business Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Your Business Name"
            />
          </div>
          <div className="form-group">
            <label>Business Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="business@example.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Create password"
            />
          </div>
          {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
          <button type="submit" className="btn-primary btn-full">
            Register
          </button>
          <p className="auth-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}


