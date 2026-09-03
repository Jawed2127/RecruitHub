import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  User,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  UserRound,
  Building2,
} from "lucide-react";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/users/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
            role,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Registration successful! Redirecting to login..."
        );
        setMessageType("success");

        setUsername("");
        setEmail("");
        setPassword("");
        setRole("candidate");

        setTimeout(() => {
          navigate("/login");
        }, 1200);
      } else {
        setMessage(
          data.username?.[0] ||
            data.email?.[0] ||
            data.password?.[0] ||
            data.role?.[0] ||
            "Registration failed. Please try again."
        );

        setMessageType("error");
      }
    } catch (error) {
      console.error("Registration error:", error);

      setMessage(
        "Cannot connect to the backend server."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* ==========================================
          LEFT BRANDING SECTION
          ========================================== */}

      <div className="register-brand">

        <div className="brand-content">

          <div className="brand-logo">
            <BriefcaseBusiness size={30} />
          </div>

          <h1>
            Resume Recruitment
            <span> Platform</span>
          </h1>

          <p>
            Build your professional profile,
            discover opportunities, and connect
            with the right employers.
          </p>

          <div className="register-benefits">

            <div className="register-benefit">
              <ShieldCheck size={20} />
              <span>
                Secure account authentication
              </span>
            </div>

            <div className="register-benefit">
              <UserRound size={20} />
              <span>
                Personalized candidate experience
              </span>
            </div>

            <div className="register-benefit">
              <Building2 size={20} />
              <span>
                Connect with recruiters and companies
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* ==========================================
          REGISTER FORM
          ========================================== */}

      <div className="register-form-section">

        <div className="register-card">

          <div className="register-header">

            <h2>Create your account</h2>

            <p>
              Join our recruitment platform and
              start your journey.
            </p>

          </div>

          <form onSubmit={handleRegister}>

            {/* Username */}

            <div className="register-field">

              <label htmlFor="username">
                Username
              </label>

              <div className="register-input-wrapper">

                <User
                  size={18}
                  className="register-input-icon"
                />

                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  required
                />

              </div>

            </div>

            {/* Email */}

            <div className="register-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="register-input-wrapper">

                <Mail
                  size={18}
                  className="register-input-icon"
                />

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />

              </div>

            </div>

            {/* Password */}

            <div className="register-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="register-input-wrapper">

                <LockKeyhole
                  size={18}
                  className="register-input-icon"
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  minLength={6}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

              <small>
                Password must contain at least 6 characters.
              </small>

            </div>

            {/* Role */}

            <div className="register-field">

              <label>
                Register as
              </label>

              <div className="role-options">

                <button
                  type="button"
                  className={`role-option ${
                    role === "candidate"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setRole("candidate")
                  }
                >
                  <UserRound size={20} />

                  <div>
                    <strong>Candidate</strong>
                    <span>
                      Find and apply for jobs
                    </span>
                  </div>

                </button>

                <button
                  type="button"
                  className={`role-option ${
                    role === "recruiter"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setRole("recruiter")
                  }
                >
                  <Building2 size={20} />

                  <div>
                    <strong>Recruiter</strong>
                    <span>
                      Post and manage jobs
                    </span>
                  </div>

                </button>

              </div>

            </div>

            {/* Message */}

            {message && (
              <div
                className={`register-message ${
                  messageType
                }`}
              >
                {message}
              </div>
            )}

            {/* Register button */}

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          {/* Login */}

          <div className="login-link">

            <span>
              Already have an account?
            </span>

            <button
              onClick={() =>
                navigate("/login")
              }
            >
              Login
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;  