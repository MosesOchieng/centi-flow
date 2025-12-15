import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import type { Franchise } from '@/types/franchise';
import './Franchises.css';

export default function Franchises() {
  const { currentBusiness } = useAuthStore();
  const { getAvailableBalance, spendCenti } = useWalletStore();
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState(0);

  const handleInvest = () => {
    if (!selectedFranchise || !currentBusiness) return;

    const available = getAvailableBalance();
    if (available < investmentAmount) {
      alert('Insufficient Centi balance');
      return;
    }

    if (spendCenti(investmentAmount, `Franchise investment: ${selectedFranchise.serviceCategory}`)) {
      // Calculate returns (example: 5% monthly ROI)
      const monthlyReturns = investmentAmount * 0.05;
      
      setFranchises(franchises.map(f =>
        f.id === selectedFranchise.id
          ? { ...f, investment: f.investment + investmentAmount, monthlyReturns: f.monthlyReturns + monthlyReturns }
          : f
      ));
      
      setShowInvestModal(false);
      setSelectedFranchise(null);
      setInvestmentAmount(0);
      alert(`Investment successful! Expected monthly returns: ${monthlyReturns.toFixed(2)} Centi`);
    }
  };

  const openInvestModal = (franchise: Franchise) => {
    setSelectedFranchise(franchise);
    setInvestmentAmount(franchise.investment);
    setShowInvestModal(true);
  };

  return (
    <div className="franchises-page">
      <div className="page-header">
        <h1>🏪 Micro-Franchises</h1>
        <p className="subtitle">Invest Centi to set up micro-franchises and earn passive income</p>
      </div>

      <div className="franchises-intro">
        <p>Invest Centi tokens to set up micro-franchises offering ecosystem services in your region. Earn passive Centi income from service users in your area, turning your investment into sustainable returns.</p>
      </div>

      <div className="franchises-grid">
        {franchises.length > 0 ? (
          franchises.map(franchise => (
            <div key={franchise.id} className="franchise-card">
              <div className="franchise-header">
                <h3>{franchise.serviceCategory}</h3>
                <span className={`status-badge ${franchise.status}`}>{franchise.status}</span>
              </div>
              <div className="franchise-region">📍 {franchise.region}</div>
              <div className="franchise-stats">
                <div className="stat">
                  <span className="stat-label">Investment</span>
                  <span className="stat-value">{franchise.investment} Centi</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Monthly Returns</span>
                  <span className="stat-value returns">{franchise.monthlyReturns.toFixed(2)} Centi</span>
                </div>
                <div className="stat">
                  <span className="stat-label">ROI</span>
                  <span className="stat-value roi">{franchise.roi.toFixed(1)}%</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Active Users</span>
                  <span className="stat-value">{franchise.activeUsers}</span>
                </div>
              </div>
              <button
                className="btn-invest"
                onClick={() => openInvestModal(franchise)}
              >
                Invest Now
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No franchises available. Check back soon for new opportunities!</p>
          </div>
        )}
      </div>

      {showInvestModal && selectedFranchise && (
        <div className="modal-overlay" onClick={() => setShowInvestModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Invest in Franchise</h2>
            <div className="investment-info">
              <p><strong>Service:</strong> {selectedFranchise.serviceCategory}</p>
              <p><strong>Region:</strong> {selectedFranchise.region}</p>
              <p><strong>Current Investment:</strong> {selectedFranchise.investment} Centi</p>
              <p><strong>Expected ROI:</strong> {selectedFranchise.roi}% monthly</p>
              <p><strong>Current Monthly Returns:</strong> {selectedFranchise.monthlyReturns.toFixed(2)} Centi</p>
            </div>
            <div className="form-group">
              <label>Investment Amount (Centi) *</label>
              <input
                type="number"
                value={investmentAmount}
                onChange={e => setInvestmentAmount(parseFloat(e.target.value) || 0)}
                min={100}
                placeholder="Minimum 100 Centi"
              />
            </div>
            {investmentAmount > 0 && (
              <div className="returns-preview">
                <p>Expected monthly returns: <strong>{(investmentAmount * (selectedFranchise.roi / 100)).toFixed(2)} Centi</strong></p>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowInvestModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleInvest}>
                Invest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

