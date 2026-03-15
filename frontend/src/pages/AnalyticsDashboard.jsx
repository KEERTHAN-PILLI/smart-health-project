import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Activity, Flame, Droplets, Moon, TrendingUp, Calendar } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/analytics/logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Format dates for charts
        const formattedData = data.map(log => ({
          ...log,
          displayDate: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        }));
        setLogs(formattedData);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-content user-bg"><p style={{textAlign: 'center', marginTop: '50px'}}>Loading Analytics...</p></div>;

  return (
    <div className="section" style={{ paddingBottom: '30px' }}>
      <div className="section-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp color="#3b82f6" />
          <span>Health Analytics</span>
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#1e293b' }}>Calories Overview</h3>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={logs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBurned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '5 5' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle"/>
              <Area type="monotone" name="Burned (kcal)" dataKey="caloriesBurned" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorBurned)" />
              <Area type="monotone" name="Consumed (kcal)" dataKey="caloriesConsumed" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorConsumed)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#1e293b' }}>Workout Duration</h3>
        <div style={{ height: '250px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={logs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              />
              <Bar name="Duration (mins)" dataKey="workoutDuration" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="stat-card" style={{ padding: '16px' }}>
          <div className="stat-header">
            <Droplets size={18} color="#0ea5e9" />
            <span className="stat-label">Avg Water</span>
          </div>
          <div className="stat-value" style={{ fontSize: '20px' }}>
            {logs.length > 0 ? Math.round(logs.reduce((sum, log) => sum + (log.waterIntake || 0), 0) / logs.length) : 0} ml
          </div>
        </div>
        <div className="stat-card" style={{ padding: '16px' }}>
          <div className="stat-header">
            <Moon size={18} color="#8b5cf6" />
            <span className="stat-label">Avg Sleep</span>
          </div>
          <div className="stat-value" style={{ fontSize: '20px' }}>
            {logs.length > 0 ? (logs.reduce((sum, log) => sum + (log.sleepDuration || 0), 0) / logs.length).toFixed(1) : 0} hrs
          </div>
        </div>
      </div>
    </div>
  );
}
