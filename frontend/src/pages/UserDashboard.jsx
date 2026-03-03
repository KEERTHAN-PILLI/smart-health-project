import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { Flame, Activity, Droplet, Moon, ChevronRight, Lightbulb } from "lucide-react";

export default function UserDashboard() {
  const [workouts, setWorkouts] = useState([]);
  const name = localStorage.getItem("name") || "User";

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const res = await API.get("/user/workouts");
      setWorkouts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
      setWorkouts([]);
    }
  };

  const healthTips = [
    "Stay hydrated! Drink at least 8 glasses of water today to keep your energy levels up.",
    "A 15-minute walk after meals can significantly improve digestion and regulate blood sugar.",
    "Prioritize sleep. 7-8 hours tonight helps your muscles recover and boosts cognitive function.",
    "Eat the rainbow! Incorporate colorful vegetables into your dinner for a variety of nutrients.",
    "Take short screen breaks. Look at something 20 feet away for 20 seconds every 20 minutes."
  ];

  // Pick a tip based on the day of the year (so it changes daily but stays consistent per day)
  const tipOfTheDay = healthTips[new Date().getDate() % healthTips.length];

  return (
    <div>
      <div className="header-row">
        <div>
          <h1 className="welcome-title">Hi, {name}</h1>
          <p className="welcome-subtitle"> Hey, Here is your daily overview</p>
        </div>
        <div className="user-avatar">
          {name.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Daily Health Tip Section */}
      <div className="section" style={{ marginBottom: "24px" }}>
        <div style={{ background: "linear-gradient(135deg, #fef08a 0%, #fde047 100%)", borderRadius: "16px", padding: "16px", display: "flex", gap: "16px", alignItems: "center", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ background: "#ffffff", padding: "10px", borderRadius: "12px", color: "#eab308" }}>
            <Lightbulb size={24} />
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#854d0e", marginBottom: "4px" }}>Tip of the Day</div>
            <div style={{ fontSize: "14px", color: "#713f12", lineHeight: "1.4" }}>
              {tipOfTheDay}
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <Flame size={18} color="#ef4444" />
            <span className="stat-label">Calories</span>
          </div>
          <div className="stat-value">1,240</div>
          <div className="sub-text">Goal: 2,000</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <Activity size={18} color="#3b82f6" />
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-value">45m</div>
          <div className="sub-text">Goal: 60m</div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">
          Recent Workouts
          <Link to="/workouts" style={{ fontSize: "14px", color: "#3b82f6", textDecoration: "none", fontWeight: "500" }}>View All</Link>
        </div>

        {workouts.length > 0 ? (
          workouts.slice(0, 3).map((w) => (
            <div key={w.id} className="card-item">
              <div>
                <div className="font-semibold">{w.workoutType}</div>
                <div className="sub-text">Today</div>
              </div>
              <div className="font-semibold">{w.durationMinutes} min</div>
            </div>
          ))
        ) : (
          <div className="card-item" style={{ justifyContent: "center", color: "#64748b" }}>
            No recent workouts.
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-title">Daily Logs</div>

        <div className="card-item">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "#e0f2fe", padding: "10px", borderRadius: "12px", color: "#0ea5e9" }}>
              <Droplet size={20} />
            </div>
            <div>
              <div className="font-semibold">Water Intake</div>
              <div className="sub-text">8 / 10 glasses</div>
            </div>
          </div>
          <ChevronRight size={20} color="#94a3b8" />
        </div>

        <div className="card-item">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "#ede9fe", padding: "10px", borderRadius: "12px", color: "#8b5cf6" }}>
              <Moon size={20} />
            </div>
            <div>
              <div className="font-semibold">Sleep</div>
              <div className="sub-text">7h 20m</div>
            </div>
          </div>
          <ChevronRight size={20} color="#94a3b8" />
        </div>
      </div>
    </div>
  );
}