import React, { useEffect, useState } from "react";
import { UserPlus, UserCheck, Clock, User, MessageCircle, UserMinus } from "lucide-react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function FindTrainers() {
    const [trainers, setTrainers] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState("NONE");
    const [connectedTrainer, setConnectedTrainer] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchTrainers(), fetchConnectionStatus()]);
        setLoading(false);
    };

    const fetchTrainers = async () => {
        try {
            const res = await API.get("/user/trainers/match");
            setTrainers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.log("Error fetching trainers:", err);
            setTrainers([]);
        }
    };

    const fetchConnectionStatus = async () => {
        try {
            const res = await API.get("/user/connection-status");
            setConnectionStatus(res.data.status || "NONE");
            if (res.data.trainerEmail) {
                setConnectedTrainer(res.data.trainerEmail);
            }
        } catch (err) {
            console.log("Error fetching connection status:", err);
            setConnectionStatus("NONE");
        }
    };

    const handleConnect = async (trainerEmail) => {
        try {
            await API.post("/user/connect-trainer", { trainerEmail });
            setConnectionStatus("PENDING");
            setConnectedTrainer(trainerEmail);
            alert("Connection request sent! Your trainer will be notified.");
        } catch (err) {
            console.log("Error sending connection:", err);
            const errorMsg = err.response?.data?.error || "Failed to send request.";
            alert(errorMsg);
        }
    };

    const handleDisconnect = async () => {
        if (!window.confirm("Are you sure you want to disconnect from your trainer?")) return;
        try {
            await API.post("/user/disconnect-trainer");
            setConnectionStatus("NONE");
            setConnectedTrainer(null);
            alert("Disconnected from trainer.");
        } catch (err) {
            console.log("Error disconnecting:", err);
            alert("Failed to disconnect.");
        }
    };

    const getButtonForTrainer = (trainerEmail) => {
        if (connectedTrainer === trainerEmail) {
            if (connectionStatus === "PENDING") {
                return (
                    <button className="modern-btn" style={{ background: "#fef9c3", color: "#eab308", border: "1px solid #fef08a", display: "flex", gap: "8px", padding: "8px 16px", borderRadius: "8px", cursor: "default" }} disabled>
                        <Clock size={16} /> Pending
                    </button>
                );
            }
            if (connectionStatus === "APPROVED") {
                return (
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button className="modern-btn" style={{ background: "#dcfce7", color: "#22c55e", border: "1px solid #bbf7d0", display: "flex", gap: "8px", padding: "8px 16px", borderRadius: "8px", cursor: "default" }} disabled>
                            <UserCheck size={16} /> Connected
                        </button>
                        <button
                            className="modern-btn"
                            onClick={() => navigate(`/messages/${trainerEmail}`)}
                            style={{
                                background: "#3b82f6", color: "white", border: "none",
                                display: "flex", gap: "6px", padding: "8px 16px",
                                borderRadius: "8px", cursor: "pointer", fontSize: "13px"
                            }}
                        >
                            <MessageCircle size={16} /> Message
                        </button>
                        <button
                            className="modern-btn"
                            onClick={handleDisconnect}
                            style={{
                                background: "#fee2e2", color: "#ef4444", border: "1px solid #fecaca",
                                display: "flex", gap: "6px", padding: "8px 16px",
                                borderRadius: "8px", cursor: "pointer", fontSize: "13px"
                            }}
                        >
                            <UserMinus size={16} /> Disconnect
                        </button>
                    </div>
                );
            }
        }

        const isDisabled = connectionStatus === "PENDING" || connectionStatus === "APPROVED";
        return (
            <button
                className="modern-btn primary"
                onClick={() => handleConnect(trainerEmail)}
                disabled={isDisabled}
                style={{
                    display: "flex", gap: "8px", padding: "8px 16px", borderRadius: "8px",
                    background: isDisabled ? "#e2e8f0" : "#3b82f6",
                    color: isDisabled ? "#94a3b8" : "white",
                    border: "none", cursor: isDisabled ? "not-allowed" : "pointer"
                }}
            >
                <UserPlus size={16} /> Connect
            </button>
        );
    };

    return (
        <div>
            <div className="header-row">
                <div>
                    <h1 className="welcome-title">Find a Trainer</h1>
                    <p className="welcome-subtitle">Connect with a professional to track your progress</p>
                </div>
            </div>

            {connectionStatus === "PENDING" && connectedTrainer && (
                <div style={{ background: "#fef9c3", padding: "12px 16px", borderRadius: "12px", marginBottom: "16px", color: "#ca8a04", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Clock size={16} /> Your connection request to <strong>{connectedTrainer}</strong> is pending approval.
                </div>
            )}
            {connectionStatus === "APPROVED" && connectedTrainer && (
                <div style={{ background: "#dcfce7", padding: "12px 16px", borderRadius: "12px", marginBottom: "16px", color: "#16a34a", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <UserCheck size={16} /> You are connected to <strong>{connectedTrainer}</strong>. You can now message them!
                </div>
            )}

            <div className="section">
                <div className="section-title">Expert Guidance</div>

                {loading ? (
                    <div className="form-card" style={{ textAlign: "center", color: "#64748b", padding: '40px' }}>
                        <Clock size={40} className="animate-pulse" style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                        <p>Finding the best matches for you...</p>
                    </div>
                ) : (
                    <div className="activity-grid">
                        {trainers.length > 0 ? (
                            trainers.map((trainer) => (
                                <div key={trainer.id || trainer.email} className="form-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', border: trainer.recommended ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid var(--glass-border)', position: 'relative', overflow: 'hidden' }}>
                                    {trainer.recommended && (
                                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--accent-blue)', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.5px' }}>TOP MATCH</div>
                                    )}
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                <User size={32} color="#94a3b8" />
                                            </div>
                                            <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '16px', height: '16px', borderRadius: '50%', background: '#22c55e', border: '2px solid #020617' }}></div>
                                        </div>
                                        <div>
                                            <div className="font-semibold" style={{ fontSize: '18px', color: '#fff' }}>{trainer.name || "Master Coach"}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--accent-teal)', fontWeight: '600' }}>{trainer.specialization || "Expert Trainer"}</div>
                                        </div>
                                    </div>

                                    <div style={{ flex: 1, marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '8px', color: '#94a3b8' }}>Personal Training</span>
                                            <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '8px', color: '#94a3b8' }}>Diet Plans</span>
                                        </div>
                                    </div>

                                    <div style={{ pt: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        {getButtonForTrainer(trainer.email)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="form-card" style={{ gridColumn: '1 / -1', textAlign: "center", color: "#64748b", padding: '60px' }}>
                                <User size={48} style={{ margin: '0 auto 16px', opacity: 0.1 }} />
                                <p>No trainers found. Check back later!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
