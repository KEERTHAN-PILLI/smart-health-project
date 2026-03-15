import React, { useEffect, useState } from "react";
import { Users, Activity, ChevronRight, User, X, MessageCircle, Star, Calendar, ArrowUpRight } from "lucide-react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

export default function TrainerDashboard() {
  const name = localStorage.getItem("name") || "Trainer";
  const [clients, setClients] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTrainerData();
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

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Trainer Dashboard...</div>;

  return (
    <div className="trainer-bg" style={{ minHeight: '100vh', padding: '24px' }}>
      {/* Warm Welcome Banner */}
      <div className="premium-card" style={{ marginBottom: '32px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', marginBottom: '8px' }}>
               <Star size={16} fill="var(--accent-blue)" />
               <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Elite Trainer</span>
            </div>
            <h1 className="premium-title" style={{ fontSize: '36px', marginBottom: '8px' }}>Welcome back, Coach {name}</h1>
            <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '500px' }}>Your athletes are hitting their targets! You have {pendingRequests.length} new connection requests waiting for your approval.</p>
          </div>
          <div className="user-avatar" style={{ width: '80px', height: '80px', fontSize: '28px', background: 'var(--accent-blue)', color: 'white', border: '4px solid rgba(255,255,255,0.1)' }}>
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Overview Tiles */}
        <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
           <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)' }}>
             <Users size={28} />
           </div>
           <div>
             <div style={{ fontSize: '28px', fontWeight: '800' }}>{clients.length}</div>
             <div style={{ fontSize: '13px', color: '#94a3b8' }}>Active Clients</div>
           </div>
           <ArrowUpRight size={20} color="#94a3b8" style={{ marginLeft: 'auto' }} />
        </div>

        <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
           <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(251, 146, 60, 0.1)', color: 'var(--accent-orange)' }}>
             <Activity size={28} />
           </div>
           <div>
             <div style={{ fontSize: '28px', fontWeight: '800' }}>{pendingRequests.length}</div>
             <div style={{ fontSize: '13px', color: '#94a3b8' }}>Pending Requests</div>
           </div>
           <ArrowUpRight size={20} color="#94a3b8" style={{ marginLeft: 'auto' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Client Management Area */}
        <div className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Client Roster</h2>
            <div style={{ fontSize: '13px', color: 'var(--accent-blue)', fontWeight: '600' }}>Manage All</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {clients.length > 0 ? clients.map((client) => (
              <div key={client.email} className="premium-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <User size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>{client.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{client.email}</div>
                  {client.fitnessGoal && <div style={{ fontSize: '11px', color: 'var(--accent-teal)', marginTop: '4px' }}>Goal: {client.fitnessGoal}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                   <button onClick={() => navigate(`/trainer/messages/${client.email}`)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '8px', borderRadius: '10px', color: '#ffffff' }}>
                     <MessageCircle size={18} />
                   </button>
                   <button onClick={() => navigate(`/trainer/client/${client.email}`)} style={{ background: 'var(--accent-blue)', border: 'none', padding: '8px 16px', borderRadius: '10px', color: '#ffffff', fontSize: '13px', fontWeight: '600' }}>
                     Analyze
                   </button>
                </div>
              </div>
            )) : (
              <div className="premium-card" style={{ textAlign: 'center', color: '#64748b' }}>No clients connected.</div>
            )}
          </div>
        </div>

        {/* Requests Sidebar */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>New Requests</h2>
          {pendingRequests.length > 0 ? pendingRequests.map(req => (
             <div key={req.userEmail} className="premium-card" style={{ padding: '16px', marginBottom: '12px', border: '1px solid rgba(251, 146, 60, 0.2)' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(251, 146, 60, 0.1)', color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{req.userName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Wants to connect</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleApprove(req.userEmail)} style={{ flex: 1, background: 'var(--accent-teal)', border: 'none', padding: '10px', borderRadius: '10px', color: '#0f172a', fontWeight: '700', fontSize: '12px' }}>Approve</button>
                  <button onClick={() => handleReject(req.userEmail)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '10px', borderRadius: '10px', color: '#ef4444' }}><X size={16} /></button>
                </div>
             </div>
          )) : (
            <div className="premium-card" style={{ textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No pending requests.</div>
          )}
        </div>
      </div>
    </div>
  );
}