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

      <div className="activity-grid">
        <div className="section">
          <div className="section-title">Calculate Your BMI</div>
          <div className="form-card">
            <form onSubmit={calculateBmi} className="form-row">
              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  className="form-input"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
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
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
                  type="number"
                  placeholder="e.g. 70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <button type="submit" className="modern-btn primary" style={{ marginTop: "16px", borderRadius: '14px', height: '54px' }}>
                <Scale size={20} /> Calculate Now
              </button>
            </form>
          </div>
        </div>

        <div className="section">
          <div className="section-title">Your Health Status</div>
          {bmiResult ? (
            <div className="form-card" style={{ textAlign: "center", border: `2px solid ${bmiResult.color}80`, animation: "fadeIn 0.5s ease" }}>
              <div style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "600", letterSpacing: '1px', textTransform: 'uppercase', marginBottom: "12px" }}>BMI Score</div>
              <div style={{ fontSize: "64px", fontWeight: "900", color: bmiResult.color, textShadow: `0 0 20px ${bmiResult.color}40`, marginBottom: "8px" }}>
                {bmiResult.value}
              </div>
              <div style={{ display: "inline-block", background: `${bmiResult.color}20`, color: bmiResult.color, padding: "8px 24px", borderRadius: "14px", fontWeight: "800", fontSize: "18px", marginBottom: "24px", border: `1px solid ${bmiResult.color}40` }}>
                {bmiResult.category}
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "18px", textAlign: "left", border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '12px' }}>
                  <Info size={24} color="#3b82f6" />
                </div>
                <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.6" }}>
                  {bmiResult.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="form-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: '#64748b', textAlign: 'center' }}>
              <Scale size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
              <p>Enter your details to see your <br/>Body Mass Index result.</p>
            </div>
          )}
        </div>
      </div>
        </div>
    );
}
