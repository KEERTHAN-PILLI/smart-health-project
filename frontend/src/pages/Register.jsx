import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", { email, password });
      alert("Registration Successful");
      navigate("/");
    } catch (err) {
      alert("Registration Failed");
    }
  };

  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh" }}>
      <div className="glass" style={{ width:"350px" }}>
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            onChange={(e)=>setEmail(e.target.value)}
            style={{ width:"100%", padding:"10px", marginBottom:"10px" }}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e)=>setPassword(e.target.value)}
            style={{ width:"100%", padding:"10px", marginBottom:"10px" }}
          />
          <button className="btn-modern" style={{ width:"100%" }}>
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
