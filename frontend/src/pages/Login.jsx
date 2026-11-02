
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneCall, Mail, Lock, Eye, EyeOff, Bot } from "lucide-react";
import "../styles/Placeholder.css";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-left">
        <div className="login-brand">
          <div className="brand-icon">
            <PhoneCall size={25} />
          </div>
          <span>VoiceFlow AI</span>
        </div>

        <div className="login-hero">
          <div className="hero-tag">
            <Bot size={15} />
            Intelligent Calling Platform
          </div>

          <h1>
            Every Lead.
            <br />
            Every Conversation.
            <br />
            <span>Powered by AI.</span>
          </h1>

          <p>
            Manage leads, automate conversations and
            understand every customer interaction
            from one intelligent platform.
          </p>

          <div className="hero-features">
            <div>
              <PhoneCall size={19} />
              <span>AI Powered Calling</span>
            </div>

            <div>
              <Bot size={19} />
              <span>Smart Conversations</span>
            </div>

            <div>
              <Lock size={19} />
              <span>Secure Management</span>
            </div>
          </div>
        </div>

        <div className="login-footer">
          © 2026 VoiceFlow AI. All rights reserved.
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrapper">

          <div className="mobile-brand">
            <PhoneCall size={24} />
            <span>VoiceFlow AI</span>
          </div>

          <div className="form-heading">
            <span className="welcome-label">
              WELCOME BACK
            </span>

            <h2>Sign in to your account</h2>

            <p>
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Email Address</label>

              <div className="input-wrapper">
                <Mail size={19} />

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>

              <div className="input-wrapper">
                <Lock size={19} />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          <div className="login-security">
            <Lock size={14} />
            Your account is protected with secure authentication.
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;
