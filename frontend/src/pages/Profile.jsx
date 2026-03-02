import React, { useState } from "react";
import { User, Target, Save, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);

    // Profile data state
    const [profile, setProfile] = useState({
        name: localStorage.getItem("name") || "User",
        email: localStorage.getItem("email") || "user@example.com",
        age: "25",
        weight: "70",
        height: "175",
        targetCalories: "2000",
        targetWater: "2.5",
        password: ""
    });

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = (e) => {
        e.preventDefault();
        // Simulate API save
        localStorage.setItem("name", profile.name);
        setIsEditing(false);
        // Real app would send a PUT/PATCH to the backend here
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div>
            <div className="header-row">
                <div>
                    <h1 className="welcome-title">Profile & Goals</h1>
                    <p className="welcome-subtitle">Manage your account and daily targets</p>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Left Column: Profile Form */}
                <div className="section">
                    <div style={{ background: "#ffffff", padding: "32px", borderRadius: "24px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div className="profile-avatar-large" style={{ width: "72px", height: "72px", fontSize: "28px", marginBottom: 0 }}>
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: "20px", color: "#0f172a" }}>{profile.name}</h2>
                                    <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>{profile.email}</p>
                                </div>
                            </div>
                            <button
                                className="modern-btn"
                                style={{ width: "auto", padding: "8px 16px", fontSize: "14px", background: isEditing ? "#e2e8f0" : "#3b82f6", color: isEditing ? "#0f172a" : "white" }}
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? "Cancel" : "Edit Profile"}
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="form-row">
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input className="form-input" name="name" value={profile.name} onChange={handleChange} disabled={!isEditing} />
                                </div>
                                <div className="form-group">
                                    <label>Age</label>
                                    <input className="form-input" name="age" type="number" value={profile.age} onChange={handleChange} disabled={!isEditing} />
                                </div>
                                <div className="form-group">
                                    <label>Weight (kg)</label>
                                    <input className="form-input" name="weight" type="number" value={profile.weight} onChange={handleChange} disabled={!isEditing} />
                                </div>
                                <div className="form-group">
                                    <label>Height (cm)</label>
                                    <input className="form-input" name="height" type="number" value={profile.height} onChange={handleChange} disabled={!isEditing} />
                                </div>
                            </div>

                            {isEditing && (
                                <>
                                    <div className="form-group" style={{ marginTop: "8px" }}>
                                        <label>New Password (leave blank to keep current)</label>
                                        <input className="form-input" name="password" type="password" placeholder="••••••••" value={profile.password} onChange={handleChange} />
                                    </div>
                                    <button type="submit" className="modern-btn primary" style={{ marginTop: "16px" }}>
                                        <Save size={18} /> Save Changes
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                </div>

                {/* Right Column: Targets & Settings */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div className="section" style={{ margin: 0 }}>
                        <div className="section-title" style={{ fontSize: "16px" }}>Daily Targets</div>
                        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "20px", border: "1px solid #f1f5f9" }}>
                            <div className="form-group" style={{ marginBottom: "16px" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Target size={14} color="#f97316" /> Target Calories
                                </label>
                                <input className="form-input" name="targetCalories" type="number" value={profile.targetCalories} onChange={handleChange} disabled={!isEditing} />
                                <span className="sub-text" style={{ fontSize: "12px", marginTop: "4px" }}>kcal per day</span>
                            </div>
                            <div className="form-group">
                                <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Target size={14} color="#3b82f6" /> Target Water Intake
                                </label>
                                <input className="form-input" name="targetWater" type="number" value={profile.targetWater} onChange={handleChange} disabled={!isEditing} />
                                <span className="sub-text" style={{ fontSize: "12px", marginTop: "4px" }}>Liters per day</span>
                            </div>
                        </div>
                    </div>

                    <div className="settings-list" style={{ marginTop: "auto" }}>
                        <div className="settings-item" onClick={handleLogout}>
                            <div className="settings-item-left">
                                <div className="settings-icon logout-icon"><LogOut size={20} /></div>
                                <span className="logout-text">Log Out</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
