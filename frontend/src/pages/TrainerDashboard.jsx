import React, { useEffect, useState } from "react";
import { Users, Activity, ChevronRight, User } from "lucide-react";
import API from "../api/axios";
import { Link } from "react-router-dom";

export default function TrainerDashboard() {
  const name = localStorage.getItem("name") || "Trainer";
  const [clients, setClients] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

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
              <button
                className="modern-btn"
                onClick={() => handleApprove(req.userEmail)}
                style={{ background: "#22c55e", color: "white", padding: "6px 16px", fontSize: "14px" }}
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="section">
        <div className="section-title">
          Connected Clients
          <Link to="/trainer/clients" style={{ fontSize: "14px", color: "#3b82f6", textDecoration: "none", fontWeight: "500" }}>Manage All</Link>
        </div>

        {clients.length > 0 ? (
          clients.map((client) => (
            <Link key={client.id} to={`/trainer/client/${client.email}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="card-item" style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ background: "#e2e8f0", padding: "10px", borderRadius: "12px", color: "#475569" }}>
                    <User size={20} />
                  </div>
                  <div>
                    <div className="font-semibold">{client.name || "Client"}</div>
                    <div className="sub-text">{client.email}</div>
                  </div>
                </div>
                <ChevronRight size={20} color="#94a3b8" />
              </div>
            </Link>
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