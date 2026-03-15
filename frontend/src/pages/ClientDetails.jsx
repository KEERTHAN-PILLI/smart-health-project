import React, { useEffect, useState } from "react";
import { User, Activity, Flame, ChevronLeft, Droplet, Moon, Coffee, Utensils } from "lucide-react";
import API from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function ClientDetails() {
    const { email } = useParams();
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClientData();
    }, [email]);

    const fetchClientData = async () => {
        setLoading(true);
        try {
            const [workoutsRes, analyticsRes] = await Promise.all([
                API.get(`/trainer/client/${email}/workouts`).catch(() => ({ data: [] })),
                API.get(`/trainer/client/${email}/analytics`).catch(() => ({ data: null }))
            ]);
            
            setWorkouts(Array.isArray(workoutsRes.data) ? workoutsRes.data : []);
            setAnalytics(analyticsRes.data);
        } catch (err) {
            console.log("Error fetching client data:", err);
        } finally {
            setLoading(false);
        }
    };

    // Prepare weekly chart data
    const dailyLogs = analytics?.dailyLogs || [];
    const generateWeeklyData = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const now = new Date();
        const currentDay = now.getDay(); // 0 is Sun, 6 is Sat
        
        // Get the start of the current week (Sunday)
        const sunday = new Date(now);
        sunday.setDate(now.getDate() - currentDay);
        sunday.setHours(0, 0, 0, 0);

        return days.map((day, index) => {
            const date = new Date(sunday);
            date.setDate(sunday.getDate() + index);
            const dateStr = date.toISOString().split('T')[0];
            
            const log = dailyLogs.find(l => l.date === dateStr);
            
            return {
                date: day,
                sleep: log ? log.sleepDuration : 0,
                water: log ? log.waterIntake : 0,
                caloriesBurned: log ? log.caloriesBurned : 0
            };
        });
    };

    const weeklyData = generateWeeklyData();
    
    const nutritionLogs = analytics?.nutritionLogs || [];

    const getIconForCategory = (category) => {
        if (category === "Breakfast") return <Coffee size={16} />;
        if (category === "Lunch") return <Utensils size={16} />;
        if (category === "Dinner") return <Moon size={16} />;
        return <Flame size={16} />; // Snack
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

            {!loading && analytics && (
                <div className="stats-grid" style={{ marginTop: "24px" }}>
                    <div className="stat-card">
                        <div className="stat-header">
                            <Flame size={18} color="#ef4444" />
                            <span className="stat-label">Calories</span>
                        </div>
                        <div className="stat-value">
                            {nutritionLogs
                                .filter(log => log.logDate === new Date().toISOString().split('T')[0])
                                .reduce((sum, log) => sum + log.calories, 0)}
                        </div>
                        <div className="sub-text">Goal: {analytics.targetCalories}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-header">
                            <Activity size={18} color="#3b82f6" />
                            <span className="stat-label">Active</span>
                        </div>
                        <div className="stat-value">
                            {workouts
                                .filter(w => w.date && w.date.startsWith(new Date().toISOString().split('T')[0]))
                                .reduce((sum, w) => sum + w.durationMinutes, 0)}m
                        </div>
                        <div className="sub-text">Goal: 60m</div>
                    </div>
                </div>
            )}

            <div className="section">
                <div className="section-title">Weekly Activity Overview</div>
                {loading ? (
                    <div className="card-item" style={{ justifyContent: "center", color: "#64748b" }}>Loading chart data...</div>
                ) : (
                    <div className="card-item" style={{ display: 'block' }}>
                        <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px', marginTop: 0 }}>Sleep (Hours) & Water (Liters)</h3>
                        <div style={{ width: '100%', height: 250 }}>
                            {weeklyData.length > 0 ? (
                                <ResponsiveContainer>
                                    <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                            cursor={{ fill: '#f1f5f9' }}
                                        />
                                        <Bar dataKey="sleep" name="Sleep (h)" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                                        <Bar dataKey="water" name="Water (L)" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                                    No data available for this week
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
                <div className="section" style={{ margin: 0 }}>
                    <div className="section-title">Logged Workouts</div>

                    {loading ? (
                        <div className="card-item" style={{ justifyContent: "center", color: "#64748b" }}>Loading workouts...</div>
                    ) : workouts.length > 0 ? (
                        workouts.map((w) => (
                            <div key={w.id} className="card-item" style={{ padding: "16px" }}>
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

                <div className="section" style={{ margin: 0 }}>
                    <div className="section-title">Recent Nutrition</div>

                    {loading ? (
                        <div className="card-item" style={{ justifyContent: "center", color: "#64748b" }}>Loading nutrition...</div>
                    ) : nutritionLogs.length > 0 ? (
                        nutritionLogs.slice().reverse().slice(0, 5).map((log) => (
                            <div key={log.id} className="card-item" style={{ padding: "16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ background: "#fef3c7", padding: "10px", borderRadius: "12px", color: "#d97706" }}>
                                        {getIconForCategory(log.mealCategory)}
                                    </div>
                                    <div>
                                        <div className="font-semibold">{log.foodItems}</div>
                                        <div className="sub-text">{log.logDate} • {log.mealCategory}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div className="font-semibold" style={{ color: "#ef4444" }}>{log.calories} kcal</div>
                                    {log.protein > 0 && (
                                        <div className="sub-text" style={{ fontSize: "12px", marginTop: "4px" }}>
                                            {log.protein}g protein
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="card-item" style={{ justifyContent: "center", color: "#64748b" }}>
                            No nutrition logs found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
