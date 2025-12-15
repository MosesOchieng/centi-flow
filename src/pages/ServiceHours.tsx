import { useServiceHourStore } from '@/store/serviceHourStore';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import './ServiceHours.css';

export default function ServiceHours() {
  const { hours, getTotalHours } = useServiceHourStore();
  const { currentBusiness } = useAuthStore();

  if (!currentBusiness) return null;

  const totals = getTotalHours(currentBusiness.id);
  const businessHours = hours.filter(h => h.businessId === currentBusiness.id);

  const earnedHours = businessHours.filter(h => h.type === 'earned');
  const owedHours = businessHours.filter(h => h.type === 'owed');
  const committedHours = businessHours.filter(h => h.type === 'committed');

  return (
    <div className="service-hours-page">
      <div className="page-header">
        <h1>Service Hour Ledger</h1>
        <p className="subtitle">Track your earned, owed, and committed service hours</p>
      </div>

      {/* Summary Cards */}
      <div className="hours-summary">
        <div className="summary-card earned">
          <div className="summary-label">Hours Earned</div>
          <div className="summary-value">{totals.earned}</div>
          <div className="summary-description">Verified service hours delivered</div>
        </div>
        <div className="summary-card owed">
          <div className="summary-label">Hours Owed</div>
          <div className="summary-value">{totals.owed}</div>
          <div className="summary-description">Service hours to be delivered</div>
        </div>
        <div className="summary-card committed">
          <div className="summary-label">Hours Committed</div>
          <div className="summary-value">{totals.committed}</div>
          <div className="summary-description">Future service commitments</div>
        </div>
      </div>

      {/* Earned Hours */}
      <div className="section">
        <h2>Earned Hours</h2>
        {earnedHours.length > 0 ? (
          <div className="hours-list">
            {earnedHours.map(hour => (
              <div key={hour.id} className="hour-item">
                <div className="hour-header">
                  <span className="hour-amount">{hour.hours} hours</span>
                  <span className={`hour-status ${hour.status}`}>{hour.status}</span>
                </div>
                <div className="hour-details">
                  <div>Service Request: {hour.serviceRequestId}</div>
                  <div>Recorded: {format(hour.createdAt, 'MMM dd, yyyy')}</div>
                  {hour.verifiedAt && (
                    <div>Verified: {format(hour.verifiedAt, 'MMM dd, yyyy')}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No earned hours yet</p>
        )}
      </div>

      {/* Owed Hours */}
      <div className="section">
        <h2>Owed Hours</h2>
        {owedHours.length > 0 ? (
          <div className="hours-list">
            {owedHours.map(hour => (
              <div key={hour.id} className="hour-item">
                <div className="hour-header">
                  <span className="hour-amount">{hour.hours} hours</span>
                  <span className={`hour-status ${hour.status}`}>{hour.status}</span>
                </div>
                <div className="hour-details">
                  <div>Service Request: {hour.serviceRequestId}</div>
                  <div>Due: {hour.expiresAt ? format(hour.expiresAt, 'MMM dd, yyyy') : 'Not set'}</div>
                  <div>Recorded: {format(hour.createdAt, 'MMM dd, yyyy')}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No owed hours</p>
        )}
      </div>

      {/* Committed Hours */}
      <div className="section">
        <h2>Committed Hours</h2>
        {committedHours.length > 0 ? (
          <div className="hours-list">
            {committedHours.map(hour => (
              <div key={hour.id} className="hour-item">
                <div className="hour-header">
                  <span className="hour-amount">{hour.hours} hours</span>
                  <span className={`hour-status ${hour.status}`}>{hour.status}</span>
                </div>
                <div className="hour-details">
                  <div>Service Request: {hour.serviceRequestId}</div>
                  <div>Delivery Date: {hour.expiresAt ? format(hour.expiresAt, 'MMM dd, yyyy') : 'Not set'}</div>
                  <div>Committed: {format(hour.createdAt, 'MMM dd, yyyy')}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No committed hours</p>
        )}
      </div>
    </div>
  );
}


