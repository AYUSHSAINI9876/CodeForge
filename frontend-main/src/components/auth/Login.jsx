import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../authContext";

import "./auth.css";

import logo from "../../assets/github-mark-white.svg";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { setCurrentUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3002/login", {
        email: email,
        password: password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);

      setCurrentUser(res.data.userId);
      setLoading(false);

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Login Failed!");
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-logo-container">
        <img className="logo-login" src={logo} alt="Logo" />
      </div>

      <div className="login-box-wrapper">
        <div className="login-heading">
          <h1>Sign In to CodeForge</h1>
        </div>
        <div className="login-box">
          <div>
            <label className="label">Email address</label>
            <input
              autoComplete="off"
              name="Email"
              id="Email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              autoComplete="off"
              name="Password"
              id="Password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {errorMsg && <p style={{color: "var(--danger)", fontSize: "0.9rem", margin: 0, textAlign: "center"}}>{errorMsg}</p>}

          <button
            className="login-btn primary-btn"
            disabled={loading}
            onClick={handleLogin}
          >
            {loading ? "Loading..." : "Sign In"}
          </button>
        </div>
        <div className="pass-box">
          <p>
            New to CodeForge? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
