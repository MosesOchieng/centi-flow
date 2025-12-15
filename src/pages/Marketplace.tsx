import { useState, useEffect } from 'react';
import { useMarketplaceStore } from '@/store/marketplaceStore';
import { useWalletStore } from '@/store/walletStore';
import { useAuthStore } from '@/store/authStore';
import { useActivityStore } from '@/store/activityStore';
import { useReputationStore } from '@/store/reputationStore';
import { useServiceHourStore } from '@/store/serviceHourStore';
import { getServiceCategories } from '@/utils/adminRules';
import { adjustCentiByReputation } from '@/utils/centiInflation';
import LoadingPopup from '@/components/LoadingPopup';
import type { MicroTask } from '@/types/tasks';
import type { BarterListing } from '@/types/barter';
import type { ServiceRequest } from '@/types';
import './Marketplace.css';

export default function Marketplace() {
  const {
    services,
    serviceRequests,
    categories,
    selectedCategory,
    searchQuery,
    loadServices,
    createService,
    requestService,
    acceptServiceRequest,
    completeService,
    cancelService,
    setCategoryFilter,
    setSearchQuery,
    getFilteredServices
  } = useMarketplaceStore();
  const { getAvailableBalance, spendCenti, addCenti } = useWalletStore();
  const { currentBusiness } = useAuthStore();
  const { addActivity } = useActivityStore();
  const { getReputation } = useReputationStore();
  const { hours, verifyHours } = useServiceHourStore();

  const [activeTab, setActiveTab] = useState<'services' | 'tasks' | 'barter'>('services');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    categoryId: '',
    estimatedHours: 0
  });
  const [tasks, setTasks] = useState<MicroTask[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'other' as MicroTask['category'],
    centiReward: 0,
    estimatedTime: 0,
    difficulty: 'easy' as MicroTask['difficulty']
  });
  const [listings, setListings] = useState<BarterListing[]>([]);
  const [showBarterModal, setShowBarterModal] = useState(false);
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    category: 'other' as BarterListing['category'],
    centiValue: 0,
    location: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('Processing...');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    loadServices();
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [loadServices]);

  const handleRequestService = async (serviceId: string) => {
    if (!currentBusiness) return;

    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const available = getAvailableBalance();
    if (available < service.centiCost) {
      alert('Insufficient Centi balance. Consider borrowing Centi.');
      return;
    }

    setIsProcessing(true);
    setProcessingMessage('Requesting service...');
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (spendCenti(service.centiCost, `Requested service: ${service.title}`, serviceId)) {
      const req = requestService(serviceId, currentBusiness.id);
      addActivity({
        businessId: currentBusiness.id,
        type: 'centi_spent',
        title: 'Service Requested',
        description: `Requested ${service.title} for ${service.centiCost} Centi`,
        metadata: { requestId: req?.id, serviceId }
      });
      setIsProcessing(false);
      alert('Service requested successfully!');
    } else {
      setIsProcessing(false);
    }
  };

  const handleCreateService = async () => {
    if (!currentBusiness || !newService.title || !newService.categoryId) {
      alert('Please fill in all required fields');
      return;
    }

    // Enforce standard hours from category to avoid manipulation
    const category = categories.find(c => c.id === newService.categoryId);
    const standardHours = (category?.standardHours ?? newService.estimatedHours) || 1;
    const servicePayload = {
      ...newService,
      estimatedHours: standardHours
    };

    setIsProcessing(true);
    setProcessingMessage('Creating service listing...');
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const service = createService({
        providerId: currentBusiness.id,
        ...servicePayload
      });
      addActivity({
        businessId: currentBusiness.id,
        type: 'service_completed',
        title: 'Service Created',
        description: `Created service: ${service.title}`
      });
      setIsProcessing(false);
      setShowCreateModal(false);
      setNewService({ title: '', description: '', categoryId: '', estimatedHours: 0 });
    } catch (error) {
      setIsProcessing(false);
      alert('Failed to create service');
    }
  };

  const handleCreateTask = async () => {
    if (!currentBusiness || !newTask.title || newTask.centiReward <= 0) return;

    const available = getAvailableBalance();
    if (available < newTask.centiReward) {
      alert('Insufficient Centi balance to post this task');
      return;
    }

    setIsProcessing(true);
    setProcessingMessage('Posting task...');
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (spendCenti(newTask.centiReward, `Task reward: ${newTask.title}`)) {
      const task: MicroTask = {
        id: `task-${Date.now()}`,
        businessId: currentBusiness.id,
        ...newTask,
        status: 'open',
        currentAssignments: 0
      };

      setTasks([...tasks, task]);
      setIsProcessing(false);
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', category: 'other', centiReward: 0, estimatedTime: 0, difficulty: 'easy' });
    } else {
      setIsProcessing(false);
    }
  };

  const handleClaimTask = async (task: MicroTask) => {
    if (!currentBusiness) return;
    if (task.maxAssignments && task.currentAssignments >= task.maxAssignments) {
      alert('This task has reached maximum assignments');
      return;
    }

    setIsProcessing(true);
    setProcessingMessage('Claiming task...');
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    setTasks(tasks.map(t =>
      t.id === task.id
        ? { ...t, status: 'in_progress', currentAssignments: t.currentAssignments + 1 }
        : t
    ));
    setIsProcessing(false);
  };

  const handleCompleteTask = async (task: MicroTask) => {
    if (!currentBusiness) return;
    
    setIsProcessing(true);
    setProcessingMessage('Completing task...');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Apply inflation based on task creator's reputation
    const creatorReputation = getReputation(task.businessId);
    const adjustedAmount = adjustCentiByReputation(task.centiReward, creatorReputation);
    
    addCenti(adjustedAmount, 'earn', `Completed task: ${task.title}`);
    
    setTasks(tasks.map(t =>
      t.id === task.id ? { ...t, status: 'completed' } : t
    ));
    setIsProcessing(false);
  };

  const handleCreateListing = async () => {
    if (!currentBusiness || !newListing.title) return;

    setIsProcessing(true);
    setProcessingMessage('Creating barter listing...');
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    const listing: BarterListing = {
      id: `barter-${Date.now()}`,
      businessId: currentBusiness.id,
      ...newListing,
      availability: 'available',
      createdAt: new Date()
    };

    setListings([...listings, listing]);
    setIsProcessing(false);
    setShowBarterModal(false);
    setNewListing({ title: '', description: '', category: 'other', centiValue: 0, location: '' });
  };

  const handleClaimListing = async (listing: BarterListing) => {
    if (!currentBusiness) return;

    setIsProcessing(true);
    setProcessingMessage('Claiming barter listing...');
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Apply inflation based on provider's reputation
    const providerReputation = getReputation(listing.businessId);
    const adjustedAmount = adjustCentiByReputation(listing.centiValue, providerReputation);
    
    addCenti(adjustedAmount, 'earn', `Barter: ${listing.title}`);
    
    setListings(listings.map(l => 
      l.id === listing.id ? { ...l, availability: 'in_use' } : l
    ));
    setIsProcessing(false);
  };

  const getDifficultyColor = (difficulty: MicroTask['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#64748b';
    }
  };

  const filteredServices = getFilteredServices();

  const getRequestsForRole = (role: 'provider' | 'requester'): ServiceRequest[] => {
    if (!currentBusiness) return [];
    return serviceRequests.filter(req => {
      const service = services.find(s => s.id === req.serviceId);
      if (!service) return false;
      return role === 'provider'
        ? service.providerId === currentBusiness.id
        : req.requesterId === currentBusiness.id;
    });
  };

  const providerRequests = getRequestsForRole('provider');
  const requesterRequests = getRequestsForRole('requester');

  const findEarnedHourIdForRequest = (requestId: string): string | null => {
    const hour = hours.find(
      h => h.serviceRequestId === requestId && h.type === 'earned' && h.status === 'pending'
    );
    return hour ? hour.id : null;
  };

  return (
    <div className="marketplace-page">
      <LoadingPopup show={isLoading || isProcessing} message={isProcessing ? processingMessage : "Loading marketplace..."} />
      
      <div className="page-header">
        <h1>Marketplace</h1>
      </div>

      {/* Tabs */}
      <div className="marketplace-tabs">
        <button
          className={`tab ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          🛒 Services
        </button>
        <button
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          📋 Tasks
        </button>
        <button
          className={`tab ${activeTab === 'barter' ? 'active' : ''}`}
          onClick={() => setActiveTab('barter')}
        >
          🔄 Barter
        </button>
      </div>

      {/* Services Tab - offer + discover + track service pipeline */}
      {activeTab === 'services' && (
        <>
          <div className="tab-header">
            <h2>Offer & Request Services</h2>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              Offer Service
            </button>
          </div>
          <p className="subtitle">
            Stand up clear service packages, discover offers from other businesses, and track each request
            from pending to completed with Centi and service hours handled for you.
          </p>

          {/* Filters + services grid */}
          <div className="marketplace-filters">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Search services by title or description…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="category-filters">
              <button
                className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
                onClick={() => setCategoryFilter(null)}
              >
                All service types
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="services-grid">
            {filteredServices.length > 0 ? (
              filteredServices.map(service => {
                const category = categories.find(c => c.id === service.categoryId);
                const isOwnService = currentBusiness?.id === service.providerId;
                const isDisabled = isOwnService;

                return (
                  <div
                    key={service.id}
                    className="service-card"
                    onClick={() => setSelectedServiceId(service.id)}
                  >
                    <div className="service-header">
                      <h3>{service.title}</h3>
                      <div className="service-cost">
                        {service.centiCost} Centi
                      </div>
                    </div>
                    <div className="service-category">
                      {category?.name} · {service.estimatedHours} hrs
                    </div>
                    <p className="service-description">
                      {service.description || 'No description provided yet.'}
                    </p>
                    <div className="service-meta">
                      <span>Status: {service.status}</span>
                      {category && (
                        <span>Base rate: {category.centiPerHour} Centi/hr</span>
                      )}
                    </div>
                    <button
                      className={`btn-service ${isDisabled ? 'disabled' : ''}`}
                      disabled={isDisabled}
                      onClick={e => {
                        e.stopPropagation();
                        if (!isDisabled) {
                          handleRequestService(service.id);
                        }
                      }}
                    >
                      {isOwnService ? 'Your service' : 'Request Service'}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <p>No services published yet. Be the first to offer a service.</p>
              </div>
            )}
          </div>

          {/* Request pipeline */}
          {(providerRequests.length > 0 || requesterRequests.length > 0) && (
            <div className="requests-section">
              <div className="requests-column">
                <h3>Requests for your services</h3>
                {providerRequests.length > 0 ? (
                  <div className="requests-list">
                    {providerRequests.map(req => {
                      const service = services.find(s => s.id === req.serviceId);
                      if (!service) return null;
                      return (
                        <div key={req.id} className="request-card">
                          <div className="request-main">
                            <div>
                              <div className="request-title">{service.title}</div>
                              <div className="request-status">Status: {req.status}</div>
                            </div>
                            <div className="request-amount">{service.centiCost} Centi</div>
                          </div>
                          <div className="request-actions">
                            {req.status === 'pending' && (
                              <>
                                <button
                                  className="btn-secondary"
                                  onClick={() => acceptServiceRequest(req.id, service.providerId)}
                                >
                                  Approve & Start
                                </button>
                                <button
                                  className="btn-tertiary"
                                  onClick={() => cancelService(req.id)}
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            {req.status === 'accepted' && (
                              <button
                                className="btn-primary"
                                onClick={() => completeService(req.id)}
                              >
                                Mark Work Done
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="requests-empty">No one has requested your services yet.</p>
                )}
              </div>

              <div className="requests-column">
                <h3>Requests you&apos;ve made</h3>
                {requesterRequests.length > 0 ? (
                  <div className="requests-list">
                    {requesterRequests.map(req => {
                      const service = services.find(s => s.id === req.serviceId);
                      if (!service) return null;
                      const earnedHourId = findEarnedHourIdForRequest(req.id);
                      const canApprove = req.status === 'completed' && !!earnedHourId;

                      return (
                        <div key={req.id} className="request-card">
                          <div className="request-main">
                            <div>
                              <div className="request-title">{service.title}</div>
                              <div className="request-status">Status: {req.status}</div>
                            </div>
                            <div className="request-amount">{service.centiCost} Centi</div>
                          </div>
                          <div className="request-actions">
                            {canApprove && earnedHourId && (
                              <button
                                className="btn-primary"
                                onClick={() => verifyHours(earnedHourId)}
                              >
                                Approve Hours
                              </button>
                            )}
                            {req.status === 'pending' && (
                              <button
                                className="btn-tertiary"
                                onClick={() => cancelService(req.id)}
                              >
                                Cancel Request
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="requests-empty">You haven&apos;t requested any services yet.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <>
          <div className="tab-header">
            <h2>Task Marketplace</h2>
            <button className="btn-primary" onClick={() => setShowTaskModal(true)}>
              + Post Task
            </button>
          </div>

          <div className="tasks-grid">
            {tasks.length > 0 ? (
              tasks.map(task => (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <span
                      className="difficulty-badge"
                      style={{ backgroundColor: `${getDifficultyColor(task.difficulty)}20`, color: getDifficultyColor(task.difficulty) }}
                    >
                      {task.difficulty}
                    </span>
                  </div>
                  <div className="task-category">{task.category}</div>
                  <p className="task-description">{task.description}</p>
                  <div className="task-meta">
                    <span>⏱️ {task.estimatedTime} min</span>
                    <span>💰 {task.centiReward} Centi</span>
                  </div>
                  <div className="task-footer">
                    <span className={`task-status ${task.status}`}>{task.status}</span>
                    {task.status === 'open' && (
                      <button className="btn-claim-task" onClick={() => handleClaimTask(task)}>
                        Claim Task
                      </button>
                    )}
                    {task.status === 'in_progress' && (
                      <button className="btn-complete-task" onClick={() => handleCompleteTask(task)}>
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No tasks available. Post the first task to get started!</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Barter Tab */}
      {activeTab === 'barter' && (
        <>
          <div className="tab-header">
            <h2>Barter Hub</h2>
            <button className="btn-primary" onClick={() => setShowBarterModal(true)}>
              + List Resource
            </button>
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
                      <button className="btn-claim" onClick={() => handleClaimListing(listing)}>
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
        </>
      )}

      {/* Service Detail Modal */}
      {selectedServiceId && (
        <div className="modal-overlay" onClick={() => setSelectedServiceId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {(() => {
              const service = services.find(s => s.id === selectedServiceId);
              if (!service) return null;
              const category = categories.find(c => c.id === service.categoryId);

              return (
                <>
                  <h2>{service.title}</h2>
                  <p className="modal-subtitle">
                    Package of {service.estimatedHours} hours · {category?.name ?? 'Service type'}
                  </p>
                  <div className="cost-preview">
                    <span>Total value: </span>
                    <strong>{service.centiCost} Centi</strong>
                    {category && (
                      <span> · Base rate {category.centiPerHour} Centi/hr</span>
                    )}
                  </div>
                  <p className="service-description">
                    {service.description ||
                      'This business has not added extra details yet. The package still follows Centi Flow standard rules for hours and pricing.'}
                  </p>
                  <div className="modal-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => setSelectedServiceId(null)}
                    >
                      Close
                    </button>
                    {currentBusiness && currentBusiness.id !== service.providerId && (
                      <button
                        className="btn-primary"
                        onClick={() => {
                          handleRequestService(service.id);
                          setSelectedServiceId(null);
                        }}
                      >
                        Request This Service
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Create Service Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Offer a Service</h2>
            <div className="form-group">
              <label>Service Title *</label>
              <input
                type="text"
                value={newService.title}
                onChange={e => setNewService({ ...newService, title: e.target.value })}
                placeholder="e.g., Website Development"
              />
            </div>
            <div className="form-group">
              <label>Service You Can Offer *</label>
              <select
                value={newService.categoryId}
                onChange={e => {
                  const value = e.target.value;
                  const category = categories.find(c => c.id === value);
                  const standardHours = category?.standardHours ?? 1;
                  setNewService({
                    ...newService,
                    categoryId: value,
                    estimatedHours: standardHours
                  });
                }}
              >
                <option value="">Select service type</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.centiPerHour} Centi/hour)
                  </option>
                ))}
              </select>
              {newService.categoryId && (
                <p className="helper-text">
                  Standard package:{' '}
                  {categories.find(c => c.id === newService.categoryId)?.standardHours ?? 1} hours
                  {' '}(&quot;fixed&quot; to keep hours fair)
                </p>
              )}
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newService.description}
                onChange={e => setNewService({ ...newService, description: e.target.value })}
                rows={4}
                placeholder="Describe your service..."
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCreateService}>
                Create Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Post a Micro-Task</h2>
            <div className="form-group">
              <label>Task Title *</label>
              <input
                type="text"
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g., Data Entry - 100 Records"
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={newTask.category}
                onChange={e => setNewTask({ ...newTask, category: e.target.value as MicroTask['category'] })}
              >
                <option value="data-entry">Data Entry</option>
                <option value="research">Research</option>
                <option value="design">Design</option>
                <option value="writing">Writing</option>
                <option value="translation">Translation</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newTask.description}
                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                rows={4}
                placeholder="Describe the task..."
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Centi Reward *</label>
                <input
                  type="number"
                  value={newTask.centiReward}
                  onChange={e => setNewTask({ ...newTask, centiReward: parseFloat(e.target.value) || 0 })}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Estimated Time (min) *</label>
                <input
                  type="number"
                  value={newTask.estimatedTime}
                  onChange={e => setNewTask({ ...newTask, estimatedTime: parseFloat(e.target.value) || 0 })}
                  min="1"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Difficulty</label>
              <select
                value={newTask.difficulty}
                onChange={e => setNewTask({ ...newTask, difficulty: e.target.value as MicroTask['difficulty'] })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowTaskModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCreateTask}>
                Post Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Barter Modal */}
      {showBarterModal && (
        <div className="modal-overlay" onClick={() => setShowBarterModal(false)}>
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
              <button className="btn-secondary" onClick={() => setShowBarterModal(false)}>
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
