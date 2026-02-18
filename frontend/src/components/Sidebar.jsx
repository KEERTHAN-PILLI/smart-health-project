import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div
      className="glass"
      style={{
        width: "220px",
        margin: "10px",
        padding: "20px",
        transition: "0.3s ease",
      }}
    >
      <h4 style={{ marginBottom: "20px" }}>Menu</h4>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
        <Link to="/workouts" style={linkStyle}>Workouts</Link>
      </div>
    </div>
  );
};

const linkStyle = {
  color: "white",
  textDecoration: "none",
  padding: "10px",
  borderRadius: "10px",
  transition: "0.3s",
};

export default Sidebar;
