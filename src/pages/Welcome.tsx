import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import './Welcome.css';

export default function Welcome() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return null; // Don't show welcome page if logged in
  }

  return (
    <div className="welcome-page">
      <div className="welcome-hero">
        <div className="hero-content">
          <img 
            src="/1735912600698.jpeg" 
            alt="Centi Flow Logo" 
            className="hero-logo"
          />
          <h1 className="hero-title">Welcome to Centi Flow</h1>
          <p className="hero-subtitle">
            Revolutionizing the way businesses and professionals exchange value in a dynamic, service-oriented ecosystem.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn-hero-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn-hero-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Why Choose Centi Flow?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Flexible Service Exchange</h3>
            <p>Exchange services seamlessly using Centi, our universal service token. No cash? No problem. Simply pay with your skills or services.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Accessible Lending System</h3>
            <p>Borrow Centi upfront to access services or tools you need to grow. Repay through service hours, cash, or other resources.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Dynamic Ecosystem</h3>
            <p>Centi Flow creates a circular economy where every transaction supports the next. Earn Centi by offering services and spend them on what you need.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Growth Opportunities</h3>
            <p>Businesses earn additional Centi through Proof of Contribution rewards and participate in ecosystem growth while accessing premium services.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Driven Pricing</h3>
            <p>Fair pricing for all. Centi Flow uses advanced AI models to ensure service costs align with market demand, benefiting both providers and consumers.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💎</div>
            <h3>Subscription Plans</h3>
            <p>Choose from Basic, Pro, or Premium plans. Predictable costs make planning easy with capped services per month.</p>
          </div>
        </div>
      </div>

      <div className="how-it-works">
        <h2>How Centi Flow Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Service Exchange</h3>
            <p>Offer your services to earn Centi tokens, which can be redeemed for services you need within the platform.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Lending & Repayment</h3>
            <p>Borrow Centi for immediate needs and repay through service hours, products, or cash.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Dynamic Pricing</h3>
            <p>Centi adjusts to demand, ensuring services are priced fairly while promoting ecosystem balance.</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of businesses already using Centi Flow to grow without cash constraints.</p>
        <Link to="/register" className="btn-cta">
          Create Your Business Account
        </Link>
      </div>
    </div>
  );
}

