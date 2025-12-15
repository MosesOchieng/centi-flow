import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoadingPopup from '@/components/LoadingPopup';
import './Dashboard.css';

type DemoListing = {
  id: string;
  businessName: string;
  serviceName: string;
  category: string;
  hours: number;
  centiReward: number;
  timeAgo: string;
};

const DEMO_LISTINGS: DemoListing[] = [
  {
    id: 'demo-1',
    businessName: 'Lagos Creative Studio',
    serviceName: 'Brand Identity Refresh',
    category: 'Graphic Design',
    hours: 4,
    centiReward: 40,
    timeAgo: 'just now'
  },
  {
    id: 'demo-2',
    businessName: 'Abuja Tech Hub',
    serviceName: 'Landing Page Build',
    category: 'Web Development',
    hours: 8,
    centiReward: 80,
    timeAgo: '2 min ago'
  },
  {
    id: 'demo-3',
    businessName: 'Mombasa Exporters',
    serviceName: 'Export Compliance Review',
    category: 'Legal Review',
    hours: 2,
    centiReward: 30,
    timeAgo: '5 min ago'
  },
  {
    id: 'demo-4',
    businessName: 'Cape Town Crafts',
    serviceName: 'Instagram Launch Campaign',
    category: 'Marketing Strategy',
    hours: 3,
    centiReward: 36,
    timeAgo: '8 min ago'
  },
  {
    id: 'demo-5',
    businessName: 'Accra FinServe',
    serviceName: 'Quarterly Books Cleanup',
    category: 'Accounting',
    hours: 3,
    centiReward: 30,
    timeAgo: '10 min ago'
  }
];

