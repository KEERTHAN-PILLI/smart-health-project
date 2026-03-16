import { useState, useEffect } from "react";
import API from "../api/axios";
import { Plus, Activity as ActivityIcon } from "lucide-react";

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");

  const fetchWorkouts = async () => {
    try {
      const res = await API.get("/user/workouts");
      setWorkouts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
      setWorkouts([]);
    }
  };

  const addWorkout = async (e) => {
    e.preventDefault();
    if (!type || !duration) return;
    try {
      await API.post("/user/workouts", {
        workoutType: type,
        durationMinutes: duration,
        caloriesBurned: 200,
        date: new Date().toISOString().split("T")[0],
      });
      setType("");
      setDuration("");
      fetchWorkouts();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  return (
    <div>
      <div className="header-row">
        <div>
          <h1 className="welcome-title">Activity</h1>
          <p className="welcome-subtitle">Track your fitness journey</p>
        </div>
      </div>

      <div className="activity-grid">
        <div className="section">
          <div className="section-title">Log New Workout</div>
          <div className="form-card">
            <form onSubmit={addWorkout} className="form-row">
              <div className="form-group">
                <label>Activity Type</label>
                <input
                  className="form-input"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
                  placeholder="e.g. Running, Yoga, Weights"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  className="form-input"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
                  type="number"
                  placeholder="e.g. 45"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <button type="submit" className="modern-btn primary" style={{ marginTop: "16px", borderRadius: '14px', height: '54px' }}>
                <Plus size={20} /> Add Workout
              </button>
            </form>
          </div>
        </div>

        <div className="section">
          <div className="section-title">History</div>
          <div className="form-card" style={{ maxHeight: '600px', overflowY: 'auto', padding: '16px', scrollbarWidth: 'none' }}>
            {workouts.length > 0 ? (
              workouts.map((w) => (
                <div key={w.id} className="card-item" style={{ 
                  background: 'rgba(15, 23, 42, 0.4)', 
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '12px',
                  padding: '16px 20px'
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ background: "rgba(59, 130, 246, 0.15)", padding: "12px", borderRadius: "14px", color: "var(--accent-blue)" }}>
                      <ActivityIcon size={22} />
                    </div>
                    <div>
                      <div className="font-semibold" style={{ fontSize: '16px', color: '#fff' }}>{w.workoutType}</div>
                      <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontWeight: '500' }}>
                        {w.date ? new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Today"}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="font-semibold" style={{ color: 'var(--accent-blue)', fontSize: '20px', fontWeight: '900' }}>{w.durationMinutes}</div>
                    <div style={{ fontSize: '11px', color: 'var(--accent-teal)', fontWeight: '800', letterSpacing: '1px' }}>MINUTES</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>
                No workouts logged yet. Your journey starts here!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}