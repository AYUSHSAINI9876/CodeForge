import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../api/client";
import { useAuth } from "../../authContext";
import { useToast } from "../../context/ToastContext";
import Logo from "../common/Logo";
import OtpForm from "./OtpForm";

import "./auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState(null);

  const { setCurrentUser } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const handlePasswordStep = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await apiClient.post("/login", { email, password });
      setChallenge(res.data);
      showSuccess("We emailed you a verification code.");
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (code) => {
    try {
      setLoading(true);
      const res = await apiClient.post("/login/verify-otp", {
        challengeToken: challenge.challengeToken,
        code,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      setCurrentUser(res.data.userId);
      showSuccess(`Welcome back, ${res.data.user?.username || "there"}!`);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      showError(
        data?.attemptsLeft !== undefined
          ? `${data.message} ${data.attemptsLeft} attempt${data.attemptsLeft === 1 ? "" : "s"} left.`
          : data?.message || "Verification failed."
      );
      // An expired or exhausted challenge cannot be retried — restart cleanly.
      if (err.response?.status === 401) setChallenge(null);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      const res = await apiClient.post("/login/resend-otp", {
        challengeToken: challenge.challengeToken,
      });
      setChallenge(res.data);
      showSuccess("A new code is on its way.");
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Could not resend the code.");
      if (err.response?.status === 401) setChallenge(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box-wrapper">
        <div className="login-brand">
          <Logo size={56} />
          <span className="login-brand-name">CodeForge</span>
        </div>

        <div className="login-heading">
          <h1>{challenge ? "Check your inbox" : "Sign in to CodeForge"}</h1>
          {!challenge && <p className="login-subheading">Forge better software, together.</p>}
        </div>

        {challenge ? (
          <OtpForm
            maskedEmail={challenge.maskedEmail}
            expiresInMinutes={challenge.expiresInMinutes}
            resendAfterSeconds={challenge.resendAfterSeconds}
            devFallback={challenge.devFallback}
            loading={loading}
            onVerify={handleVerify}
            onResend={handleResend}
            onBack={() => setChallenge(null)}
          />
        ) : (
          <form className="login-box" onSubmit={handlePasswordStep}>
            <div className="field">
              <label className="label" htmlFor="Email">Email address</label>
              <div className="input-with-icon">
                <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                <input
                  autoComplete="email"
                  id="Email"
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="Password">Password</label>
              <div className="input-with-icon">
                <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  autoComplete="current-password"
                  id="Password"
                  className="input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"></path>
                      <path d="M6.61 6.61A18.15 18.15 0 0 0 2 12s3 8 10 8a9.12 9.12 0 0 0 5.39-1.61"></path>
                      <line x1="2" y1="2" x2="22" y2="22"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn primary-btn" disabled={loading}>
              {loading ? "Verifying..." : "Continue"}
            </button>

            <p className="secure-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path>
              </svg>
              Protected by email two-factor verification
            </p>
          </form>
        )}

        {!challenge && (
          <div className="pass-box">
            <p>
              New to CodeForge? <Link to="/signup">Create an account</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
