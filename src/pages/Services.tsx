import { useState } from 'react';
import { useServiceHourStore } from '@/store/serviceHourStore';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/types/subscription';
import type { ServicePool } from '@/types/pools';
import { format } from 'date-fns';
import ServiceHours from './ServiceHours';
import './Services.css';

export default function Services() {
  const { currentBusiness } = useAuthStore();
  const { getAvailableBalance, spendCenti } = useWalletStore();
  const [activeTab, setActiveTab] = useState<'hours' | 'pools' | 'subscriptions'>('hours');
  const [pools, setPools] = useState<ServicePool[]>([]);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState<ServicePool | null>(null);
  const [contributionAmount, setContributionAmount] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly'>('monthly');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleContribute = () => {
    if (!selectedPool || !currentBusiness) return;

    const available = getAvailableBalance();
    if (available < contributionAmount) {
      alert('Insufficient Centi balance');
      return;
    }

    if (spendCenti(contributionAmount, `Contribution to ${selectedPool.name} pool`)) {
      setPools(pools.map(pool =>
        pool.id === selectedPool.id
          ? { ...pool, totalCenti: pool.totalCenti + contributionAmount, contributors: pool.contributors + 1 }
          : pool
      ));
      setShowContributeModal(false);
      setSelectedPool(null);
      setContributionAmount(0);
      alert('Contribution successful!');
    }
  };

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowSubscriptionModal(true);
  };

  const confirmSubscription = () => {
    if (!selectedPlan || !currentBusiness) return;

    const price = billingCycle === 'monthly' ? selectedPlan.price : selectedPlan.quarterlyPrice;
    const available = getAvailableBalance();

    if (available < price) {
      alert('Insufficient Centi balance. Please top up your wallet.');
      return;
    }

    if (spendCenti(price, `Subscription: ${selectedPlan.name} (${billingCycle})`)) {
      alert(`Successfully subscribed to ${selectedPlan.name} plan!`);
      setShowSubscriptionModal(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="services-page">
      <div className="page-header">
        <h1>Services</h1>
        <p className="subtitle">Manage your service hours, pools, and subscriptions</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'hours' ? 'active' : ''}`}
          onClick={() => setActiveTab('hours')}
        >
          ⏱️ Service Hours
        </button>
        <button
          className={`tab ${activeTab === 'pools' ? 'active' : ''}`}
          onClick={() => setActiveTab('pools')}
        >
          🤝 Service Pools
        </button>
        <button
          className={`tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          💎 Subscriptions
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'hours' && <ServiceHours />}
        
        {activeTab === 'pools' && (
          <div className="pools-section">
            <div className="pools-intro">
              <p>Contribute Centi to community service pools and gain access to shared resources like professional services, training programs, or tools.</p>
            </div>

            <div className="pools-grid">
              {pools.length > 0 ? (
                pools.map(pool => (
                  <div key={pool.id} className="pool-card">
                    <div className="pool-header">
                      <h3>{pool.name}</h3>
                      <span className="pool-category">{pool.category}</span>
                    </div>
                    <p className="pool-description">{pool.description}</p>
                    <div className="pool-stats">
                      <div className="stat">
                        <span className="stat-label">Total Pool</span>
                        <span className="stat-value">{pool.totalCenti} Centi</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Contributors</span>
                        <span className="stat-value">{pool.contributors}</span>
                      </div>
                    </div>
                    <button
                      className="btn-contribute"
                      onClick={() => {
                        setSelectedPool(pool);
                        setContributionAmount(pool.minContribution);
                        setShowContributeModal(true);
                      }}
                    >
                      Contribute
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No service pools available yet. Check back soon!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="subscriptions-section">
            <div className="billing-toggle">
              <button
                className={billingCycle === 'monthly' ? 'active' : ''}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={billingCycle === 'quarterly' ? 'active' : ''}
                onClick={() => setBillingCycle('quarterly')}
              >
                Quarterly <span className="discount-badge">Save 10%</span>
              </button>
            </div>

            <div className="plans-grid">
              {SUBSCRIPTION_PLANS.map(plan => {
                const price = billingCycle === 'monthly' ? plan.price : plan.quarterlyPrice;
                return (
                  <div key={plan.id} className={`plan-card ${plan.name.toLowerCase()}`}>
                    <div className="plan-header">
                      <h3>{plan.name}</h3>
                      {plan.name === 'Premium' && <span className="popular-badge">Most Popular</span>}
                    </div>
                    <div className="plan-price">
                      <span className="price-amount">{price}</span>
                      <span className="price-unit">Centi</span>
                      <span className="price-period">/{billingCycle === 'monthly' ? 'month' : 'quarter'}</span>
                    </div>
                    <div className="plan-features">
                      <div className="feature-item">
                        <span>✓</span> {plan.serviceCap} services per {billingCycle === 'monthly' ? 'month' : 'quarter'}
                      </div>
                      <div className="feature-item">
                        <span>✓</span> Up to {plan.maxServiceHours} service hours
                      </div>
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="feature-item">
                          <span>✓</span> {feature}
                        </div>
                      ))}
                    </div>
                    <button
                      className="btn-subscribe"
                      onClick={() => handleSubscribe(plan)}
                    >
                      Subscribe Now
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Contribute Modal */}
      {showContributeModal && selectedPool && (
        <div className="modal-overlay" onClick={() => setShowContributeModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Contribute to {selectedPool.name}</h2>
            <div className="form-group">
              <label>Contribution Amount (Centi) *</label>
              <input
                type="number"
                value={contributionAmount}
                onChange={e => setContributionAmount(parseFloat(e.target.value) || 0)}
                min={selectedPool.minContribution}
                max={selectedPool.maxContribution || undefined}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowContributeModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleContribute}>
                Contribute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && selectedPlan && (
        <div className="modal-overlay" onClick={() => setShowSubscriptionModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Confirm Subscription</h2>
            <div className="subscription-summary">
              <p><strong>Plan:</strong> {selectedPlan.name}</p>
              <p><strong>Billing:</strong> {billingCycle}</p>
              <p><strong>Price:</strong> {billingCycle === 'monthly' ? selectedPlan.price : selectedPlan.quarterlyPrice} Centi</p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowSubscriptionModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={confirmSubscription}>
                Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

