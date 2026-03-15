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
          <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '8px', scrollbarWidth: 'none' }}>
            {workouts.length > 0 ? (
              workouts.map((w) => (
                <div key={w.id} className="card-item" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "12px", borderRadius: "14px", color: "var(--accent-blue)" }}>
                      <ActivityIcon size={22} />
                    </div>
                    <div>
                      <div className="font-semibold" style={{ fontSize: '16px' }}>{w.workoutType}</div>
                      <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{w.date ? new Date(w.date).toLocaleDateString() : "Today"}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="font-semibold" style={{ color: 'var(--accent-blue)', fontSize: '18px' }}>{w.durationMinutes}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>MINUTES</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card-item" style={{ justifyContent: "center", color: "#64748b", background: 'rgba(255,255,255,0.01)', borderStyle: 'dashed' }}>
                No workouts logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}