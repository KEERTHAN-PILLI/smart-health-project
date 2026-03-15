import React, { useState, useEffect } from "react";
import API from "../api/axios";
import { Plus, Flame, Droplet, Coffee, Utensils, Moon, Sparkles, CheckCircle2 } from "lucide-react";

const MEAL_SUGGESTIONS = {
    "Breakfast": [
        { foodItems: "Greek Yogurt & Berries", calories: 300, protein: 15 },
        { foodItems: "Oatmeal with Almonds", calories: 350, protein: 10 }
    ],
    "Lunch": [
        { foodItems: "Grilled Chicken Salad", calories: 450, protein: 35 },
        { foodItems: "Quinoa Veggie Bowl", calories: 400, protein: 12 }
    ],
    "Dinner": [
        { foodItems: "Baked Salmon & Asparagus", calories: 500, protein: 40 },
        { foodItems: "Turkey Stir-fry", calories: 450, protein: 30 }
    ],
    "Snack": [
        { foodItems: "Apple & Peanut Butter", calories: 200, protein: 4 },
        { foodItems: "Protein Shake", calories: 150, protein: 25 }
    ]
};

export default function Nutrition() {
    const [logs, setLogs] = useState([]);
    const [profile, setProfile] = useState({ targetCalories: 2000, targetWater: 2.5 });
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        mealCategory: "Breakfast",
        foodItems: "",
        calories: "",
        protein: ""
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [profileRes, nutritionRes] = await Promise.all([
                API.get("/user/profile").catch(() => ({ data: {} })),
                API.get("/user/nutrition").catch(() => ({ data: [] }))
            ]);

            if (profileRes.data) {
                setProfile({
                    targetCalories: profileRes.data.targetCalories || 2000,
                    targetWater: profileRes.data.targetWater || 2.5
                });
            }
            if (Array.isArray(nutritionRes.data)) {
                setLogs(nutritionRes.data);
            }
        } catch (error) {
            console.error("Error loading nutrition data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMeal = async (data) => {
        try {
            const mealData = data || {
                mealCategory: formData.mealCategory,
                foodItems: formData.foodItems,
                calories: parseInt(formData.calories) || 0,
                protein: parseFloat(formData.protein) || 0.0
            };

            const res = await API.post("/user/nutrition", mealData);
            setLogs([...logs, res.data]);
            setShowForm(false);
            setFormData({ mealCategory: "Breakfast", foodItems: "", calories: "", protein: "" });
        } catch (error) {
            alert("Failed to log meal.");
        }
    };

    const quickLog = (category, suggestion) => {
        handleAddMeal({
            mealCategory: category,
            ...suggestion
        });
    };

    const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);
    const remainingCalories = profile.targetCalories - totalCalories;

    const getIconForCategory = (category) => {
        if (category === "Breakfast") return <Coffee size={20} />;
        if (category === "Lunch") return <Utensils size={20} />;
        if (category === "Dinner") return <Moon size={20} />;
        return <Flame size={20} />; // Snack
    };

    const categorizeLogs = () => {
        const categories = { "Breakfast": [], "Lunch": [], "Dinner": [], "Snack": [] };
        logs.forEach(log => {
            if (categories[log.mealCategory]) {
                categories[log.mealCategory].push(log);
            } else {
                categories["Snack"].push(log);
            }
        });
        return categories;
    };

    const groupedLogs = categorizeLogs();

    return (
        <div className="nutrition-container">
            <div className="header-row">
                <div>
                    <h1 className="welcome-title">Nutrition Tracker</h1>
                    <p className="welcome-subtitle">Log your meals and hit your targets</p>
                </div>
                <div className="calorie-summary glass" style={{ padding: "12px 20px", borderRadius: "16px", textAlign: "right" }}>
                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Target Progress</div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: remainingCalories >= 0 ? "#0f172a" : "#ef4444" }}>
                        {totalCalories} / {profile.targetCalories} <span style={{ fontSize: "14px" }}>kcal</span>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ background: "white", color: "#0f172a", maxWidth: "500px", width: "90%" }}>
                        <h3 style={{ marginBottom: "20px" }}>Log a Meal</h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleAddMeal(); }}>
                             <div className="form-group" style={{ marginBottom: "15px" }}>
                                <label>Meal Category</label>
                                <select className="form-input" value={formData.mealCategory} onChange={(e) => setFormData({...formData, mealCategory: e.target.value})}>
                                    <option value="Breakfast">Breakfast</option>
                                    <option value="Lunch">Lunch</option>
                                    <option value="Dinner">Dinner</option>
                                    <option value="Snack">Snack</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: "15px" }}>
                                <label>Food Items</label>
                                <input className="form-input" placeholder="e.g. 2 Eggs, Oatmeal" required value={formData.foodItems} onChange={(e) => setFormData({...formData, foodItems: e.target.value})} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                                <div className="form-group">
                                    <label>Calories (kcal)</label>
                                    <input className="form-input" type="number" required value={formData.calories} onChange={(e) => setFormData({...formData, calories: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Protein (g)</label>
                                    <input className="form-input" type="number" step="0.1" value={formData.protein} onChange={(e) => setFormData({...formData, protein: e.target.value})} />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button type="submit" className="modern-btn primary" style={{ flex: 1 }}>Save Meal</button>
                                <button type="button" className="modern-btn" onClick={() => setShowForm(false)} style={{ background: "#f1f5f9", color: "#475569" }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="section">
                <div className="section-title">Today's Nutrition Hub</div>
                
                <div className="activity-grid">
                    {Object.keys(groupedLogs).map(category => (
                        <div key={category} className="form-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ background: "rgba(59, 130, 246, 0.15)", padding: "10px", borderRadius: "14px", color: "var(--accent-blue)" }}>
                                        {getIconForCategory(category)}
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: '800', color: '#fff' }}>{category}</h3>
                                </div>
                                <button className="add-meal-inline-btn" style={{ padding: '8px 12px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-blue)', border: '1px solid rgba(59, 130, 246, 0.3)' }} onClick={() => { setFormData({...formData, mealCategory: category}); setShowForm(true); }}>
                                    <Plus size={16} />
                                </button>
                            </div>

                            {/* Logs for this category */}
                            <div className="meal-logs" style={{ minHeight: '100px' }}>
                                {groupedLogs[category].length > 0 ? (
                                    groupedLogs[category].map(log => (
                                        <div key={log.id} className="meal-log-item" style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <CheckCircle2 size={14} color="#22c55e" />
                                                <span style={{ fontWeight: "500", fontSize: '13px', color: '#cbd5e1' }}>{log.foodItems}</span>
                                            </div>
                                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                                <span className="log-stat highlight" style={{ fontSize: '12px', fontWeight: '700' }}>{log.calories} kcal</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '20px 0', color: '#64748b', fontSize: '12px', fontStyle: 'italic', textAlign: 'center' }}>No meals logged yet.</div>
                                )}
                            </div>

                            {/* Suggestions */}
                            <div style={{ marginTop: "auto", pt: "16px", borderTop: "1px dashed rgba(255,255,255,0.1)" }}>
                                <div style={{ fontSize: "10px", color: "var(--accent-teal)", fontWeight: "900", display: "flex", alignItems: "center", gap: "4px", marginBottom: "12px", letterSpacing: '0.5px' }}>
                                    <Sparkles size={10} /> QUICK LOG
                                </div>
                                <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", scrollbarWidth: 'none' }}>
                                    {MEAL_SUGGESTIONS[category].map((s, idx) => (
                                        <div key={idx} className="suggestion-chip" style={{ padding: '8px 14px', minWidth: '130px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} onClick={() => quickLog(category, s)}>
                                            <div className="sug-name" style={{ fontSize: '12px', color: '#fff', fontWeight: '600' }}>{s.foodItems}</div>
                                            <div className="sug-meta" style={{ fontSize: '10px', color: '#94a3b8' }}>{s.calories} kcal</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .meal-log-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid rgba(0,0,0,0.03);
                }
                .meal-log-item:last-child { border-bottom: none; }
                .log-stat { font-size: 13px; color: #64748b; font-weight: 500; }
                .log-stat.highlight { color: #ef4444; font-weight: 600; }
                .no-logs { padding: 10px 0; color: #94a3b8; font-style: italic; font-size: 13px; }
                .add-meal-inline-btn {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: 0.2s;
                }
                .add-meal-inline-btn:hover { background: #2563eb; transform: translateY(-1px); }
                .suggestion-chip {
                    background: rgba(255, 255, 255, 0.8);
                    border: 1px solid #e2e8f0;
                    padding: 10px 16px;
                    border-radius: 14px;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: 0.2s;
                    min-width: 150px;
                }
                .suggestion-chip:hover {
                    border-color: #3b82f6;
                    background: #f0f7ff;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
                }
                .sug-name { font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 2px; }
                .sug-meta { font-size: 11px; color: #64748b; }
                
                /* Modal */
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    padding: 30px;
                    border-radius: 24px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                }
            `}} />
        </div>
    );
}

