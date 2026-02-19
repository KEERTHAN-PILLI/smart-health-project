import React from "react";

export default function TrainerDashboard() {
  const name = localStorage.getItem("name") || "Trainer";
  return (
    <div style={{ padding: "24px" }}>
      <h1>Trainer Dashboard</h1>
      <p>Welcome, {name}. Here you can manage your clients.</p>
    </div>
  );
}
