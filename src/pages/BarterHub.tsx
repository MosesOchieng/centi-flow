import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import type { BarterListing } from '@/types/barter';
import './BarterHub.css';

export default function BarterHub() {
  const { currentBusiness } = useAuthStore();
  const { addCenti } = useWalletStore();
  const [listings, setListings] = useState<BarterListing[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    category: 'other' as BarterListing['category'],
    centiValue: 0,
    location: ''
  });

  const handleCreateListing = () => {
    if (!currentBusiness || !newListing.title) return;

    const listing: BarterListing = {
      id: `barter-${Date.now()}`,
      businessId: currentBusiness.id,
      ...newListing,
      availability: 'available',
      createdAt: new Date()
    };

    setListings([...listings, listing]);
    setShowCreateModal(false);
    setNewListing({ title: '', description: '', category: 'other', centiValue: 0, location: '' });
  };

  const handleClaimListing = (listing: BarterListing) => {
    if (!currentBusiness) return;

    // Earn Centi for the provider
    addCenti(listing.centiValue, 'earn', `Barter: ${listing.title}`);
    
    // Update listing status
    setListings(listings.map(l => 
      l.id === listing.id ? { ...l, availability: 'in_use' } : l
    ));
  };

  return (
    <div className="barter-hub-page">
      <div className="page-header">
        <h1>🔄 Centi Barter Hub</h1>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + List Resource
        </button>
      </div>

      <div className="barter-intro">
        <p>Turn your surplus resources into Centi credits. List storage space, equipment, expertise, or any underutilized assets and earn Centi that you can spend on services you need.</p>
      </div>

      <div className="listings-grid">
        {listings.length > 0 ? (
          listings.map(listing => (
            <div key={listing.id} className="listing-card">
              <div className="listing-header">
                <h3>{listing.title}</h3>
                <span className={`availability-badge ${listing.availability}`}>
                  {listing.availability === 'available' ? 'Available' : 'In Use'}
                </span>
              </div>
              <div className="listing-category">{listing.category}</div>
              <p className="listing-description">{listing.description}</p>
              <div className="listing-footer">
                <div className="listing-value">
                  <span className="value-amount">{listing.centiValue}</span>
                  <span className="value-unit">Centi</span>
                </div>
                {listing.availability === 'available' && (
                  <button 
                    className="btn-claim"
                    onClick={() => handleClaimListing(listing)}
                  >
                    Claim
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No barter listings yet. Be the first to list a resource!</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>List a Resource</h2>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={newListing.title}
                onChange={e => setNewListing({ ...newListing, title: e.target.value })}
                placeholder="e.g., Extra Storage Space"
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={newListing.category}
                onChange={e => setNewListing({ ...newListing, category: e.target.value as BarterListing['category'] })}
              >
                <option value="storage">Storage</option>
                <option value="expertise">Expertise</option>
                <option value="equipment">Equipment</option>
                <option value="space">Space</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newListing.description}
                onChange={e => setNewListing({ ...newListing, description: e.target.value })}
                rows={4}
                placeholder="Describe your resource..."
              />
            </div>
            <div className="form-group">
              <label>Centi Value *</label>
              <input
                type="number"
                value={newListing.centiValue}
                onChange={e => setNewListing({ ...newListing, centiValue: parseFloat(e.target.value) || 0 })}
                min="1"
                placeholder="Estimated Centi value"
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={newListing.location}
                onChange={e => setNewListing({ ...newListing, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCreateListing}>
                Create Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