export default function Dashboard() {
  const { currentBusiness, completeKyc } = useAuthStore();
  const navigate = useNavigate();

  const [offset, setOffset] = useState(0);
  const [isParticipating, setIsParticipating] = useState(false);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const touchStartXRef = useRef<number | null>(null);
  const [selectedListing, setSelectedListing] = useState<DemoListing | null>(null);
  const [kycStatus, setKycStatus] = useState<'incomplete' | 'pending' | 'approved'>('incomplete');
  const [showKycBanner, setShowKycBanner] = useState(false);

  useEffect(() => {
    if (!currentBusiness) return;

    if (currentBusiness.verified) {
      setKycStatus('approved');
      setShowKycBanner(true);
      const timer = setTimeout(() => setShowKycBanner(false), 2500);
      return () => clearTimeout(timer);
    } else {
      setKycStatus('incomplete');
      setShowKycBanner(true);
    }
  }, [currentBusiness]);

  const needsKyc = !currentBusiness?.verified;

  const handleCompleteKyc = async () => {
    setKycStatus('pending');
    await completeKyc();
  };

  // Rotate the demo data feed every 60 seconds
  useEffect(() => {
    if (DEMO_LISTINGS.length <= 3) return;
    const interval = setInterval(() => {
      setOffset(prev => (prev + 1) % DEMO_LISTINGS.length);
    }, 60_000); // 1 minute
    return () => clearInterval(interval);
  }, []);

  const visibleListings: DemoListing[] = (() => {
    const available = DEMO_LISTINGS.filter(l => !hiddenIds.includes(l.id));
    if (available.length <= 3) return available;
    const result: DemoListing[] = [];
    for (let i = 0; i < 3; i += 1) {
      const idx = (offset + i) % available.length;
      result.push(available[idx]);
    }
    return result;
  })();

  const handleParticipate = async () => {
    setIsParticipating(true);
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsParticipating(false);
    navigate('/marketplace');
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (listingId: string, e: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    if (startX == null) return;
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;

    if (deltaX < -40) {
      // swipe left → show actions
      setSwipedId(listingId);
    } else if (deltaX > 40) {
      // swipe right → hide actions
      setSwipedId(prev => (prev === listingId ? null : prev));
    }

    touchStartXRef.current = null;
  };

  const hideListing = (listingId: string) => {
    setHiddenIds(prev => (prev.includes(listingId) ? prev : [...prev, listingId]));
    setSwipedId(prev => (prev === listingId ? null : prev));
  };

  return (
    <div className="dashboard">
      <LoadingPopup show={isParticipating} message="Processing participation request..." />
      
      <div className="dashboard-header">
        <h1>Welcome back, {currentBusiness?.name}</h1>
        <p className="subtitle">Businesses you could advise or support right now</p>
      </div>

      {showKycBanner && (
        <div
          className={`kyc-banner kyc-${kycStatus}`}
          onClick={kycStatus === 'incomplete' ? handleCompleteKyc : undefined}
        >
          <div className="kyc-text">
            <h2>Complete your business KYC</h2>
            <p>
              Before you can offer services directly from this feed, we need a quick KYC on your
              business so other businesses know who they&apos;re working with.
            </p>
            <p className={`kyc-status kyc-${kycStatus}`}>
              {kycStatus === 'incomplete' && 'KYC status: Incomplete'}
              {kycStatus === 'pending' && 'KYC status: Submitted · Under review'}
              {kycStatus === 'approved' && 'KYC status: Approved'}
            </p>
          </div>
        </div>
      )}
      <div className="dashboard-grid">
        {/* Marketplace Listings Only */}
        <div className="dashboard-card marketplace-card">
          <div className="card-header">
            <h2>🛒 Businesses Needing Services</h2>
            <button 
              className="btn-link"
              onClick={() => navigate('/marketplace')}
              style={{ fontSize: '0.875rem', color: '#22c55e' }}
            >
              View All →
            </button>
          </div>
          <div className="card-content">
            {visibleListings.length > 0 ? (
              <>
                <div className="marketplace-listings">
                  {visibleListings.map(listing => {
                    const earnings = listing.centiReward;
                    const tier =
                      earnings >= 70 ? 'listing-item-high' : earnings >= 40 ? 'listing-item-medium' : 'listing-item-normal';

                    return (
                      <div
                        key={listing.id}
                        className={`listing-item ${tier} ${swipedId === listing.id ? 'listing-item-swiped' : ''}`}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={e => handleTouchEnd(listing.id, e)}
                        onMouseLeave={() => setSwipedId(prev => (prev === listing.id ? null : prev))}
                      >
                        <div className="listing-header">
                          <div className="listing-title-block">
                            <h4>{listing.serviceName}</h4>
                            <p className="listing-business">{listing.businessName}</p>
                          </div>
                          <div className="listing-badge">
                            <span className="listing-amount">{earnings} Centi</span>
                            <span className="listing-time">{listing.timeAgo}</span>
                          </div>
                        </div>
                        <div className="listing-meta-row">
                          <span>{listing.category}</span>
                          <span>≈ {listing.hours} hrs</span>
                        </div>
                        <div className="listing-footer">
                          <button
                            className="btn-participate"
                            onClick={() => {
                              if (needsKyc) {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                return;
                              }
                              setSelectedListing(listing);
                            }}
                            disabled={needsKyc}
                          >
                            {needsKyc ? 'Complete KYC to offer' : 'View details &amp; offer'}
                          </button>
                        </div>
                        {swipedId === listing.id && (
                          <div className="listing-actions">
                            <button
                              className="btn-action btn-cancel"
                              onClick={() => hideListing(listing.id)}
                            >
                              Dismiss
                            </button>
                            <button
                              className="btn-action btn-archive"
                              onClick={() => hideListing(listing.id)}
                            >
                              Hide similar
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>No services available at the moment</p>
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/marketplace')}
                  style={{ marginTop: '1rem' }}
                >
                  Browse Marketplace
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedListing && (
        <div className="modal-overlay" onClick={() => setSelectedListing(null)}>
          <div className="modal-content small" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-business">
                <img
                  src="/1735912600698.jpeg"
                  alt={selectedListing.businessName}
                  className="modal-business-logo"
                />
                <div>
                  <h2>{selectedListing.serviceName}</h2>
                  <p className="modal-subtitle">{selectedListing.businessName}</p>
                </div>
              </div>
              <div className="modal-amount-chip">
                <span className="amount-icon">💰</span>
                <span className="amount-value">{selectedListing.centiReward} Centi</span>
              </div>
            </div>
            <ul className="modal-details">
              <li><strong>Engagement type:</strong> One-off advisory engagement</li>
              <li><strong>Category:</strong> {selectedListing.category}</li>
              <li><strong>Estimated effort:</strong> {selectedListing.hours} hours (Centi standard hours)</li>
            </ul>
            <div className="modal-section">
              <h3>Scope & deliverables</h3>
              <p>
                You&apos;ll agree the exact scope with the business in the marketplace, but this request
                is framed as a standard package under the Centi rules – hours and Centi value are fixed so
                both sides have a clear baseline.
              </p>
            </div>
            <div className="modal-section">
              <h3>Contract terms</h3>
              <ul className="modal-bullets">
                <li>Work must be delivered within the agreed window or re-negotiated in the app.</li>
                <li>Centi is only released once the requesting business approves the delivered work.</li>
                <li>Disputes can be escalated through the Centi Flow reputation and admin rules.</li>
              </ul>
            </div>
            <div className="modal-section">
              <h3>NDA</h3>
              <p className="modal-nda-link">
                Review NDA document:&nbsp;
                <a
                  href="/documents/centi-flow-nda-template.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open NDA document
                </a>
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setSelectedListing(null)}
              >
                Close
              </button>
              <button
                className="btn-primary"
                onClick={handleParticipate}
              >
                Go to Offer Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


