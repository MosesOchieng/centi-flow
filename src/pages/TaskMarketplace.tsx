import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import type { MicroTask } from '@/types/tasks';
import './TaskMarketplace.css';

export default function TaskMarketplace() {
  const { currentBusiness } = useAuthStore();
  const { addCenti, spendCenti, getAvailableBalance } = useWalletStore();
  const [tasks, setTasks] = useState<MicroTask[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'other' as MicroTask['category'],
    centiReward: 0,
    estimatedTime: 0,
    difficulty: 'easy' as MicroTask['difficulty']
  });

  const handleCreateTask = () => {
    if (!currentBusiness || !newTask.title || newTask.centiReward <= 0) return;

    const available = getAvailableBalance();
    if (available < newTask.centiReward) {
      alert('Insufficient Centi balance to post this task');
      return;
    }

    // Lock the Centi reward
    if (spendCenti(newTask.centiReward, `Task reward: ${newTask.title}`)) {
      const task: MicroTask = {
        id: `task-${Date.now()}`,
        businessId: currentBusiness.id,
        ...newTask,
        status: 'open',
        currentAssignments: 0,
        createdAt: new Date()
      };

      setTasks([...tasks, task]);
      setShowCreateModal(false);
      setNewTask({ title: '', description: '', category: 'other', centiReward: 0, estimatedTime: 0, difficulty: 'easy' });
    }
  };

  const handleClaimTask = (task: MicroTask) => {
    if (!currentBusiness) return;

    // Check if task can accept more assignments
    if (task.maxAssignments && task.currentAssignments >= task.maxAssignments) {
      alert('This task has reached maximum assignments');
      return;
    }

    setTasks(tasks.map(t =>
      t.id === task.id
        ? { ...t, status: 'in_progress', currentAssignments: t.currentAssignments + 1 }
        : t
    ));
  };

  const handleCompleteTask = (task: MicroTask) => {
    if (!currentBusiness) return;

    // Award Centi to worker
    addCenti(task.centiReward, 'earn', `Completed task: ${task.title}`);
    
    setTasks(tasks.map(t =>
      t.id === task.id ? { ...t, status: 'completed' } : t
    ));
  };

  const getDifficultyColor = (difficulty: MicroTask['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div className="task-marketplace-page">
      <div className="page-header">
        <h1>📋 Task Marketplace</h1>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Post Task
        </button>
      </div>

      <div className="tasks-intro">
        <p>Post micro-tasks or complete tasks posted by others to earn Centi. Perfect for quick work like data entry, research, design tweaks, or translations.</p>
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
                {task.maxAssignments && (
                  <span>👥 {task.currentAssignments}/{task.maxAssignments}</span>
                )}
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

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
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
                  placeholder="Centi amount"
                />
              </div>
              <div className="form-group">
                <label>Estimated Time (min) *</label>
                <input
                  type="number"
                  value={newTask.estimatedTime}
                  onChange={e => setNewTask({ ...newTask, estimatedTime: parseFloat(e.target.value) || 0 })}
                  min="1"
                  placeholder="Minutes"
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
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCreateTask}>
                Post Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

