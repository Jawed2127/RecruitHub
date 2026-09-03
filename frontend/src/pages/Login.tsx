import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  LockKeyhole,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/users/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Store JWT tokens
        localStorage.setItem(
          "access_token",
          data.access
        );

        localStorage.setItem(
          "refresh_token",
          data.refresh
        );

        setMessage("Login successful!");

        // Go to dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        setMessage(
          data.detail ||
            "Invalid username or password."
        );
      }
    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        "Cannot connect to the backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* ==========================================
          LEFT SIDE - BRANDING
      ========================================== */}

      <div className="login-brand-section">

        <div className="login-brand-content">

          <div className="login-logo">
            <BriefcaseBusiness size={32} />
            <span>RecruitHub</span>
          </div>

          <div className="login-brand-text">

            <h1>
              Find the right talent.
              <br />
              Build your future.
            </h1>

            <p>
              A smarter recruitment platform connecting
              talented candidates with great opportunities.
            </p>

          </div>

          <div className="login-features">

            <div className="login-feature">
              <div className="login-feature-icon">
                <BriefcaseBusiness size={20} />
              </div>

              <div>
                <strong>Find Opportunities</strong>
                <span>
                  Discover jobs that match your skills.
                </span>
              </div>
            </div>

            <div className="login-feature">
              <div className="login-feature-icon">
                <User size={20} />
              </div>

              <div>
                <strong>Connect with Recruiters</strong>
                <span>
                  Apply directly to companies and recruiters.
                </span>
              </div>
            </div>

            <div className="login-feature">
              <div className="login-feature-icon">
                <ShieldCheck size={20} />
              </div>

              <div>
                <strong>Secure Platform</strong>
                <span>
                  Your account is protected with secure authentication.
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>


      {/* ==========================================
          RIGHT SIDE - LOGIN
      ========================================== */}

      <div className="login-form-section">

        <div className="login-card">

          <div className="login-mobile-logo">
            <BriefcaseBusiness size={28} />
            <span>RecruitHub</span>
          </div>

          <div className="login-heading">

            <h2>Welcome back</h2>

            <p>
              Sign in to continue to your account.
            </p>

          </div>


          <form onSubmit={handleLogin}>

            {/* USERNAME */}

            <div className="login-input-group">

              <label htmlFor="username">
                Username
              </label>

              <div className="login-input-wrapper">

                <User size={19} />

                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  required
                  autoComplete="username"
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="login-input-group">

              <div className="login-password-label">

                <label htmlFor="password">
                  Password
                </label>

              </div>

              <div className="login-input-wrapper">

                <LockKeyhole size={19} />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

            </div>


            {/* MESSAGE */}

            {message && (
              <div
                className={`login-message ${
                  message === "Login successful!"
                    ? "success"
                    : "error"
                }`}
              >
                {message}
              </div>
            )}


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={19} />
                </>
              )}

            </button>

          </form>


          {/* REGISTER */}

          <div className="login-register">

            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              onClick={() => navigate("/register")}
            >
              Create an account
            </button>

          </div>

          <div className="login-footer">
            <span>© 2026 RecruitHub</span>
            <span>Secure Recruitment Platform</span>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;