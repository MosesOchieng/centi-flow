import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { useAuthStore } from '@/store/authStore';
import { useActivityStore } from '@/store/activityStore';
import { useReputationStore } from '@/store/reputationStore';
import PaystackPayment from '@/components/PaystackPayment';
import { generateLendingTerms, type BorrowerProfile } from '@/utils/lending';
import { format } from 'date-fns';
import './Wallet.css';

export default function Wallet() {
  const { balance, transactions, borrowedCenti, borrowCenti, addCenti, getAvailableBalance, getTotalOwed } = useWalletStore();
  const { currentBusiness } = useAuthStore();
  const { addActivity } = useActivityStore();
  const { getReputation } = useReputationStore();
  const [borrowAmount, setBorrowAmount] = useState('');
  const [repaymentMethod, setRepaymentMethod] = useState<'cash' | 'service_hours' | 'mixed'>('service_hours');
  const [serviceHourRate, setServiceHourRate] = useState(10);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showPaystackModal, setShowPaystackModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(100);
  const [lendingTerms, setLendingTerms] = useState<any>(null);

  // Calculate lending terms when amount changes
  const calculateTerms = () => {
    if (!currentBusiness || !borrowAmount || parseFloat(borrowAmount) <= 0) {
      setLendingTerms(null);
      return;
    }

    const amount = parseFloat(borrowAmount);
    const reputation = getReputation(currentBusiness.id);
    
    const borrowerProfile: BorrowerProfile = {
      businessId: currentBusiness.id,
      reputation: {
        businessId: currentBusiness.id,
        score: reputation.score,
        totalRatings: reputation.totalRatings,
        averageRating: reputation.averageRating,
        onTimeCompletionRate: reputation.onTimeCompletionRate,
        totalJobsCompleted: reputation.totalJobsCompleted,
        totalJobsDelivered: reputation.totalJobsDelivered,
        badges: reputation.badges
      },
      transactionVolume: currentBusiness.totalHoursDelivered + currentBusiness.totalHoursReceived,
      repaymentHistory: {
        onTime: 10, // Would come from actual data
        late: 0,
        defaulted: 0
      },
      currentDebt: getTotalOwed(),
      borrowingPurpose: 'growth'
    };

    const terms = generateLendingTerms(
      borrowerProfile,
      amount,
      repaymentMethod,
      'growth',
      30, // 30 days
      serviceHourRate,
      5000, // Market liquidity (would be dynamic)
      50, // Service demand (would be dynamic)
      false // Has collateral
    );

    setLendingTerms(terms);
  };

  useEffect(() => {
    if (borrowAmount && showBorrowModal && currentBusiness) {
      calculateTerms();
    }
  }, [borrowAmount, repaymentMethod, serviceHourRate, showBorrowModal, currentBusiness]);

  const handleBorrow = () => {
    const amount = parseFloat(borrowAmount);
    if (amount > 0 && lendingTerms) {
      const borrowed = borrowCenti(amount, repaymentMethod);
      if (borrowed) {
        addActivity({
          businessId: currentBusiness?.id || '',
          type: 'transaction',
          title: 'Centi Borrowed',
          description: `Borrowed ${amount} Centi at ${lendingTerms.interestRate.toFixed(1)}% interest - repay ${lendingTerms.totalRepayment.toFixed(2)} Centi by ${format(lendingTerms.dueDate, 'MMM dd, yyyy')}`
        });
        setBorrowAmount('');
        setShowBorrowModal(false);
        setLendingTerms(null);
      } else {
        alert('Borrowing limit exceeded or invalid amount');
      }
    }
  };

  return (
    <div className="wallet-page">
      <div className="page-header">
        <h1>Centi Wallet</h1>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowPaystackModal(true)}
          >
            💳 Top Up
          </button>
          <button
            className="btn-primary"
            onClick={() => setShowBorrowModal(true)}
          >
            Borrow Centi
          </button>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="wallet-overview">
        <div className="balance-card">
          <div className="balance-label">Available Balance</div>
          <div className="balance-amount-large">{getAvailableBalance().toFixed(2)}</div>
          <div className="balance-unit">Centi</div>
        </div>
        <div className="balance-stats">
          <div className="stat-item">
            <span className="stat-label">Total Earned</span>
            <span className="stat-value">{balance.totalEarned.toFixed(2)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Spent</span>
            <span className="stat-value">{balance.totalSpent.toFixed(2)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Borrowed</span>
            <span className="stat-value text-warning">{getTotalOwed().toFixed(2)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Locked</span>
            <span className="stat-value">{balance.locked.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Borrowed Centi */}
      {borrowedCenti.filter(b => b.status === 'active').length > 0 && (
        <div className="section">
          <h2>Active Borrowings</h2>
          <div className="borrowed-list">
            {borrowedCenti
              .filter(b => b.status === 'active')
              .map(borrow => (
                <div key={borrow.id} className="borrowed-item">
                  <div className="borrowed-header">
                    <span className="borrowed-amount">{borrow.amount} Centi</span>
                    <span className="borrowed-status">Active</span>
                  </div>
                  <div className="borrowed-details">
                    <div>Borrowed: {format(borrow.borrowedAt, 'MMM dd, yyyy')}</div>
                    <div>Due: {format(borrow.dueDate, 'MMM dd, yyyy')}</div>
                    <div>Repaid: {borrow.repaidAmount.toFixed(2)} / {borrow.amount}</div>
                    <div>Service Hours Owed: {borrow.serviceHoursOwed.toFixed(2)}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="section">
        <h2>Transaction History</h2>
        <div className="transactions-list">
          {transactions.length > 0 ? (
            transactions.map(tx => (
              <div key={tx.id} className="transaction-item">
                <div className="transaction-icon">
                  {tx.type === 'earn' && '➕'}
                  {tx.type === 'spend' && '➖'}
                  {tx.type === 'borrow' && '📥'}
                  {tx.type === 'repay' && '📤'}
                  {tx.type === 'decay' && '⏳'}
                  {tx.type === 'airdrop' && '🎁'}
                  {tx.type === 'bonus' && '⭐'}
                </div>
                <div className="transaction-details">
                  <div className="transaction-description">{tx.description}</div>
                  <div className="transaction-time">
                    {format(tx.timestamp, 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
                <div className={`transaction-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <p className="empty-state">No transactions yet</p>
          )}
        </div>
      </div>

      {/* Paystack Payment Modal */}
      {showPaystackModal && (
        <div className="modal-overlay" onClick={() => setShowPaystackModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Top Up with Paystack</h2>
            <div className="form-group">
              <label>Amount (Centi)</label>
              <input
                type="number"
                value={topUpAmount}
                onChange={e => setTopUpAmount(parseFloat(e.target.value) || 0)}
                placeholder="Enter amount"
                min="10"
              />
            </div>
            <PaystackPayment
              amount={topUpAmount}
              email={currentBusiness?.email || ''}
              onSuccess={(reference) => {
                // Add Centi to wallet after successful payment
                addCenti(topUpAmount, 'earn', `Top-up via Paystack: ${reference}`);
                addActivity({
                  businessId: currentBusiness?.id || '',
                  type: 'centi_earned',
                  title: 'Payment Successful',
                  description: `Added ${topUpAmount} Centi via Paystack`
                });
                setShowPaystackModal(false);
                alert('Payment successful! Centi added to your wallet.');
              }}
              onCancel={() => setShowPaystackModal(false)}
              description={`Top-up ${topUpAmount} Centi`}
            />
          </div>
        </div>
      )}

      {/* Borrow Modal */}
      {showBorrowModal && (
        <div className="modal-overlay" onClick={() => setShowBorrowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Borrow Centi</h2>
            <p className="modal-description">
              Borrow Centi to access services early. Interest rates are calculated dynamically based on your reputation and market conditions (3-15% range).
            </p>
            <div className="form-group">
              <label>Amount (Centi)</label>
              <input
                type="number"
                value={borrowAmount}
                onChange={e => {
                  setBorrowAmount(e.target.value);
                }}
                onBlur={calculateTerms}
                placeholder="Enter amount"
                min="10"
                max="500"
              />
            </div>
            <div className="form-group">
              <label>Repayment Method</label>
              <select
                value={repaymentMethod}
                onChange={e => {
                  setRepaymentMethod(e.target.value as any);
                  calculateTerms();
                }}
              >
                <option value="service_hours">Service Hours</option>
                <option value="cash">Cash</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            {repaymentMethod === 'service_hours' && (
              <div className="form-group">
                <label>Service Hour Rate (Centi/hour)</label>
                <input
                  type="number"
                  value={serviceHourRate}
                  onChange={e => {
                    setServiceHourRate(parseFloat(e.target.value) || 10);
                    calculateTerms();
                  }}
                  min="1"
                  placeholder="10"
                />
              </div>
            )}
            {lendingTerms && (
              <div className="lending-terms-preview">
                <h4>Lending Terms</h4>
                <div className="terms-row">
                  <span>Interest Rate:</span>
                  <strong>{lendingTerms.interestRate.toFixed(1)}%</strong>
                </div>
                <div className="terms-row">
                  <span>Total Repayment:</span>
                  <strong>{lendingTerms.totalRepayment.toFixed(2)} Centi</strong>
                </div>
                {lendingTerms.serviceHoursRequired && (
                  <div className="terms-row">
                    <span>Service Hours Required:</span>
                    <strong>{lendingTerms.serviceHoursRequired} hours</strong>
                  </div>
                )}
                <div className="terms-row">
                  <span>Due Date:</span>
                  <strong>{format(lendingTerms.dueDate, 'MMM dd, yyyy')}</strong>
                </div>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowBorrowModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleBorrow} disabled={!lendingTerms}>
                Borrow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


