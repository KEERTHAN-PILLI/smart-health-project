import React from "react";

export default function UserDashboard() {
  const name = localStorage.getItem("name") || "User";
  return (
    <div style={{ padding: "24px" }}>
      <h1>User Dashboard</h1>
      <p>Welcome, {name}. This is your health dashboard.</p>
    </div>
  );
}
