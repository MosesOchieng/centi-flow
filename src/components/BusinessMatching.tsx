import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMarketplaceStore } from '@/store/marketplaceStore';
import { useReputationStore } from '@/store/reputationStore';
import { BusinessMatchingEngine, type Match } from '@/utils/businessMatching';
import './BusinessMatching.css';

export default function BusinessMatching() {
  const { currentBusiness } = useAuthStore();
  const { services, serviceRequests } = useMarketplaceStore();
  const { reputations } = useReputationStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!currentBusiness) return;

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

    // Start matching engine
    setIsRunning(true);
    matchingEngine.start(
      [currentBusiness],
      serviceRequests,
      services,
      simpleReputations,
      30000 // Run every 30 seconds
    );

    return () => {
      matchingEngine.stop();
      setIsRunning(false);
    };
  }, [currentBusiness, services, serviceRequests, reputations]);

  if (!isRunning || matches.length === 0) {
    return null;
  }

  return (
    <div className="business-matching">
      <div className="matching-header">
        <h3>🤖 AI Business Matches</h3>
        <span className="matching-badge">{matches.length} matches</span>
      </div>

      <div className="matches-list">
        {matches.slice(0, 5).map((match, index) => (
          <div key={index} className="match-card">
            <div className="match-score">
              <span className="score-value">{match.matchScore}%</span>
              <span className="score-label">Match</span>
            </div>
            <div className="match-content">
              <p className="match-reason">{match.reason}</p>
              <div className="match-details">
                <span>Cost: {match.estimatedCost} Centi</span>
                <span>Hours: {match.estimatedHours}</span>
              </div>
            </div>
            <button className="btn-view-match">View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}

