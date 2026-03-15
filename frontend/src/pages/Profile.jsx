import React, { useState } from "react";
import { User, Target, Save, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Profile() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);

    // Profile data state
    const [profile, setProfile] = useState({
        name: localStorage.getItem("name") || "User",
        email: localStorage.getItem("email") || "user@example.com",
        age: "",
        weight: "",
        height: "",
        targetCalories: 2000,
        targetWater: 2.5,
        targetSleep: 8.0,
        password: ""
    });

    React.useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await API.get("/user/profile");
                if (res.data) {
                    setProfile(prev => ({
                        ...prev,
                        name: res.data.name || prev.name,
                        age: res.data.age || "",
                        weight: res.data.weight || "",
                        height: res.data.height || "",
                        targetCalories: res.data.targetCalories || 2000,
                        targetWater: res.data.targetWater || 2.5,
                        targetSleep: res.data.targetSleep || 8.0,
                    }));
                }
            } catch (err) {
                console.log("Error fetching profile", err);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await API.post("/user/profile", {
                name: profile.name,
                age: parseInt(profile.age) || 0,
                weight: parseFloat(profile.weight) || 0.0,
                height: parseFloat(profile.height) || 0.0,
                targetCalories: parseInt(profile.targetCalories) || 2000,
                targetWater: parseFloat(profile.targetWater) || 2.5,
                targetSleep: parseFloat(profile.targetSleep) || 8.0,
            });
            localStorage.setItem("name", profile.name); // Keep name sync for UI
            setIsEditing(false);
            alert("Profile saved successfully!");
        } catch (err) {
            console.error("Error saving profile", err);
            alert("Failed to save profile.");
        }
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
                    <div className="form-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                <div className="profile-avatar-large" style={{ width: "72px", height: "72px", fontSize: "28px", marginBottom: 0, border: '1px solid var(--accent-blue)' }}>
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: "22px", color: "#fff", fontWeight: '900' }}>{profile.name}</h2>
                                    <p style={{ margin: 0, color: "var(--accent-teal)", fontSize: "14px", fontWeight: '600' }}>{profile.email}</p>
                                </div>
                            </div>
                            <button
                                className="modern-btn"
                                style={{ width: "auto", padding: "8px 16px", fontSize: "14px", borderRadius: '12px', background: isEditing ? "rgba(255,255,255,0.1)" : "#3b82f6", color: "white" }}
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? "Cancel" : "Edit Profile"}
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="form-row">
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input className="form-input" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }} name="name" value={profile.name} onChange={handleChange} disabled={!isEditing} />
                                </div>
                                <div className="form-group">
                                    <label>Age</label>
                                    <input className="form-input" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }} name="age" type="number" value={profile.age} onChange={handleChange} disabled={!isEditing} />
                                </div>
                                <div className="form-group">
                                    <label>Weight (kg)</label>
                                    <input className="form-input" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }} name="weight" type="number" value={profile.weight} onChange={handleChange} disabled={!isEditing} />
                                </div>
                                <div className="form-group">
                                    <label>Height (cm)</label>
                                    <input className="form-input" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }} name="height" type="number" value={profile.height} onChange={handleChange} disabled={!isEditing} />
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
                            <div className="form-group" style={{ marginBottom: "16px" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Target size={14} color="#3b82f6" /> Target Water Intake
                                </label>
                                <input className="form-input" name="targetWater" type="number" step="0.1" value={profile.targetWater} onChange={handleChange} disabled={!isEditing} />
                                <span className="sub-text" style={{ fontSize: "12px", marginTop: "4px" }}>Liters per day</span>
                            </div>
                            <div className="form-group">
                                <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Target size={14} color="#8b5cf6" /> Target Sleep
                                </label>
                                <input className="form-input" name="targetSleep" type="number" step="0.1" value={profile.targetSleep} onChange={handleChange} disabled={!isEditing} />
                                <span className="sub-text" style={{ fontSize: "12px", marginTop: "4px" }}>Hours per day</span>
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
