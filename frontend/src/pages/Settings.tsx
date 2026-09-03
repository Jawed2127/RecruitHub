import "./Settings.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, LogOut, ChevronRight, X } from "lucide-react";

function Settings() {
  const navigate = useNavigate();

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/users/change-password/",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
            confirm_password: confirmPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to change password.");
        return;
      }

      setMessage(data.message || "Password changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Change password error:", error);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closePasswordForm = () => {
    setShowPasswordForm(false);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setMessage("");
    setError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    navigate("/login");
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your account and application preferences.</p>
        </div>

        {/* Account */}
        <div className="settings-section">
          <h2>Account</h2>

          <div className="settings-item" onClick={() => navigate("/profile")}>
            <div className="settings-item-left">
              <div className="settings-icon">
                <User size={20} />
              </div>

              <div>
                <h3>My Profile</h3>
                <p>View and update your profile information</p>
              </div>
            </div>

            <ChevronRight size={20} />
          </div>

          <div
            className="settings-item"
            onClick={() => {
              setShowPasswordForm(true);
              setMessage("");
              setError("");
            }}
          >
            <div className="settings-item-left">
              <div className="settings-icon">
                <Lock size={20} />
              </div>

              <div>
                <h3>Change Password</h3>
                <p>Update your account password</p>
              </div>
            </div>

            <ChevronRight size={20} />
          </div>
        </div>

        {/* Account Actions */}
        <div className="settings-section">
          <h2>Account Actions</h2>

          <div className="settings-item logout-item" onClick={handleLogout}>
            <div className="settings-item-left">
              <div className="settings-icon logout-icon">
                <LogOut size={20} />
              </div>

              <div>
                <h3>Logout</h3>
                <p>Sign out of your RecruitHub account</p>
              </div>
            </div>

            <ChevronRight size={20} />
          </div>
        </div>

        {/* Change Password Form */}
        {showPasswordForm && (
          <div className="password-overlay">
            <div className="password-modal">
              <div className="password-modal-header">
                <div>
                  <h2>Change Password</h2>
                  <p>Enter your current password and choose a new password.</p>
                </div>

                <button
                  className="close-button"
                  onClick={closePasswordForm}
                  type="button"
                >
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleChangePassword}>
                {/* Current Password */}
                <div className="password-field">
                  <label htmlFor="currentPassword">Current Password</label>

                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                {/* New Password */}
                <div className="password-field">
                  <label htmlFor="newPassword">New Password</label>

                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Enter new password"
                    minLength={6}
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div className="password-field">
                  <label htmlFor="confirmPassword">Confirm New Password</label>

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm new password"
                    minLength={6}
                    required
                  />
                </div>

                {/* Error */}
                {error && <div className="password-error">{error}</div>}

                {/* Success */}
                {message && <div className="password-success">{message}</div>}

                {/* Buttons */}
                <div className="password-actions">
                  <button
                    type="button"
                    className="cancel-password-button"
                    onClick={closePasswordForm}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="change-password-button"
                    disabled={loading}
                  >
                    {loading ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
