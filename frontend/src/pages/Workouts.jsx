import { useState, useEffect } from "react";
import API from "../api/axios";

function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");

  const fetchWorkouts = async () => {
    const res = await API.get("/user/workouts");
    setWorkouts(res.data);
  };

  const addWorkout = async (e) => {
    e.preventDefault();
    await API.post("/user/workouts", {
      workoutType: type,
      durationMinutes: duration,
      caloriesBurned: 200,
      date: "2026-02-18",
    });
    setType("");
    setDuration("");
    fetchWorkouts();
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  return (
    <div>
      <div className="glass" style={{ marginBottom: "20px" }}>
        <h2>Add Workout</h2>
        <form onSubmit={addWorkout}>
          <input
            placeholder="Workout Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ marginRight: "10px", padding: "8px" }}
          />
          <input
            placeholder="Duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            style={{ marginRight: "10px", padding: "8px" }}
          />
          <button className="btn-modern">Add</button>
        </form>
      </div>

      <div className="glass">
        <h2>Your Workouts</h2>
        {workouts.map((w) => (
          <div key={w.id} style={{ marginBottom: "10px" }}>
            {w.workoutType} - {w.durationMinutes} mins
          </div>
        ))}
      </div>
    </div>
  );
}

export default Workouts;
