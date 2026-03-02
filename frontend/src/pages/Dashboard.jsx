import { useEffect, useState } from "react";
import API from "../api/axios";
import BottomNav from "../components/BottomNav";
import "../styles/app.css";

export default function UserDashboard() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const res = await API.get("/user/workouts");
      setWorkouts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="app-container">
      <h2>Health Trackers</h2>

      {/* Workout Section */}
      <div className="section">
        <h3>Workout Log</h3>
        {workouts.map((w) => (
          <div key={w.id} className="card-item">
            <span>{w.workoutType}</span>
            <span>{w.durationMinutes} min</span>
          </div>
        ))}
      </div>

      {/* Meal Section Placeholder */}
      <div className="section">
        <h3>Meal Tracker</h3>
        <div className="card-item">
          <span>Breakfast</span>
          <span>500 kcal</span>
        </div>
        <div className="card-item">
          <span>Lunch</span>
          <span>700 kcal</span>
        </div>
      </div>

      {/* Daily Logs Section */}
      <div className="section">
        <h3>Daily Logs</h3>
        <div className="card-item">
          <span>Water Intake</span>
          <span>8 glasses</span>
        </div>
        <div className="card-item">
          <span>Sleep</span>
          <span>7 hours</span>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}