import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useMarketplaceStore } from '@/store/marketplaceStore';
import { useReputationStore } from '@/store/reputationStore';
import { useServiceHourStore } from '@/store/serviceHourStore';
import { BusinessMatchingEngine, type Match } from '@/utils/businessMatching';
import './BusinessMatching.css';

export default function BusinessMatching() {
  const { currentBusiness } = useAuthStore();
  const { services, serviceRequests } = useMarketplaceStore();
  const { reputations } = useReputationStore();
  const { hours, getHoursEarned } = useServiceHourStore();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (!currentBusiness) return;

    // Build map of earned service hours per business
    const serviceHoursMap = new Map<string, number>();
    hours.forEach(hour => {
      if (hour.type === 'earned' && hour.status === 'verified') {
        const current = serviceHoursMap.get(hour.businessId) || 0;
        serviceHoursMap.set(hour.businessId, current + hour.hours);
      }
    });

    const matchingEngine = new BusinessMatchingEngine((newMatches) => {
      // Filter matches relevant to current business
      const relevantMatches = newMatches.filter(
        m => m.requesterId === currentBusiness.id || m.providerId === currentBusiness.id
      );
      setMatches(relevantMatches);
    });

    // Map full reputation objects to the simple shape expected by the matching engine
    const simpleReputations = new Map(
      Array.from(reputations.entries()).map(([businessId, rep]) => [
        businessId,
        {
          rating: rep.averageRating,
          totalJobs: rep.totalJobsCompleted
        }
      ])
    );

    // Start matching engine with service hours data
    setIsRunning(true);
    matchingEngine.start(
      [currentBusiness],
      serviceRequests,
      services,
      simpleReputations,
      30000, // Run every 30 seconds
      serviceHoursMap
    );

    return () => {
      matchingEngine.stop();
      setIsRunning(false);
    };
  }, [currentBusiness, services, serviceRequests, reputations, hours]);

  const handleViewMatch = (match: Match) => {
    setSelectedMatch(match);
  };

  const handleAcceptMatch = (match: Match) => {
    // Navigate to marketplace and try to find/create the service
    navigate('/marketplace', { state: { match } });
    setSelectedMatch(null);
  };

  if (!isRunning || matches.length === 0) {
    return null;
  }

  return (
    <>
      <div className="business-matching">
        <div className="matching-header">
          <h3>🤖 AI Business Matches</h3>
          <span className="matching-badge">{matches.length} matches</span>
        </div>

        <div className="matches-list">
          {matches.slice(0, 5).map((match, index) => {
            const isRequester = match.requesterId === currentBusiness?.id;
            const isProvider = match.providerId === currentBusiness?.id;
            
            return (
              <div key={index} className="match-card">
                <div className="match-score">
                  <span className="score-value">{match.matchScore}%</span>
                  <span className="score-label">Match</span>
                </div>
                <div className="match-content">
                  <p className="match-reason">{match.reason}</p>
                  <div className="match-details">
                    <span>Cost: {match.estimatedCost.toFixed(2)} Centi</span>
                    <span>Hours: {match.estimatedHours}</span>
                  </div>
                  <div className="match-role">
                    {isRequester && <span className="role-badge">You need this</span>}
                    {isProvider && <span className="role-badge provider">You can provide</span>}
                  </div>
                </div>
                <button 
                  className="btn-view-match"
                  onClick={() => handleViewMatch(match)}
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <div className="modal-overlay" onClick={() => setSelectedMatch(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Business Match Details</h2>
            <div className="match-detail-section">
              <div className="match-score-large">
                <span className="score-value-large">{selectedMatch.matchScore}%</span>
                <span className="score-label">Match Score</span>
              </div>
              <p className="match-reason-large">{selectedMatch.reason}</p>
            </div>
            
            <div className="match-detail-section">
              <h3>Service Details</h3>
              <ul className="match-details-list">
                <li><strong>Estimated Hours:</strong> {selectedMatch.estimatedHours} hours</li>
                <li><strong>Estimated Cost:</strong> {selectedMatch.estimatedCost.toFixed(2)} Centi</li>
                <li><strong>Category:</strong> {selectedMatch.categoryId}</li>
              </ul>
            </div>

            <div className="match-detail-section">
              <h3>Your Role</h3>
              {selectedMatch.requesterId === currentBusiness?.id ? (
                <p>You are looking for this service. A provider has been matched to your need.</p>
              ) : (
                <p>You can provide this service. A business needs what you offer.</p>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setSelectedMatch(null)}
              >
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => handleAcceptMatch(selectedMatch)}
              >
                Go to Marketplace
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

