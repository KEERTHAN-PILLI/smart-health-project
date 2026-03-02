import React, { useEffect, useState } from "react";
import { UserPlus, UserCheck, Clock, User } from "lucide-react";
import API from "../api/axios";

export default function FindTrainers() {
    const [trainers, setTrainers] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState("NONE");
    const [connectedTrainer, setConnectedTrainer] = useState(null);

    useEffect(() => {
        fetchTrainers();
        fetchConnectionStatus();
    }, []);

    const fetchTrainers = async () => {
        try {
            const res = await API.get("/user/trainers");
            setTrainers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.log(err);
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
            console.log(err);
        }
    };

    const handleConnect = async (trainerEmail) => {
        try {
            await API.post("/user/connect-trainer", { trainerEmail });
            setConnectionStatus("PENDING");
            setConnectedTrainer(trainerEmail);
            alert("Connection request sent!");
        } catch (err) {
            console.log(err);
            alert("Failed to send request.");
        }
    };

    return (
        <div>
            <div className="header-row">
                <div>
                    <h1 className="welcome-title">Find a Trainer</h1>
                    <p className="welcome-subtitle">Connect with a professional to track your progress</p>
                </div>
            </div>

            <div className="section">
                <div className="section-title">Available Trainers</div>

                {trainers.length > 0 ? (
                    trainers.map((trainer) => (
                        <div key={trainer.id} className="card-item">
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ background: "#e2e8f0", padding: "10px", borderRadius: "12px", color: "#475569" }}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <div className="font-semibold">{trainer.name || "Trainer"}</div>
                                    <div className="sub-text">{trainer.email}</div>
                                </div>
                            </div>

                            {/* Action Button Logic based on status */}
                            {connectedTrainer === trainer.email ? (
                                connectionStatus === "PENDING" ? (
                                    <button className="modern-btn" style={{ background: "#fef9c3", color: "#eab308", border: "1px solid #fef08a", display: "flex", gap: "8px", padding: "8px 16px" }} disabled>
                                        <Clock size={16} /> Pending
                                    </button>
                                ) : connectionStatus === "APPROVED" ? (
                                    <button className="modern-btn" style={{ background: "#dcfce7", color: "#22c55e", border: "1px solid #bbf7d0", display: "flex", gap: "8px", padding: "8px 16px" }} disabled>
                                        <UserCheck size={16} /> Connected
                                    </button>
                                ) : (
                                    <button
                                        className="modern-btn primary"
                                        onClick={() => handleConnect(trainer.email)}
                                        style={{ display: "flex", gap: "8px", padding: "8px 16px" }}
                                    >
                                        <UserPlus size={16} /> Connect
                                    </button>
                                )
                            ) : (
                                <button
                                    className="modern-btn primary"
                                    onClick={() => handleConnect(trainer.email)}
                                    disabled={connectionStatus === "PENDING" || connectionStatus === "APPROVED"}
                                    style={{
                                        display: "flex", gap: "8px", padding: "8px 16px",
                                        opacity: (connectionStatus === "PENDING" || connectionStatus === "APPROVED") ? 0.5 : 1
                                    }}
                                >
                                    <UserPlus size={16} /> Connect
                                </button>
                            )}

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
