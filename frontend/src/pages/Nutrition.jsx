import React from "react";

export default function Nutrition() {
    return (
        <div>
            <div className="header-row">
                <div>
                    <h1 className="welcome-title">Nutrition</h1>
                    <p className="welcome-subtitle">Track your daily meals</p>
                </div>
            </div>

            <div className="section">
                <div className="section-title">Today's Meals</div>

                <div className="card-item highlight">
                    <div>
                        <div className="font-semibold">Breakfast</div>
                        <div className="sub-text">Oatmeal & Eggs</div>
                    </div>
                    <div className="font-semibold">450 kcal</div>
                </div>

                <div className="card-item">
                    <div>
                        <div className="font-semibold" style={{ color: "#3b82f6" }}>+ Add Lunch</div>
                        <div className="sub-text">Recommend 600-800 kcal</div>
                    </div>
                </div>

                <div className="card-item">
                    <div>
                        <div className="font-semibold" style={{ color: "#3b82f6" }}>+ Add Dinner</div>
                        <div className="sub-text">Recommend 500-700 kcal</div>
                    </div>
                </div>
            </div>

            <div className="section">
                <div className="section-title">Hydration</div>
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Water Intake</span>
                    </div>
                    <div className="stat-value" style={{ color: "#3b82f6" }}>1.2 / 2.5 L</div>
                </div>
            </div>
        </div>
    );
}
