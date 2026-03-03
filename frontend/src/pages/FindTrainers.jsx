import React, { useEffect, useState } from "react";
import { UserPlus, UserCheck, Clock, User, MessageCircle } from "lucide-react";
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
            const res = await API.get("/user/trainers");
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
                <div className="section-title">Available Trainers</div>

                {loading ? (
                    <div className="card-item" style={{ justifyContent: "center", color: "#64748b" }}>
                        Loading trainers...
                    </div>
                ) : trainers.length > 0 ? (
                    trainers.map((trainer) => (
                        <div key={trainer.id || trainer.email} className="card-item">
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ background: "#e2e8f0", padding: "10px", borderRadius: "12px", color: "#475569" }}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <div className="font-semibold">{trainer.name || "Trainer"}</div>
                                    <div className="sub-text">{trainer.email}</div>
                                </div>
                            </div>
                            {getButtonForTrainer(trainer.email)}
                        </div>
                    ))
                ) : (
                    <div className="card-item" style={{ justifyContent: "center", color: "#64748b" }}>
                        No trainers are currently registered on the platform.
                    </div>
                )}
            </div>
        </div>
    );
}
