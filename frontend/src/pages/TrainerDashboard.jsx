import React, { useEffect, useState } from "react";
import { Users, Activity, ChevronRight, User, X, MessageCircle, Star, Calendar, ArrowUpRight, Clock, TrendingUp, DollarSign, Award, Target, LayoutDashboard, Brain, Flame, Coffee, Utensils, Droplet, Moon, ChevronLeft } from "lucide-react";
import API from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';

export default function TrainerDashboard() {
  const name = localStorage.getItem("name") || "Trainer";
  const [clients, setClients] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(location.pathname.includes("/trainer/clients") ? "clients" : "overview");
  const [selectedClientEmail, setSelectedClientEmail] = useState(null);
  const [clientData, setClientData] = useState({ workouts: [], analytics: null });
  const [clientLoading, setClientLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setActiveTab(location.pathname.includes("/trainer/clients") ? "clients" : "overview");
  }, [location.pathname]);

  // Mock data for the elite analytics design
  const financeData = [
    { month: 'Jan', revenue: 4.1, expenses: 1.2, profit: 2.9 },
    { month: 'Feb', revenue: 3.8, expenses: 1.1, profit: 2.7 },
    { month: 'Mar', revenue: 4.5, expenses: 1.3, profit: 3.2 },
    { month: 'Apr', revenue: 4.2, expenses: 1.2, profit: 3.0 },
    { month: 'May', revenue: 4.8, expenses: 1.4, profit: 3.4 },
    { month: 'Jun', revenue: 5.2, expenses: 1.5, profit: 3.7 },
  ];

  const growthData = [
    { month: 'Jan', members: 100 },
    { month: 'Feb', members: 112 },
    { month: 'Mar', members: 125 },
    { month: 'Apr', members: 118 },
    { month: 'May', members: 135 },
    { month: 'Jun', members: 152 },
  ];

  const membershipStats = [
    { name: 'Platinum', value: 18, color: 'var(--accent-platinum)', total: 33 },
    { name: 'Gold', value: 15, color: 'var(--accent-gold)', total: 35 },
    { name: 'Silver', value: 11, color: 'var(--accent-silver)', total: 32 },
  ];

  useEffect(() => {
    loadTrainerData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadTrainerData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchClients(), fetchPendingRequests()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await API.get("/trainer/clients");
      setClients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
      setClients([]);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await API.get("/trainer/pending-requests");
      setPendingRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
      setPendingRequests([]);
    }
  };

  const handleApprove = async (userEmail) => {
    try {
      await API.post("/trainer/approve-client", { userEmail });
      fetchClients();
      fetchPendingRequests();
    } catch (err) {
      console.log(err);
      alert("Failed to approve client.");
    }
  };

  const handleReject = async (userEmail) => {
    try {
      await API.post("/trainer/reject-client", { userEmail });
      fetchPendingRequests();
    } catch (err) {
      console.log(err);
      alert("Failed to reject client.");
    }
  };

  const handleDisconnect = async (userEmail) => {
    if (!window.confirm("Are you sure you want to disconnect this client? They will be removed from your roster.")) return;
    try {
      await API.post("/trainer/disconnect-client", { userEmail });
      fetchClients();
    } catch (err) {
      console.log(err);
      alert("Failed to disconnect client.");
    }
  };

  const fetchIndividualClientData = async (email) => {
    setClientLoading(true);
    try {
        const [workoutsRes, analyticsRes] = await Promise.all([
            API.get(`/trainer/client/${email}/workouts`).catch(() => ({ data: [] })),
            API.get(`/trainer/client/${email}/analytics`).catch(() => ({ data: null }))
        ]);
        setClientData({
            workouts: Array.isArray(workoutsRes.data) ? workoutsRes.data : [],
            analytics: analyticsRes.data
        });
    } catch (err) {
        console.log("Error fetching client data:", err);
    } finally {
        setClientLoading(false);
    }
  };

  const handleAnalyzeClient = (email) => {
    setSelectedClientEmail(email);
    fetchIndividualClientData(email);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const { workouts: iWorkouts, analytics: iAnalytics } = clientData;

  const generateWeeklyData = () => {
      const dailyLogs = iAnalytics?.dailyLogs || [];
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
              water: log ? log.waterIntake * 10 : 0,
              caloriesBurned: log ? log.caloriesBurned : 0
          };
      });
  };

  const getIconForCategory = (category) => {
      if (category === "Breakfast") return <Coffee size={18} />;
      if (category === "Lunch") return <Utensils size={18} />;
      if (category === "Dinner") return <Moon size={18} />;
      return <Flame size={18} />;
  };

  const weeklyData = generateWeeklyData();
  const todayCaloriesConsumed = (iAnalytics?.nutritionLogs || [])
      .filter(log => log.logDate === todayStr)
      .reduce((sum, log) => sum + log.calories, 0);

  const todayActiveMinutes = iWorkouts
      .filter(w => w.date && w.date.startsWith(todayStr))
      .reduce((sum, w) => sum + w.durationMinutes, 0);

  if (loading) return <div style={{ padding: '80px', textAlign: 'center', color: '#fff', fontSize: '18px', fontWeight: '700' }}>Initializing Elite Dashboard...</div>;

  return (activeTab === 'overview' ? (
    <div className="trainer-bg" style={{ minHeight: '100vh', padding: '24px 40px 100px 40px' }}>
      
      {/* Top Utility Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div className="time-vibrant-badge" style={{ padding: '12px 20px' }}>
              <div className="time-icon-container" style={{ padding: '8px' }}>
                <Clock size={20} />
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', lineHeight: '1' }}>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                <div style={{ fontSize: '9px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Last Dashboard Update</div>
              </div>
            </div>
        </div>
        
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <span onClick={() => navigate('/trainer-dashboard')} style={{ fontSize: '14px', fontWeight: '700', color: activeTab === 'overview' ? '#fff' : '#64748b', cursor: 'pointer', transition: '0.3s' }}>Overview</span>
              <span onClick={() => { navigate('/trainer/clients'); setSelectedClientEmail(null); }} style={{ fontSize: '14px', fontWeight: '700', color: activeTab === 'clients' ? '#fff' : '#64748b', cursor: 'pointer', transition: '0.3s' }}>Clients</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}>Calculator</span>
            </div>
            <div className="icon-btn">
               <LayoutDashboard size={20} />
            </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 1fr', gap: '24px' }}>
        
        {/* Pro Hero Section */}
        <div className="premium-card" style={{ 
          height: '100%', 
          padding: '0', 
          overflow: 'hidden', 
          background: 'linear-gradient(rgba(15,23,42,0.6), rgba(15,23,42,0.9)), url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop")',
          backgroundSize: 'cover',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
            <div style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', lineHeight: '1.2' }}>Fitness Dashboard</h1>
                        <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Track your fitness activities and health.</p>
                    </div>
                    <div className="icon-btn" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <ChevronRight size={20} />
                    </div>
                </div>
            </div>

            <div style={{ padding: '32px' }}>
                <div style={{ fontSize: '12px', color: 'var(--accent-orange)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Theme</div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>Orange</div>
            </div>
        </div>

        {/* Finance Analytics */}
        <div className="premium-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                   <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Finances</h3>
                   <p style={{ fontSize: '12px', color: '#64748b' }}>Revenue, Expenses and Profit</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)' }}></div><span style={{ fontSize: '10px', color: '#64748b' }}>Revenue</span></div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-orange)' }}></div><span style={{ fontSize: '10px', color: '#64748b' }}>Expenses</span></div>
                </div>
            </div>

            <div style={{ height: '180px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financeData}>
                        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                        <Bar dataKey="revenue" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} barSize={8} />
                        <Bar dataKey="expenses" fill="rgba(255,255,255,0.6)" radius={[4, 4, 0, 0]} barSize={8} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '24px' }}>
                <div className="tier-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                    <div className="finance-badge revenue">Revenue</div>
                    <div style={{ fontSize: '20px', fontWeight: '900' }}>4.1M</div>
                </div>
                <div className="tier-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                    <div className="finance-badge expenses">Expenses</div>
                    <div style={{ fontSize: '20px', fontWeight: '900' }}>1.2M</div>
                </div>
                <div className="tier-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                    <div className="finance-badge profit">Profit</div>
                    <div style={{ fontSize: '20px', fontWeight: '900' }}>2.9M</div>
                </div>
            </div>
        </div>

        {/* Membership Tiers */}
        <div className="premium-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                   <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Memberships</h3>
                   <p style={{ fontSize: '12px', color: '#64748b' }}>Membership Status by Tiers</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }}></div><span style={{ fontSize: '10px', color: '#64748b' }}>Active</span></div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></div><span style={{ fontSize: '10px', color: '#64748b' }}>Expired</span></div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {membershipStats.map((tier) => (
                    <div key={tier.name} className="tier-card">
                        <div className={`tier-circle ${tier.name.toLowerCase()}`}>
                            {Math.round((tier.value / tier.total) * 100)}%
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: '800' }}>{tier.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Memberships</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ background: '#fff', color: '#000', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', marginBottom: '4px' }}>{tier.value}</div>
                            <div style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900' }}>{tier.total - tier.value}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Client Memberships Table */}
        <div className="premium-card" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                   <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Client Memberships</h3>
                   <p style={{ fontSize: '12px', color: '#64748b' }}>Membership Status of Clients</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="modern-btn" style={{ padding: '6px 16px', fontSize: '11px', background: 'rgba(255,255,255,0.1)' }}>Active</button>
                    <button className="modern-btn" style={{ padding: '6px 16px', fontSize: '11px', background: 'transparent' }}>Expired</button>
                </div>
            </div>

            <table className="elite-table">
                <thead>
                    <tr>
                        <th>UserName</th>
                        <th>Status</th>
                        <th>Membership</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.length > 0 ? clients.map((client) => (
                        <tr key={client.email}>
                            <td>
                                <div style={{ fontWeight: '700' }}>{client.name}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{client.email}</div>
                            </td>
                            <td>
                                <span style={{ background: 'rgba(45, 212, 191, 0.1)', color: 'var(--accent-teal)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800' }}>Active</span>
                            </td>
                            <td style={{ width: '40%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
                                    <span>Progress</span>
                                    <span>{Math.floor(Math.random() * 30) + 40}%</span>
                                </div>
                                <div className="growth-bar-container">
                                    <div className="growth-bar-fill" style={{ width: `${Math.floor(Math.random() * 30) + 40}%` }}></div>
                                </div>
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div className="icon-btn" style={{ padding: '6px' }} onClick={() => { navigate('/trainer/clients'); handleAnalyzeClient(client.email); }}>
                                        <TrendingUp size={14} />
                                    </div>
                                    <div className="icon-btn" style={{ padding: '6px' }} onClick={() => navigate(`/trainer/messages/${client.email}`)}>
                                        <MessageCircle size={14} />
                                    </div>
                                    <div className="icon-btn" style={{ padding: '6px', color: '#ef4444' }} onClick={() => handleDisconnect(client.email)}>
                                        <X size={14} />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="4" style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No clients connected.</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Monthly Members Chart */}
        <div className="premium-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                   <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Monthly Members</h3>
                   <p style={{ fontSize: '12px', color: '#64748b' }}>Monthly Clients Gaining Status</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '700' }}>Max</button>
                    <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '700' }}>Min</button>
                </div>
            </div>

            <div style={{ height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={growthData}>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px' }} />
                        <Bar dataKey="members" fill="rgba(255,255,255,0.6)" radius={[4, 4, 0, 0]} barSize={12}>
                            {growthData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === growthData.length - 1 ? 'var(--accent-orange)' : 'rgba(255,255,255,0.1)'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

      </div>

      {/* Requests Overlay (Compact) */}
      {pendingRequests.length > 0 && (
          <div style={{ marginTop: '32px' }}>
              <h2 className="section-title">Connection Requests ({pendingRequests.length})</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  {pendingRequests.map(req => (
                      <div key={req.userEmail} className="tier-card" style={{ background: 'rgba(249, 115, 22, 0.05)', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                          <div style={{ padding: '12px', background: 'rgba(249, 115, 22, 0.1)', borderRadius: '12px', color: 'var(--accent-orange)' }}>
                              <Users size={20} />
                          </div>
                          <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: '800' }}>{req.userName}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>Wants to connect</div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => handleApprove(req.userEmail)} style={{ background: 'var(--accent-orange)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' }}>Accept</button>
                              <button onClick={() => handleReject(req.userEmail)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '8px' }}><X size={16} /></button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Elite KPI Summary Bar */}
      <div className="trainer-kpi-bar">
          <div className="kpi-item">
              <div className="kpi-label">Clients</div>
              <div className="kpi-value orange">{clients.length}</div>
          </div>
          <div className="kpi-item">
              <div className="kpi-label">Trainers</div>
              <div className="kpi-value">20</div>
          </div>
          <div className="kpi-item">
              <div className="kpi-label">Revenue</div>
              <div className="kpi-value">4.1M</div>
          </div>
          <div className="kpi-item">
              <div className="kpi-label">Expenses</div>
              <div className="kpi-value">1.2M</div>
          </div>
      </div>

    </div>
  ) : (
    <div className={`trainer-bg theme-emerald`} style={{ minHeight: '100vh', padding: '24px 40px 100px 40px', transition: 'all 0.5s ease' }}>
      
      {/* Top Utility Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div className="time-vibrant-badge" style={{ padding: '12px 20px' }}>
              <div className="time-icon-container" style={{ padding: '8px' }}>
                <Clock size={20} />
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', lineHeight: '1' }}>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                <div style={{ fontSize: '9px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Last Dashboard Update</div>
              </div>
            </div>
        </div>
        
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <span onClick={() => setActiveTab('overview')} style={{ fontSize: '14px', fontWeight: '700', color: activeTab === 'overview' ? '#fff' : '#64748b', cursor: 'pointer', transition: '0.3s' }}>Overview</span>
              <span onClick={() => setActiveTab('clients')} style={{ fontSize: '14px', fontWeight: '700', color: activeTab === 'clients' ? '#fff' : '#64748b', cursor: 'pointer', transition: '0.3s' }}>Clients</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}>Calculator</span>
            </div>
            <div className="icon-btn">
               <LayoutDashboard size={20} />
            </div>
        </div>
      </div>

      {!selectedClientEmail ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
           {/* Aggregate Client Health Overview */}
           <div className="premium-card" style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
               <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--accent-orange)', marginBottom: '8px' }}><Users size={32} style={{ margin: '0 auto' }} /></div>
                  <div style={{ fontSize: '28px', fontWeight: '900' }}>{clients.length}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Connected Clients</div>
               </div>
               <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--accent-blue)', marginBottom: '8px' }}><Activity size={32} style={{ margin: '0 auto' }} /></div>
                  <div style={{ fontSize: '28px', fontWeight: '900' }}>124</div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Total Workouts</div>
               </div>
               <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#ef4444', marginBottom: '8px' }}><Flame size={32} style={{ margin: '0 auto' }} /></div>
                  <div style={{ fontSize: '28px', fontWeight: '900' }}>8.4K</div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Avg Calories</div>
               </div>
               <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#8b5cf6', marginBottom: '8px' }}><Clock size={32} style={{ margin: '0 auto' }} /></div>
                  <div style={{ fontSize: '28px', fontWeight: '900' }}>42h</div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Active Hours</div>
               </div>
           </div>

           {/* Centralized Client Roster (Emerald Style) */}
           <div style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>Client Hub</h2>
                <div style={{ padding: '6px 16px', background: 'rgba(45, 212, 191, 0.1)', color: 'var(--accent-orange)', borderRadius: '100px', fontSize: '12px', fontWeight: '800' }}>Live Updates</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
                {clients.map(client => (
                   <div key={client.email} className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
                      <div className="user-avatar" style={{ border: '2px solid var(--accent-orange)', width: '64px', height: '64px', fontSize: '24px', background: 'rgba(45, 212, 191, 0.1)', color: 'var(--accent-orange)' }}>
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '18px', fontWeight: '800' }}>{client.name}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>{client.email}</div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                           <div style={{ fontSize: '11px', color: 'var(--accent-orange)', fontWeight: '800' }}>#WEIGHT_LOSS</div>
                           <div style={{ fontSize: '11px', color: 'var(--accent-blue)', fontWeight: '800' }}>#ACTIVE</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button className="modern-btn primary" style={{ padding: '8px 16px', fontSize: '12px', background: 'var(--accent-orange)' }} onClick={() => handleAnalyzeClient(client.email)}>Analyze</button>
                        <button className="modern-btn" style={{ padding: '8px 16px', fontSize: '12px', background: 'rgba(255,255,255,0.05)' }} onClick={() => navigate(`/trainer/messages/${client.email}`)}>Message</button>
                      </div>
                   </div>
                ))}
              </div>
           </div>
        </div>
      ) : (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {/* Inline Intelligence Hub Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="icon-btn" onClick={() => setSelectedClientEmail(null)}>
                        <ChevronLeft size={20} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>Client Analysis</h1>
                        <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Intelligence Hub • {selectedClientEmail}</p>
                    </div>
                </div>
                
                <div className="icon-btn" style={{ background: 'var(--accent-blue)', borderColor: 'transparent' }} onClick={() => navigate(`/trainer/messages/${selectedClientEmail}`)}>
                    <MessageCircle size={20} />
                </div>
            </div>

            {clientLoading ? (
                <div style={{ padding: '100px', textAlign: 'center', color: 'var(--accent-orange)', fontSize: '18px', fontWeight: '800' }}>Synchronizing Client Data...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                    
                    {/* Stats Summary Rows */}
                    <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '16px' }}>
                            <Flame size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Daily Intake</div>
                            <div style={{ fontSize: '24px', fontWeight: '900' }}>{todayCaloriesConsumed} <span style={{ fontSize: '12px', color: '#64748b' }}>/ {iAnalytics?.targetCalories || 2000}</span></div>
                        </div>
                    </div>

                    <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', borderRadius: '16px' }}>
                            <Activity size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Active Minutes</div>
                            <div style={{ fontSize: '24px', fontWeight: '900' }}>{todayActiveMinutes} <span style={{ fontSize: '12px', color: '#64748b' }}>/ 60m</span></div>
                        </div>
                    </div>

                    <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ padding: '16px', background: 'rgba(45, 212, 191, 0.1)', color: 'var(--accent-teal)', borderRadius: '16px' }}>
                            <Target size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Health Integrity</div>
                            <div style={{ fontSize: '24px', fontWeight: '900' }}>94%</div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="premium-card" style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Health Performance</h3>
                                <p style={{ fontSize: '12px', color: '#64748b' }}>Weekly Sleep and Hydration Status</p>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }}></div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Sleep</span></div>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)' }}></div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Water</span></div>
                            </div>
                        </div>

                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData}>
                                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                    <Bar dataKey="sleep" name="Sleep (h)" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={16} />
                                    <Bar dataKey="water" name="Water (dL)" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} barSize={16} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Activity Log Shortlist */}
                    <div className="premium-card">
                         <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Recent Activity</h3>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                             {iWorkouts.slice(0, 4).map(w => (
                                 <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.4)', padding: '12px', borderRadius: '12px' }}>
                                     <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                         <div style={{ color: 'var(--accent-blue)' }}><Activity size={18} /></div>
                                         <div>
                                             <div style={{ fontSize: '13px', fontWeight: '700' }}>{w.workoutType}</div>
                                             <div style={{ fontSize: '10px', color: '#64748b' }}>{w.date}</div>
                                         </div>
                                     </div>
                                     <div style={{ textAlign: 'right' }}>
                                         <div style={{ fontSize: '14px', fontWeight: '900', color: 'var(--accent-blue)' }}>{w.durationMinutes}m</div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                    </div>

                    {/* Nutritional Shorts */}
                    <div style={{ gridColumn: 'span 3', marginTop: '12px' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>Nutritional Intelligence</h2>
                            <div style={{ fontSize: '11px', color: 'var(--accent-orange)', fontWeight: '800' }}>Recent Meals</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                            {(iAnalytics?.nutritionLogs || []).slice().reverse().slice(0, 4).map(log => (
                                <div key={log.id} className="tier-card" style={{ padding: '16px' }}>
                                    <div style={{ padding: '10px', background: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent-orange)', borderRadius: '10px' }}>
                                        {getIconForCategory(log.mealCategory)}
                                    </div>
                                    <div style={{ flex: 1, marginLeft: '12px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '800' }}>{log.focus || log.foodItems}</div>
                                        <div style={{ fontSize: '10px', color: '#64748b' }}>{log.mealCategory}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '16px', fontWeight: '900', color: '#ef4444' }}>{log.calories}</div>
                                        <div style={{ fontSize: '9px', color: '#64748b', fontWeight: '800' }}>KCAL</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}

      {/* Elite KPI Summary Bar */}
      <div className="trainer-kpi-bar">
          <div className="kpi-item">
              <div className="kpi-label">Clients</div>
              <div className="kpi-value orange">{clients.length}</div>
          </div>
          <div className="kpi-item">
              <div className="kpi-label">Trainers</div>
              <div className="kpi-value">20</div>
          </div>
          <div className="kpi-item">
              <div className="kpi-label">Revenue</div>
              <div className="kpi-value">4.1M</div>
          </div>
          <div className="kpi-item">
              <div className="kpi-label">Expenses</div>
              <div className="kpi-value">1.2M</div>
          </div>
      </div>

    </div>
  ));
}