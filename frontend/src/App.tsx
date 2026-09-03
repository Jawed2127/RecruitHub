import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Resume from "./pages/Resume";
import Applications from "./pages/Applications";
import JobAlert from "./pages/JobAlerts";
import RecruiterJobs from "./pages/RecruiterJobs";
import RecruiterApplications from "./pages/RecruiterApplications";
import SavedJobs from "./pages/SavedJobs";
import CreateJob from "./pages/CreateJob";
import RecruiterProfile from "./pages/RecruiterProfile";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==========================================
            AUTHENTICATION
        ========================================== */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* ==========================================
            CANDIDATE
        ========================================== */}

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/resume" element={<Resume />} />

        <Route path="/applications" element={<Applications />} />

        <Route path="/saved-jobs" element={<SavedJobs />} />

        <Route path="/job-alerts" element={<JobAlert />} />

        {/* ==========================================
            RECRUITER
        ========================================== */}

        <Route
          path="/recruiter/profile"
          element={<RecruiterProfile />}
        />

        <Route
          path="/recruiter/create-job"
          element={<CreateJob />}
        />

        <Route
          path="/recruiter/jobs"
          element={<RecruiterJobs />}
        />

        <Route
          path="/recruiter/applications"
          element={<RecruiterApplications />}
        />

        {/* ==========================================
            SETTINGS
        ========================================== */}

        <Route
          path="/settings"
          element={<Settings />}
        />

        {/* ==========================================
            DEFAULT
        ========================================== */}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* ==========================================
            UNKNOWN ROUTES
        ========================================== */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;