import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      alert("Login Failed");
    }
  };

  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh" }}>
      <div className="glass" style={{ width:"350px" }}>
        <h2>Smart Health Login</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} style={{ width:"100%", padding:"10px", marginBottom:"10px" }}/>
          <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} style={{ width:"100%", padding:"10px", marginBottom:"10px" }}/>
          <button className="btn-modern" style={{ width:"100%" }}>Login</button>
        </form>
        <p style={{ marginTop:"10px" }}>
          No account? <Link to="/register" style={{ color:"#00c6ff" }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
