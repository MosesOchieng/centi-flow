import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import type { ServicePool } from '@/types/pools';
import './ServicePools.css';

export default function ServicePools() {
  const { currentBusiness } = useAuthStore();
  const { getAvailableBalance, spendCenti } = useWalletStore();
  const [pools, setPools] = useState<ServicePool[]>([]);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState<ServicePool | null>(null);
  const [contributionAmount, setContributionAmount] = useState(0);

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

  const openContributeModal = (pool: ServicePool) => {
    setSelectedPool(pool);
    setContributionAmount(pool.minContribution);
    setShowContributeModal(true);
  };

  return (
    <div className="service-pools-page">
      <div className="page-header">
        <h1>🤝 Service Pools</h1>
        <p className="subtitle">Pool Centi with other businesses to access premium services</p>
      </div>

      <div className="pools-intro">
        <p>Contribute Centi to community service pools and gain access to shared resources like professional services, training programs, or tools. Access is based on your contribution level or demonstrated need.</p>
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
                <div className="stat">
                  <span className="stat-label">Services Funded</span>
                  <span className="stat-value">{pool.servicesFunded}</span>
                </div>
              </div>
              <div className="pool-access">
                <span className="access-type">Access: {pool.accessType.replace('_', ' ')}</span>
                <span className="min-contribution">Min: {pool.minContribution} Centi</span>
              </div>
              <button
                className="btn-contribute"
                onClick={() => openContributeModal(pool)}
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

      {showContributeModal && selectedPool && (
        <div className="modal-overlay" onClick={() => setShowContributeModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Contribute to {selectedPool.name}</h2>
            <div className="contribution-info">
              <p><strong>Pool Total:</strong> {selectedPool.totalCenti} Centi</p>
              <p><strong>Min Contribution:</strong> {selectedPool.minContribution} Centi</p>
              {selectedPool.maxContribution && (
                <p><strong>Max Contribution:</strong> {selectedPool.maxContribution} Centi</p>
              )}
            </div>
            <div className="form-group">
              <label>Contribution Amount (Centi) *</label>
              <input
                type="number"
                value={contributionAmount}
                onChange={e => setContributionAmount(parseFloat(e.target.value) || 0)}
                min={selectedPool.minContribution}
                max={selectedPool.maxContribution || undefined}
                placeholder={`Min: ${selectedPool.minContribution}`}
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
    </div>
  );
}

