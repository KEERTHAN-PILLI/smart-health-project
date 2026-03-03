import React, { useEffect, useState } from "react";
import { Users, Activity, ChevronRight, User, X, MessageCircle } from "lucide-react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

export default function TrainerDashboard() {
  const name = localStorage.getItem("name") || "Trainer";
  const [clients, setClients] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
    fetchPendingRequests();
  }, []);

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

  return (
    <div>
      <div className="header-row">
        <div>
          <h1 className="welcome-title">Welcome, {name}</h1>
          <p className="welcome-subtitle">Here is your trainer overview</p>
        </div>
        <div className="user-avatar" style={{ background: "#fef3c7", color: "#d97706" }}>
          {name.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <Users size={18} color="#3b82f6" />
            <span className="stat-label">Total Clients</span>
          </div>
          <div className="stat-value">{clients.length}</div>
          <div className="sub-text">Active Connections</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <Activity size={18} color="#22c55e" />
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-value">{pendingRequests.length}</div>
          <div className="sub-text">Requests</div>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="section" style={{ background: "#fef9c3", padding: "16px", borderRadius: "16px", marginBottom: "24px" }}>
          <div className="section-title" style={{ color: "#ca8a04", marginBottom: "12px", fontSize: "15px" }}>Pending Requests ({pendingRequests.length})</div>
          {pendingRequests.map(req => (
            <div key={req.connectionId} className="card-item" style={{ background: "#ffffff", border: "1px solid #fef08a" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ background: "#fef08a", padding: "10px", borderRadius: "12px", color: "#eab308" }}>
                  <User size={20} />
                </div>
                <div>
                  <div className="font-semibold">{req.userName}</div>
                  <div className="sub-text">{req.userEmail}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="modern-btn"
                  onClick={() => handleApprove(req.userEmail)}
                  style={{ background: "#22c55e", color: "white", padding: "6px 16px", fontSize: "14px", border: "none", borderRadius: "8px", cursor: "pointer" }}
                >
                  Approve
                </button>
                <button
                  className="modern-btn"
                  onClick={() => handleReject(req.userEmail)}
                  style={{ background: "#ef4444", color: "white", padding: "6px 16px", fontSize: "14px", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <X size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connected Clients */}
      <div className="section">
        <div className="section-title">
          Connected Clients
        </div>

        {clients.length > 0 ? (
          clients.map((client) => (
            <div key={client.id || client.email} className="card-item">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ background: "#e2e8f0", padding: "10px", borderRadius: "12px", color: "#475569" }}>
                  <User size={20} />
                </div>
                <div>
                  <div className="font-semibold">{client.name || "Client"}</div>
                  <div className="sub-text">{client.email}</div>
                  {client.fitnessGoal && (
                    <div className="sub-text" style={{ fontSize: "11px", color: "#3b82f6" }}>Goal: {client.fitnessGoal}</div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  onClick={() => navigate(`/trainer/messages/${client.email}`)}
                  style={{
                    background: "#3b82f6", color: "white", border: "none",
                    padding: "6px 14px", borderRadius: "8px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "4px", fontSize: "13px"
                  }}
                >
                  <MessageCircle size={14} /> Message
                </button>
                <Link to={`/trainer/client/${client.email}`} style={{ textDecoration: "none" }}>
                  <button style={{
                    background: "#f1f5f9", color: "#475569", border: "none",
                    padding: "6px 14px", borderRadius: "8px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "4px", fontSize: "13px"
                  }}>
                    View Data <ChevronRight size={14} />
                  </button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="card-item" style={{ justifyContent: "center", color: "#64748b" }}>
            No connected clients yet.
          </div>
        )}
      </div>
    </div>
  );
}