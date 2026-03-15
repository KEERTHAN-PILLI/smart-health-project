import React, { useState, useEffect } from 'react';
import { Target, CheckCircle, TrendingUp, AlertCircle, Plus } from 'lucide-react';

export default function GoalTracking() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goalType: 'Weight Loss',
    targetValue: '',
    currentValue: '',
    unit: 'kg'
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/analytics/goals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/analytics/goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newGoal)
      });
      if (response.ok) {
        fetchGoals();
        setShowAddForm(false);
        setNewGoal({ goalType: 'Weight Loss', targetValue: '', currentValue: '', unit: 'kg' });
      }
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const calculateProgress = (current, target, type) => {
    let percentage = 0;
    if (type === 'Weight Loss') {
      // Assuming currentValue > targetValue. For example, current 80, target 70.
      if (current <= target) return 100;
      // Without initial weight, just a rough indicator:
      percentage = (target / current) * 100;
      return Math.min(percentage, 100);
    } else {
      percentage = (current / target) * 100;
    }
    return Math.min(percentage, 100);
  };

  // Color-coded alerts based on progress
  const getProgressColor = (percent) => {
    if (percent >= 100) return '#10b981'; // green / success
    if (percent >= 50) return '#3b82f6'; // blue / active
    return '#f59e0b'; // orange / warning
  };

  if (loading) return <div className="page-content user-bg"><p style={{textAlign:'center', marginTop:'50px'}}>Loading Goals...</p></div>;

  return (
    <div className="section" style={{ paddingBottom: '30px' }}>
      <div className="section-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target color="#3b82f6" />
          <span>Goal Progress Tracking</span>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="modern-btn primary" 
          style={{ width: 'auto', padding: '8px 16px', fontSize: '14px' }}
        >
          {showAddForm ? 'Cancel' : <><Plus size={16}/> Add Goal</>}
        </button>
      </div>

      {showAddForm && (
        <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>New Goal</h3>
          <form className="form-row" onSubmit={handleAddGoal}>
            <div className="form-group">
              <label>Goal Type</label>
              <select 
                className="form-input" 
                value={newGoal.goalType}
                onChange={e => setNewGoal({...newGoal, goalType: e.target.value})}
              >
                <option value="Weight Loss">Weight Loss</option>
                <option value="Exercise Frequency">Exercise Frequency</option>
                <option value="Water Intake">Water Intake</option>
                <option value="Sleep">Sleep Tracker</option>
              </select>
            </div>
            <div style={{display:'flex', gap:'12px'}}>
              <div className="form-group" style={{flex:1}}>
                <label>Current Value</label>
                <input 
                  type="number" 
                  className="form-input"
                  value={newGoal.currentValue}
                  onChange={e => setNewGoal({...newGoal, currentValue: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="form-group" style={{flex:1}}>
                <label>Target Value</label>
                <input 
                  type="number" 
                  className="form-input"
                  value={newGoal.targetValue}
                  onChange={e => setNewGoal({...newGoal, targetValue: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="form-group" style={{width:'80px'}}>
                <label>Unit</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={newGoal.unit}
                  onChange={e => setNewGoal({...newGoal, unit: e.target.value})}
                  required
                />
              </div>
            </div>
            <button type="submit" className="modern-btn primary" style={{marginTop:'8px'}}>Save Goal</button>
          </form>
        </div>
      )}

      {goals.length === 0 && !showAddForm ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          <Target size={48} color="#cbd5e1" style={{marginBottom:'16px'}} />
          <p>No goals set yet. Start tracking your progress today!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {goals.map(goal => {
            const progress = calculateProgress(goal.currentValue, goal.targetValue, goal.goalType);
            const color = getProgressColor(progress);
            
            return (
              <div key={goal.id} style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '12px', 
                      background: `${color}15`, color: color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                      {progress >= 100 ? <CheckCircle size={20} /> : <TrendingUp size={20} />}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{goal.goalType}</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                        {goal.currentValue} {goal.unit} / {goal.targetValue} {goal.unit}
                      </p>
                    </div>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: color }}>
                    {Math.round(progress)}%
                  </div>
                </div>

                {/* Progress Bar Background */}
                <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                  {/* Progress Bar Fill */}
                  <div style={{ 
                    height: '100%', 
                    width: `${progress}%`, 
                    background: color,
                    borderRadius: '5px',
                    transition: 'width 1s ease-in-out'
                  }} />
                </div>

                {progress < 50 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '13px', color: '#f59e0b', background: '#fffbeb', padding: '10px 12px', borderRadius: '8px' }}>
                    <AlertCircle size={14} />
                    <span>You're a bit off-track. Keep pushing, you can do it!</span>
                  </div>
                )}
                {progress >= 100 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '13px', color: '#10b981', background: '#ecfdf5', padding: '10px 12px', borderRadius: '8px' }}>
                    <CheckCircle size={14} />
                    <span>Goal Achieved! Incredible work!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
