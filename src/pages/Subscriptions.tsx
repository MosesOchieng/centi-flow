import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/types/subscription';
import './Subscriptions.css';

export default function Subscriptions() {
  const { currentBusiness } = useAuthStore();
  const { getAvailableBalance, spendCenti } = useWalletStore();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly'>('monthly');
  const [showModal, setShowModal] = useState(false);

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowModal(true);
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
      setShowModal(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="subscriptions-page">
      <div className="page-header">
        <h1>Centi Subscription Plans</h1>
        <p className="subtitle">Choose a plan that fits your business needs</p>
      </div>

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
          const savings = billingCycle === 'quarterly' 
            ? (plan.price * 3) - plan.quarterlyPrice 
            : 0;

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
              {savings > 0 && (
                <div className="plan-savings">
                  Save {savings} Centi per quarter
                </div>
              )}
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

      {showModal && selectedPlan && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Confirm Subscription</h2>
            <div className="subscription-summary">
              <p><strong>Plan:</strong> {selectedPlan.name}</p>
              <p><strong>Billing:</strong> {billingCycle}</p>
              <p><strong>Price:</strong> {billingCycle === 'monthly' ? selectedPlan.price : selectedPlan.quarterlyPrice} Centi</p>
              <p><strong>Services:</strong> {selectedPlan.serviceCap} per {billingCycle === 'monthly' ? 'month' : 'quarter'}</p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
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

