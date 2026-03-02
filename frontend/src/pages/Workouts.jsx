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

      <div className="section">
        <div className="section-title">Log New Workout</div>
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9" }}>
          <form onSubmit={addWorkout} className="form-row">
            <div className="form-group">
              <label>Activity Type</label>
              <input
                className="form-input"
                placeholder="e.g. Running, Yoga, Weights"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                className="form-input"
                type="number"
                placeholder="e.g. 45"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <button type="submit" className="modern-btn primary" style={{ marginTop: "8px" }}>
              <Plus size={18} /> Add Workout
            </button>
          </form>
        </div>
      </div>

      <div className="section">
        <div className="section-title">History</div>
        {workouts.length > 0 ? (
          workouts.map((w) => (
            <div key={w.id} className="card-item">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ background: "#f1f5f9", padding: "10px", borderRadius: "12px", color: "#64748b" }}>
                  <ActivityIcon size={20} />
                </div>
                <div>
                  <div className="font-semibold">{w.workoutType}</div>
                  <div className="sub-text">{w.date || "Today"}</div>
                </div>
              </div>
              <div className="font-semibold">{w.durationMinutes} min</div>
            </div>
          ))
        ) : (
          <div className="card-item" style={{ justifyContent: "center", color: "#64748b" }}>
            No workouts logged yet.
          </div>
        )}
      </div>
    </div>
  );
}