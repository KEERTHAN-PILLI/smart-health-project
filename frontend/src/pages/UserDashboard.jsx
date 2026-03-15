import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { Flame, Activity, Droplet, Moon, ChevronRight, Lightbulb, Search, Bell, Chrome as HeartFill, LogOut, Settings, User as UserIcon } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function UserDashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const name = localStorage.getItem("name") || "User";
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [workoutsRes, logsRes, nutritionRes, profileRes] = await Promise.all([
        API.get("/user/workouts").catch(() => ({ data: [] })),
        API.get("/user/analytics/logs").catch(() => ({ data: [] })),
        API.get("/user/nutrition").catch(() => ({ data: [] })),
        API.get("/user/profile").catch(() => ({ data: null }))
      ]);

      setWorkouts(Array.isArray(workoutsRes.data) ? workoutsRes.data : []);
      setDailyLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
      setNutritionLogs(Array.isArray(nutritionRes.data) ? nutritionRes.data : []);
      setProfile(profileRes.data);
    } catch (err) {
      console.log("Error loading dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayLog = dailyLogs.find(l => l.date === todayStr) || { waterIntake: 0, sleepDuration: 0, caloriesBurned: 0 };
  
  const todayCaloriesConsumed = nutritionLogs
    .filter(log => log.logDate === todayStr)
    .reduce((sum, log) => sum + log.calories, 0);

  const todayActiveMinutes = workouts
    .filter(w => w.date && w.date.startsWith(todayStr))
    .reduce((sum, w) => sum + w.durationMinutes, 0);

  const targetCalories = profile?.targetCalories || 2000;
  
  const calorieData = [
    { name: 'Consumed', value: Math.min(todayCaloriesConsumed, targetCalories) },
    { name: 'Remaining', value: Math.max(0, targetCalories - todayCaloriesConsumed) }
  ];

  // Dynamic Calendar Logic
  const getCalendarDays = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0-Sun to 6-Sat
    const days = [];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Adjust to Monday-start for the UI strip
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        label: labels[i],
        date: d.getDate(),
        isToday: d.toDateString() === now.toDateString()
      });
    }
    return days;
  };

  const calendarDays = getCalendarDays();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonth = monthNames[today.getMonth()];
  const currentYear = today.getFullYear();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! Time to fuel up and crush your goals.";
    if (hour < 18) return "Good afternoon! Keep the momentum going strong.";
    return "Good evening! Great work today. Time for some rest and recovery.";
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#ffffff' }}>Loading Dashboard...</div>;

  return (
    <div className="user-bg" style={{ minHeight: '100vh', padding: '24px 40px' }}>
      
      {/* Time-based Greeting & Daily Tip Section */}
      <div style={{ marginBottom: '32px', display: 'flex', gap: '20px', alignItems: 'stretch' }}>
        <div className="premium-card" style={{ 
          flex: 2,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(15, 23, 42, 0.8))', 
          border: '1px solid rgba(59, 130, 246, 0.2)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
            <div style={{ color: 'var(--accent-blue)', fontWeight: '900', fontSize: '24px', marginBottom: '8px' }}>
              👋 {getTimeBasedGreeting()}
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>

        <div className="premium-card" style={{ flex: 1, background: 'rgba(45, 212, 191, 0.05)', border: '1px solid rgba(45, 212, 191, 0.2)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
           <div style={{ background: 'rgba(45, 212, 191, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent-teal)' }}>
             <Lightbulb size={24} />
           </div>
           <div>
             <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-teal)', textTransform: 'uppercase', marginBottom: '4px' }}>Daily Tip</div>
             <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.4' }}>Stay hydrated! aim for 3L of water today for peak muscle recovery.</div>
           </div>
        </div>
      </div>



      {/* Top Header */}
      <div className="header-row" style={{ alignItems: 'center', marginBottom: '40px' }}>
        <h1 className="premium-title">Discover</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', position: 'relative' }}>
          <div style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }} onClick={() => alert("Search feature coming soon!")}>
            <Search size={20} color="#94a3b8" />
          </div>
          <div style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }} onClick={() => alert("No new notifications")}>
            <Bell size={20} color="#94a3b8" />
          </div>
          <div 
            className="user-avatar" 
            style={{ border: '2px solid rgba(255,255,255,0.1)', background: 'var(--glass-bg)', cursor: 'pointer' }}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {name.charAt(0).toUpperCase()}
          </div>

          {showProfileMenu && (
            <div className="premium-card" style={{ position: 'absolute', top: '70px', right: '0', zIndex: 100, width: '220px', padding: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
               <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '8px' }}>
                 <div style={{ fontSize: '14px', fontWeight: '700' }}>{name}</div>
                 <div style={{ fontSize: '12px', color: '#94a3b8' }}>{localStorage.getItem("email")}</div>
               </div>
               <div className="nav-item" style={{ width: '100%', flexDirection: 'row', padding: '10px', borderRadius: '8px', cursor: 'pointer', background: 'transparent', border: 'none' }} onClick={() => navigate("/profile")}>
                 <UserIcon size={18} /> <span style={{ fontSize: '14px', color: '#fff' }}>Profile</span>
               </div>
               <div className="nav-item" style={{ width: '100%', flexDirection: 'row', padding: '10px', borderRadius: '8px', cursor: 'pointer', background: 'transparent', border: 'none' }} onClick={() => navigate("/settings")}>
                 <Settings size={18} /> <span style={{ fontSize: '14px', color: '#fff' }}>Settings</span>
               </div>
               <div className="nav-item" style={{ width: '100%', flexDirection: 'row', padding: '10px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', background: 'transparent', border: 'none' }} onClick={handleLogout}>
                 <LogOut size={18} /> <span style={{ fontSize: '14px', color: '#ef4444' }}>Logout</span>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Hero Interactive Section */}
      <div className="section" style={{ overflowX: 'auto', display: 'flex', gap: '20px', paddingBottom: '24px', scrollbarWidth: 'none' }}>
        <div 
          className="premium-card" 
          onClick={() => navigate("/workouts")}
          style={{ minWidth: '350px', cursor: 'pointer', background: 'linear-gradient(rgba(15,23,42,0.4), rgba(15,23,42,0.85)), url("https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=500&auto=format&fit=crop")', backgroundSize: 'cover', border: 'none', position: 'relative' }}
        >
          <div style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>Activity</div>
          <div style={{ marginTop: '120px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '4px' }}>Force Routine 💪</h2>
            <p style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>Strengthen your movement pattern.</p>
          </div>
        </div>

        <div 
          className="premium-card"
          onClick={() => navigate("/nutrition")}
          style={{ minWidth: '350px', cursor: 'pointer', background: 'linear-gradient(rgba(45, 212, 191, 0.25), rgba(15, 23, 42, 0.98))', border: '1px solid rgba(45, 212, 191, 0.4)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
             <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Healthy Fuel 🥗</h2>
             <div style={{ color: 'var(--accent-teal)', fontSize: '13px', fontWeight: '700' }}>Nutrition</div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>Unlock better recovery with AI-tailored nutrition suggestions based on your daily burn.</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-teal)' }}></div>
              <span style={{ fontSize: '14px', color: '#fff' }}>98% Match</span>
            </div>
            <button style={{ background: '#ffffff', color: '#0f172a', border: 'none', padding: '12px 28px', borderRadius: '30px', fontWeight: '800', fontSize: '14px' }}>Explore Diet</button>
          </div>
        </div>

        <div 
          className="premium-card" 
          onClick={() => navigate("/find-trainers")}
          style={{ minWidth: '350px', cursor: 'pointer', background: 'linear-gradient(rgba(15,23,42,0.4), rgba(15,23,42,0.85)), url("https://images.unsplash.com/photo-1583454110551-21f2fa29617c?q=80&w=500&auto=format&fit=crop")', backgroundSize: 'cover', border: 'none' }}
        >
           <div style={{ marginTop: '120px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '4px' }}>Pro Guidance 🎯</h2>
            <p style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>Connect with elite coaches now.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginBottom: '80px' }}>
        {/* Daily Progress Circular Chart */}
        <div className="premium-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Daily Progress</h3>
            <div style={{ color: '#94a3b8', fontSize: '13px', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '10px' }}>Day ▾</div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={calorieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={95}
                    startAngle={90}
                    endAngle={450}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="var(--accent-teal)" />
                    <Cell fill="rgba(255,255,255,0.05)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '900' }}>{todayCaloriesConsumed}</div>
                <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Kcal</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                 <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-teal)' }}></div>
                 <div>
                   <div style={{ fontSize: '15px', fontWeight: '700' }}>Calories</div>
                   <div style={{ fontSize: '12px', color: '#94a3b8' }}>Target: {targetCalories} /day</div>
                 </div>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                 <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-orange)' }}></div>
                 <div>
                   <div style={{ fontSize: '15px', fontWeight: '700' }}>Active Minutes</div>
                   <div style={{ fontSize: '12px', color: '#94a3b8' }}>Goal: 60 min</div>
                 </div>
               </div>
            </div>
          </div>

          <div style={{ marginTop: '32px', background: 'rgba(45, 212, 191, 0.1)', padding: '16px', borderRadius: '20px', color: 'var(--accent-teal)', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <HeartFill size={18} />
             You've been consistent this week, keep it up!
          </div>
        </div>

        {/* Dynamic Calendar Strip */}
        <div className="premium-card" style={{ marginBottom: 0 }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>{currentMonth} {currentYear}</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}>←</button>
              <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}>→</button>
            </div>
          </div>

          <div className="calendar-strip" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
             {calendarDays.map((d, i) => (
               <div key={i} style={{ textAlign: 'center', padding: '12px 14px', borderRadius: '16px', background: d.isToday ? 'var(--accent-blue)' : 'transparent', border: d.isToday ? 'none' : '1px solid rgba(255,255,255,0.05)', color: d.isToday ? '#ffffff' : '#94a3b8' }}>
                 <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>{d.label}</div>
                 <div style={{ fontSize: '18px', fontWeight: '800' }}>{d.date}</div>
               </div>
             ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
             <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px', color: '#94a3b8' }}>Recent Activity</div>
             {workouts.length > 0 ? workouts.slice(0, 2).map((w, idx) => (
               <div key={w.id} className="card-item" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 0 }}>
                  <img src={idx === 0 ? "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=100&auto=format&fit=crop" : "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=100&auto=format&fit=crop"} alt="workout" style={{ width: '54px', height: '54px', borderRadius: '14px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, marginLeft: '4px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700' }}>{w.workoutType}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{w.durationMinutes} minutes</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2.5px solid var(--accent-orange)', margin: '0 0 0 auto' }}></div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px', fontWeight: '600' }}>Completed</div>
                  </div>
               </div>
             )) : (
               <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '15px' }}>No workouts tracked today.</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}