import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { logout } = useContext(AuthContext);

  return (
    <div
      className="glass"
      style={{
        margin: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h3>Smart Health</h3>
      <button className="btn-modern" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

export default Navbar;
