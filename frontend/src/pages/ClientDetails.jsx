import React, { useEffect, useState } from "react";
import { User, Activity, Flame, ChevronLeft, Droplet, Moon, Coffee, Utensils, TrendingUp, Calendar, Clock, Award, Target, LayoutDashboard, MessageCircle } from "lucide-react";
import API from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

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

    const dailyLogs = analytics?.dailyLogs || [];
    const nutritionLogs = analytics?.nutritionLogs || [];
    const todayStr = new Date().toISOString().split('T')[0];

    const generateWeeklyData = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const now = new Date();
        const currentDay = now.getDay();
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
                water: log ? log.waterIntake * 10 : 0, // Scale water for better chart visibility
                caloriesBurned: log ? log.caloriesBurned : 0
            };
        });
    };

    const weeklyData = generateWeeklyData();

    const getIconForCategory = (category) => {
        if (category === "Breakfast") return <Coffee size={18} />;
        if (category === "Lunch") return <Utensils size={18} />;
        if (category === "Dinner") return <Moon size={18} />;
        return <Flame size={18} />;
    };

    if (loading) return <div style={{ padding: '80px', textAlign: 'center', color: '#fff', fontSize: '18px', fontWeight: '700' }}>Loading Client Intelligence...</div>;

    const todayCaloriesConsumed = nutritionLogs
        .filter(log => log.logDate === todayStr)
        .reduce((sum, log) => sum + log.calories, 0);

    const todayActiveMinutes = workouts
        .filter(w => w.date && w.date.startsWith(todayStr))
        .reduce((sum, w) => sum + w.durationMinutes, 0);

    return (
        <div className="trainer-bg" style={{ minHeight: '100vh', padding: '24px 40px 100px 40px' }}>
            
            {/* Header Utility */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="icon-btn" onClick={() => navigate(-1)}>
                        <ChevronLeft size={20} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>Client Analysis</h1>
                        <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Intelligence Report • {email}</p>
                    </div>
                </div>
                
                <div className="icon-btn" style={{ background: 'var(--accent-blue)', borderColor: 'transparent' }} onClick={() => navigate(`/trainer/messages/${email}`)}>
                    <MessageCircle size={20} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Stats Summary - Calories */}
                <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '16px' }}>
                        <Flame size={28} />
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Daily Intake</div>
                        <div style={{ fontSize: '24px', fontWeight: '900' }}>{todayCaloriesConsumed} <span style={{ fontSize: '12px', color: '#64748b' }}>/ {analytics?.targetCalories || 2000}</span></div>
                    </div>
                </div>

                {/* Stats Summary - Active Minutes */}
                <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', borderRadius: '16px' }}>
                        <Activity size={28} />
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Active Minutes</div>
                        <div style={{ fontSize: '24px', fontWeight: '900' }}>{todayActiveMinutes} <span style={{ fontSize: '12px', color: '#64748b' }}>/ 60m</span></div>
                    </div>
                </div>

                {/* Stats Summary - Goals */}
                <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ padding: '16px', background: 'rgba(45, 212, 191, 0.1)', color: 'var(--accent-teal)', borderRadius: '16px' }}>
                        <Target size={28} />
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Health Integrity</div>
                        <div style={{ fontSize: '24px', fontWeight: '900' }}>94%</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'start' }}>
                
                {/* Weekly Health Performance */}
                <div className="premium-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Health Performance</h3>
                            <p style={{ fontSize: '12px', color: '#64748b' }}>Weekly Sleep and Hydration Status</p>
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }}></div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Sleep</span></div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0ea5e9' }}></div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Water</span></div>
                        </div>
                    </div>

                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                <Bar dataKey="sleep" name="Sleep (h)" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={16} />
                                <Bar dataKey="water" name="Water (dL)" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Workout History Intelligence */}
                <div className="section" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 className="section-title" style={{ margin: 0 }}>Activity Log</h2>
                        <div style={{ fontSize: '11px', color: 'var(--accent-blue)', fontWeight: '800' }}>Live History</div>
                    </div>
                    
                    <div className="form-card" style={{ maxHeight: '420px', overflowY: 'auto', padding: '16px', scrollbarWidth: 'none' }}>
                        {workouts.length > 0 ? workouts.map((w) => (
                            <div key={w.id} className="card-item" style={{ 
                                background: 'rgba(15, 23, 42, 0.4)', 
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                marginBottom: '12px',
                                padding: '16px' 
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ background: "rgba(59, 130, 246, 0.15)", padding: "10px", borderRadius: "12px", color: "var(--accent-blue)" }}>
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: '800' }}>{w.workoutType}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{w.date || "Today"}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--accent-blue)' }}>{w.durationMinutes}m</div>
                                    <div style={{ fontSize: '10px', color: 'var(--accent-teal)', fontWeight: '800' }}>MINUTES</div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>No workouts logged by client.</div>
                        )}
                    </div>
                </div>

                {/* Nutrition Intelligence */}
                <div className="section" style={{ margin: 0, gridColumn: 'span 2' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 className="section-title" style={{ margin: 0 }}>Nutritional Intelligence</h2>
                        <div style={{ fontSize: '11px', color: 'var(--accent-orange)', fontWeight: '800' }}>Daily Log Analysis</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                        {nutritionLogs.length > 0 ? nutritionLogs.slice().reverse().slice(0, 6).map((log) => (
                            <div key={log.id} className="tier-card" style={{ padding: '20px' }}>
                                <div style={{ padding: '14px', background: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent-orange)', borderRadius: '14px' }}>
                                    {getIconForCategory(log.mealCategory)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '15px', fontWeight: '800' }}>{log.focus || log.foodItems}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{log.mealCategory} • {log.logDate}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#ef4444' }}>{log.calories}</div>
                                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>KCAL</div>
                                </div>
                            </div>
                        )) : (
                            <div className="premium-card" style={{ gridColumn: 'span 3', textAlign: 'center', color: '#64748b' }}>No nutrition data found for this client.</div>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}

