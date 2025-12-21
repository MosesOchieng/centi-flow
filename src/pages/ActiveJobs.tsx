import { useState, useEffect } from 'react';
import { useMarketplaceStore } from '@/store/marketplaceStore';
import { useAuthStore } from '@/store/authStore';
import { useServiceHourStore } from '@/store/serviceHourStore';
import { useReputationStore } from '@/store/reputationStore';
import { getServiceCategories } from '@/utils/adminRules';
import './ActiveJobs.css';

export default function ActiveJobs() {
  const { services, serviceRequests, categories } = useMarketplaceStore();
  const { currentBusiness } = useAuthStore();
  const { hours } = useServiceHourStore();
  const { getReputation } = useReputationStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Industries based on service categories
  const industries = [
    { id: 'creative', name: 'Creative Services', categories: ['graphic-design', 'marketing-strategy'] },
    { id: 'tech', name: 'Technology', categories: ['web-development'] },
    { id: 'professional', name: 'Professional Services', categories: ['legal-review', 'accounting'] },
    { id: 'all', name: 'All Industries', categories: [] }
  ];

  // Get active jobs (services that are available or in progress)
  const activeJobs = services.filter(service => 
    service.status === 'available' || service.status === 'in_progress'
  );

  // Filter jobs
  const filteredJobs = activeJobs.filter(job => {
    // Category filter
    if (selectedCategory && job.categoryId !== selectedCategory) {
      return false;
    }

    // Industry filter
    if (selectedIndustry && selectedIndustry !== 'all') {
      const industry = industries.find(i => i.id === selectedIndustry);
      if (industry && !industry.categories.includes(job.categoryId)) {
        return false;
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const category = categories.find(c => c.id === job.categoryId);
      if (!job.title.toLowerCase().includes(query) &&
          !job.description.toLowerCase().includes(query) &&
          !category?.name.toLowerCase().includes(query)) {
        return false;
      }
    }

    return true;
  });

  // Get provider info
  const getProviderInfo = (providerId: string) => {
    const providerHours = hours
      .filter(h => h.businessId === providerId && h.type === 'earned' && h.status === 'verified')
      .reduce((sum, h) => sum + h.hours, 0);
    
    const reputation = getReputation(providerId);
    
    return {
      earnedHours: providerHours,
      rating: reputation?.averageRating || 0,
      totalJobs: reputation?.totalJobsCompleted || 0
    };
  };

  return (
    <div className="active-jobs-page">
      <div className="page-header">
        <h1>Active Jobs</h1>
        <p className="subtitle">Find and participate in available service opportunities</p>
      </div>

      {/* Filters */}
      <div className="jobs-filters">
        <div className="filter-group">
          <label>Industry</label>
          <div className="filter-buttons">
            {industries.map(industry => (
              <button
                key={industry.id}
                className={`filter-btn ${selectedIndustry === industry.id ? 'active' : ''}`}
                onClick={() => setSelectedIndustry(industry.id)}
              >
                {industry.name}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Category</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="search-group">
          <input
            type="text"
            className="search-input"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="jobs-grid">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => {
            const category = categories.find(c => c.id === job.categoryId);
            const providerInfo = getProviderInfo(job.providerId);
            const isOwnJob = currentBusiness?.id === job.providerId;

            return (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <div>
                    <h3>{job.title}</h3>
                    <p className="job-category">{category?.name}</p>
                  </div>
                  <div className="job-cost">
                    <span className="cost-amount">{job.centiCost} Centi</span>
                    <span className="cost-hours">~{job.estimatedHours} hrs</span>
                  </div>
                </div>

                <p className="job-description">
                  {job.description || 'No description provided.'}
                </p>

                <div className="job-provider-info">
                  <div className="provider-stats">
                    {providerInfo.earnedHours > 0 && (
                      <span className="stat-badge">
                        ✓ {providerInfo.earnedHours} verified hours
                      </span>
                    )}
                    {providerInfo.rating > 0 && (
                      <span className="stat-badge">
                        ⭐ {providerInfo.rating.toFixed(1)} rating
                      </span>
                    )}
                    {providerInfo.totalJobs > 0 && (
                      <span className="stat-badge">
                        📊 {providerInfo.totalJobs} jobs completed
                      </span>
                    )}
                  </div>
                </div>

                <div className="job-footer">
                  <div className="job-status">
                    <span className={`status-badge status-${job.status}`}>
                      {job.status === 'available' ? 'Available' : 'In Progress'}
                    </span>
                  </div>
                  {!isOwnJob && (
                    <button className="btn-apply-job">
                      View Details
                    </button>
                  )}
                  {isOwnJob && (
                    <span className="own-job-label">Your Job</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <p>No active jobs found matching your filters.</p>
            <p className="empty-hint">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="jobs-stats">
        <div className="stat-card">
          <span className="stat-value">{filteredJobs.length}</span>
          <span className="stat-label">Active Jobs</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {filteredJobs.reduce((sum, job) => sum + job.centiCost, 0)}
          </span>
          <span className="stat-label">Total Centi Available</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {filteredJobs.reduce((sum, job) => sum + job.estimatedHours, 0)}
          </span>
          <span className="stat-label">Total Hours</span>
        </div>
      </div>
    </div>
  );
}

