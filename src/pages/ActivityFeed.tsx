import { useActivityStore } from '@/store/activityStore';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import './ActivityFeed.css';

export default function ActivityFeed() {
  const { getActivities } = useActivityStore();
  const { currentBusiness } = useAuthStore();

  const activities = getActivities(currentBusiness?.id, 50);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return '💳';
      case 'service_completed':
        return '✅';
      case 'rating_received':
        return '⭐';
      case 'centi_earned':
        return '➕';
      case 'centi_spent':
        return '➖';
      default:
        return '📋';
    }
  };

  return (
    <div className="activity-feed-page">
      <div className="page-header">
        <h1>Activity Feed</h1>
        <p className="subtitle">Recent activity and transactions</p>
      </div>

      <div className="activity-timeline">
        {activities.length > 0 ? (
          activities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">{getActivityIcon(activity.type)}</div>
              <div className="activity-content">
                <div className="activity-title">{activity.title}</div>
                <div className="activity-description">{activity.description}</div>
                <div className="activity-time">
                  {format(activity.timestamp, 'MMM dd, yyyy HH:mm')}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No activity yet. Start using Centi Flow to see your activity here!</p>
          </div>
        )}
      </div>
    </div>
  );
}


