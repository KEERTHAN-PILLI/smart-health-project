import React, { useEffect, useState } from "react";
import { User, Activity, Flame, ChevronLeft } from "lucide-react";
import API from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";

export default function ClientDetails() {
    const { email } = useParams();
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClientWorkouts();
    }, [email]);

    const fetchClientWorkouts = async () => {
        try {
            const res = await API.get(`/trainer/client/${email}/workouts`);
            setWorkouts(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.log("Error or no workouts found:", err);
            setWorkouts([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: "#f1f5f9", border: "none", padding: "8px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <ChevronLeft size={20} color="#0f172a" />
                </button>
                <span style={{ fontSize: "15px", fontWeight: "600", color: "#64748b" }}>Back to Dashboard</span>
            </div>

            <div className="profile-card" style={{ padding: "24px", flexDirection: "row", justifyContent: "flex-start", gap: "20px", textAlign: "left" }}>
                <div className="profile-avatar-large" style={{ width: "64px", height: "64px", fontSize: "24px", marginBottom: 0, background: "#e2e8f0", color: "#475569" }}>
                    <User size={32} />
                </div>
                <div>
                    <div className="profile-name" style={{ fontSize: "20px", marginBottom: "2px" }}>Client Data</div>
                    <div className="profile-email">{email}</div>
                </div>
            </div>

            <div className="section">
                <div className="section-title">Day-to-Day Workouts</div>

                {loading ? (
                    <div className="card-item" style={{ justifyContent: "center", color: "#64748b" }}>Loading client data...</div>
                ) : workouts.length > 0 ? (
                    workouts.map((w) => (
                        <div key={w.id} className="card-item">
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ background: "#f1f5f9", padding: "10px", borderRadius: "12px", color: "#3b82f6" }}>
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <div className="font-semibold">{w.workoutType}</div>
                                    <div className="sub-text">{w.date || "Unknown Date"}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div className="font-semibold">{w.durationMinutes} min</div>
                                <div className="sub-text" style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end", marginTop: "4px" }}>
                                    <Flame size={12} color="#ef4444" /> {w.caloriesBurned} kcal
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="card-item" style={{ justifyContent: "center", color: "#64748b" }}>
                        This client hasn't logged any workouts yet.
                    </div>
                )}
            </div>
        </div>
    );
}
