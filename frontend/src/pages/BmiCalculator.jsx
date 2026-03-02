import React, { useState } from "react";
import { Scale, Info } from "lucide-react";

export default function BmiCalculator() {
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [bmiResult, setBmiResult] = useState(null);

    const calculateBmi = (e) => {
        e.preventDefault();
        if (!height || !weight) return;

        const hInMeters = parseFloat(height) / 100;
        const w = parseFloat(weight);
        const bmi = w / (hInMeters * hInMeters);

        let category = "";
        let color = "";
        let message = "";

        if (bmi < 18.5) {
            category = "Underweight";
            color = "#eab308"; // yellow
            message = "You are currently underweight. Consider a balanced diet with more caloric intake and consult a healthcare provider.";
        } else if (bmi >= 18.5 && bmi < 24.9) {
            category = "Normal Weight";
            color = "#22c55e"; // green
            message = "Great job! You have a normal body weight. Keep up the good work with regular exercise and a healthy diet.";
        } else if (bmi >= 25 && bmi < 29.9) {
            category = "Overweight";
            color = "#f97316"; // orange
            message = "You are currently in the overweight category. Regular exercise and a balanced diet can help you reach a healthier weight.";
        } else {
            category = "Obese";
            color = "#ef4444"; // red
            message = "Your BMI falls in the obese category. It is highly recommended to consult a doctor or a nutritionist for a structured health plan.";
        }

        setBmiResult({
            value: bmi.toFixed(1),
            category,
            color,
            message
        });
    };

    return (
        <div>
            <div className="header-row">
                <div>
                    <h1 className="welcome-title">BMI Calculator</h1>
                    <p className="welcome-subtitle">Check your Body Mass Index</p>
                </div>
            </div>

            <div className="section">
                <div style={{ background: "#ffffff", padding: "24px", borderRadius: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9" }}>
                    <form onSubmit={calculateBmi} className="form-row">
                        <div className="form-group">
                            <label>Height (cm)</label>
                            <input
                                className="form-input"
                                type="number"
                                placeholder="e.g. 175"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Weight (kg)</label>
                            <input
                                className="form-input"
                                type="number"
                                placeholder="e.g. 70"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="modern-btn primary" style={{ marginTop: "16px" }}>
                            <Scale size={18} /> Calculate BMI
                        </button>
                    </form>
                </div>
            </div>

            {bmiResult && (
                <div className="section" style={{ animation: "fadeIn 0.4s ease" }}>
                    <div style={{ background: "#ffffff", padding: "32px 24px", borderRadius: "20px", border: `2px solid ${bmiResult.color}40`, textAlign: "center" }}>
                        <div style={{ fontSize: "16px", color: "#64748b", fontWeight: "500", marginBottom: "8px" }}>Your BMI Score</div>
                        <div style={{ fontSize: "48px", fontWeight: "700", color: bmiResult.color, marginBottom: "8px" }}>
                            {bmiResult.value}
                        </div>
                        <div style={{ display: "inline-block", background: `${bmiResult.color}15`, color: bmiResult.color, padding: "6px 16px", borderRadius: "20px", fontWeight: "600", fontSize: "16px", marginBottom: "16px" }}>
                            {bmiResult.category}
                        </div>

                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "#f8fafc", padding: "16px", borderRadius: "12px", textAlign: "left" }}>
                            <Info size={24} color="#3b82f6" style={{ flexShrink: 0, marginTop: "2px" }} />
                            <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.5" }}>
                                {bmiResult.message}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
