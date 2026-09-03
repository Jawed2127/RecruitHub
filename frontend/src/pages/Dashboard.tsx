import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  User,
  FileText,
  BriefcaseBusiness,
  Bookmark,
  Bell,
  Settings,
  LogOut,
  ClipboardList,
  CalendarDays,
  Upload,
  Search,
  ArrowRight,
} from "lucide-react";

import "./Dashboard.css";

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface ApplicationData {
  id: number;
  job: number;
  job_title: string;
  company_name: string;
  candidate_username?: string;
  candidate_email?: string;
  status: string;
  applied_at: string;
  updated_at: string;
}

interface RecruiterDashboardStats {
  application_count: number;
  interview_count: number;
}

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<UserData | null>(null);

  const [message, setMessage] = useState("Loading profile...");

  const [applicationCount, setApplicationCount] = useState(0);

  const [interviewCount, setInterviewCount] = useState(0);

  const [savedJobCount, setSavedJobCount] = useState(0);

  const [jobAlertCount, setJobAlertCount] = useState(0);

  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // ==========================================
        // GET USER PROFILE
        // ==========================================

        const profileResponse = await fetch(
          "http://127.0.0.1:8000/api/users/profile/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!profileResponse.ok) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");

          navigate("/login");
          return;
        }

        const profileData: UserData =
          await profileResponse.json();

        setUser(profileData);
        setMessage("");

        // ==========================================
        // RECRUITER DASHBOARD
        // ==========================================

        if (profileData.role === "recruiter") {
          const [
            statsResponse,
            applicationsResponse,
          ] = await Promise.all([
            fetch(
              "http://127.0.0.1:8000/api/users/recruiter/dashboard-stats/",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            ),

            fetch(
              "http://127.0.0.1:8000/api/users/recruiter/applications/",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            ),
          ]);

          // ========================================
          // DASHBOARD STATISTICS
          // ========================================

          if (statsResponse.ok) {
            const statsData: RecruiterDashboardStats =
              await statsResponse.json();

            setApplicationCount(
              statsData.application_count
            );

            setInterviewCount(
              statsData.interview_count
            );
          }

          // ========================================
          // RECRUITER APPLICATIONS
          // ========================================

          if (applicationsResponse.ok) {
            const applicationsData: ApplicationData[] =
              await applicationsResponse.json();

            // Use the application list as a fallback
            // for the dashboard statistics.

            setApplicationCount(
              applicationsData.length
            );

            const interviews =
              applicationsData.filter(
                (application) =>
                  application.status.toLowerCase() ===
                  "interview"
              );

            setInterviewCount(
              interviews.length
            );
          }
        }

        // ==========================================
        // CANDIDATE DASHBOARD
        // ==========================================

        if (profileData.role === "candidate") {
          const [
            applicationsResponse,
            savedJobsResponse,
          ] = await Promise.all([
            fetch(
              "http://127.0.0.1:8000/api/users/applications/",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            ),

            fetch(
              "http://127.0.0.1:8000/api/users/saved-jobs/",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            ),
          ]);

          // ========================================
          // APPLICATIONS
          // ========================================

          if (applicationsResponse.ok) {
            const applicationsData: ApplicationData[] =
              await applicationsResponse.json();

            setApplicationCount(
              applicationsData.length
            );

            const interviews =
              applicationsData.filter(
                (application) =>
                  application.status.toLowerCase() ===
                  "interview"
              );

            setInterviewCount(
              interviews.length
            );
          }

          // ========================================
          // SAVED JOBS
          // ========================================

          if (savedJobsResponse.ok) {
            const savedJobsData =
              await savedJobsResponse.json();

            setSavedJobCount(
              savedJobsData.length
            );
          }

          // Job alerts are not implemented yet.
          setJobAlertCount(0);
        }

        setLoadingStats(false);
      } catch (error) {
        console.error(
          "Dashboard error:",
          error
        );

        setMessage(
          "Cannot connect to the backend server"
        );

        setLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    navigate("/login");
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (
    !user &&
    message === "Loading profile..."
  ) {
    return (
      <div className="dashboard-layout">
        <main className="dashboard-main">
          <section className="dashboard-content">
            <p>{message}</p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside className="sidebar">

        <div className="sidebar-logo">
          <BriefcaseBusiness size={28} />

          <span>RecruitHub</span>
        </div>

        <nav className="sidebar-menu">

          {/* DASHBOARD */}

          <button
            className="menu-item active"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <LayoutDashboard size={20} />

            <span>Dashboard</span>
          </button>

          {/* PROFILE */}

          <button
            className="menu-item"
            onClick={() =>
              navigate(
                user?.role === "recruiter"
                  ? "/recruiter/profile"
                  : "/profile"
              )
            }
          >
            <User size={20} />

            <span>My Profile</span>
          </button>

          {/* MY RESUME - CANDIDATE ONLY */}

          {user?.role === "candidate" && (
            <button
              className="menu-item"
              onClick={() =>
                navigate("/resume")
              }
            >
              <FileText size={20} />

              <span>My Resume</span>
            </button>
          )}

          {/* APPLICATIONS */}

          <button
            className="menu-item"
            onClick={() =>
              navigate(
                user?.role === "recruiter"
                  ? "/recruiter/applications"
                  : "/applications"
              )
            }
          >
            <BriefcaseBusiness size={20} />

            <span>Applications</span>
          </button>

          {/* SAVED JOBS - CANDIDATE ONLY */}

          {user?.role === "candidate" && (
            <button
              className="menu-item"
              onClick={() =>
                navigate("/saved-jobs")
              }
            >
              <Bookmark size={20} />

              <span>Saved Jobs</span>
            </button>
          )}

          {/* JOB ALERTS - CANDIDATE ONLY */}

          {user?.role === "candidate" && (
            <button
              className="menu-item"
              onClick={() =>
                navigate("/job-alerts")
              }
            >
              <Bell size={20} />

              <span>Job Alerts</span>
            </button>
          )}

          <div className="menu-divider"></div>

          {/* SETTINGS */}

          <button
            className="menu-item"
            onClick={() =>
              navigate("/settings")
            }
          >
            <Settings size={20} />

            <span>Settings</span>
          </button>

        </nav>

        {/* LOGOUT */}

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut size={20} />

          <span>Logout</span>
        </button>

      </aside>

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <main className="dashboard-main">

        {/* ====================================
            HEADER
        ==================================== */}

        <header className="dashboard-header">

          <div>

            <h2>
              RecruitHub Dashboard
            </h2>

            <p>
              {user?.role === "recruiter"
                ? "Manage your jobs, candidates, and recruitment activities."
                : "Find opportunities, manage applications, and build your career."}
            </p>

          </div>

          {user && (
            <div className="user-info">

              <div className="user-avatar">
                {user.username
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>

                <strong>
                  {user.username}
                </strong>

                <p>
                  {user.role}
                </p>

              </div>

            </div>
          )}

        </header>

        {/* ====================================
            CONTENT
        ==================================== */}

        <section className="dashboard-content">

          {message &&
            message !== "Loading profile..." && (
              <p>{message}</p>
            )}

          {user && (
            <>

              {/* ==================================
                  WELCOME CARD
              ================================== */}

              <div className="welcome-card">

                <h1>
                  Welcome back,{" "}
                  {user.username}! 👋
                </h1>

                <p>
                  {user.role === "recruiter"
                    ? "Here's what's happening with your recruitment today."
                    : "Here's what's happening with your job search today."}
                </p>

              </div>

              {/* ==================================
                  STATISTICS
              ================================== */}

              <div className="stats-grid">

                {/* APPLICATIONS */}

                <div className="stat-card">

                  <div className="stat-icon applications-icon">
                    <ClipboardList
                      size={24}
                    />
                  </div>

                  <div>

                    <p className="stat-title">
                      Applications
                    </p>

                    <h2>
                      {loadingStats
                        ? "..."
                        : applicationCount}
                    </h2>

                    <span>
                      {loadingStats
                        ? "Loading..."
                        : applicationCount === 0
                        ? user.role === "recruiter"
                          ? "No candidate applications yet"
                          : "No applications yet"
                        : user.role === "recruiter"
                        ? `${applicationCount} candidate application${
                            applicationCount === 1
                              ? ""
                              : "s"
                          }`
                        : `${applicationCount} application${
                            applicationCount === 1
                              ? ""
                              : "s"
                          } submitted`}
                    </span>

                  </div>

                </div>

                {/* INTERVIEWS */}

                <div className="stat-card">

                  <div className="stat-icon interviews-icon">
                    <CalendarDays
                      size={24}
                    />
                  </div>

                  <div>

                    <p className="stat-title">
                      Interviews
                    </p>

                    <h2>
                      {loadingStats
                        ? "..."
                        : interviewCount}
                    </h2>

                    <span>
                      {loadingStats
                        ? "Loading..."
                        : interviewCount === 0
                        ? user.role === "recruiter"
                          ? "No interviews yet"
                          : "No interviews scheduled"
                        : `${interviewCount} interview${
                            interviewCount === 1
                              ? ""
                              : "s"
                          }`}
                    </span>

                  </div>

                </div>

                {/* SAVED JOBS - CANDIDATE */}

                {user.role === "candidate" && (
                  <div className="stat-card">

                    <div className="stat-icon saved-icon">
                      <Bookmark
                        size={24}
                      />
                    </div>

                    <div>

                      <p className="stat-title">
                        Saved Jobs
                      </p>

                      <h2>
                        {loadingStats
                          ? "..."
                          : savedJobCount}
                      </h2>

                      <span>
                        {savedJobCount === 0
                          ? "No saved jobs yet"
                          : `${savedJobCount} job${
                              savedJobCount === 1
                                ? ""
                                : "s"
                            } saved for later`}
                      </span>

                    </div>

                  </div>
                )}

                {/* JOB ALERTS - CANDIDATE */}

                {user.role === "candidate" && (
                  <div className="stat-card">

                    <div className="stat-icon alerts-icon">
                      <Bell size={24} />
                    </div>

                    <div>

                      <p className="stat-title">
                        Job Alerts
                      </p>

                      <h2>
                        {jobAlertCount}
                      </h2>

                      <span>
                        {jobAlertCount === 0
                          ? "No active alerts"
                          : `${jobAlertCount} active alert${
                              jobAlertCount === 1
                                ? ""
                                : "s"
                            }`}
                      </span>

                    </div>

                  </div>
                )}

              </div>

              {/* ==================================
                  BOTTOM GRID
              ================================== */}

              <div className="dashboard-bottom-grid">

                {/* =================================
                    RECENT APPLICATIONS
                ================================= */}

                <div className="recent-applications">

                  <div className="section-header">

                    <div>

                      <h2>
                        Recent Applications
                      </h2>

                      <p>
                        {user.role === "recruiter"
                          ? "Track candidates who applied to your jobs"
                          : "Track your latest job applications"}
                      </p>

                    </div>

                    <button
                      className="view-all-button"
                      onClick={() =>
                        navigate(
                          user.role === "recruiter"
                            ? "/recruiter/applications"
                            : "/applications"
                        )
                      }
                    >
                      View All

                      <ArrowRight
                        size={18}
                      />

                    </button>

                  </div>

                  {/* RECRUITER */}

                  {user.role === "recruiter" ? (

                    applicationCount > 0 ? (

                      <div className="empty-state">

                        <ClipboardList
                          size={45}
                        />

                        <h3>
                          {applicationCount} candidate
                          {applicationCount === 1
                            ? ""
                            : "s"}{" "}
                          application
                          {applicationCount === 1
                            ? ""
                            : "s"} received
                        </h3>

                        <p>
                          Review candidate applications
                          and update their status.
                        </p>

                        <button
                          className="browse-jobs-button"
                          onClick={() =>
                            navigate(
                              "/recruiter/applications"
                            )
                          }
                        >
                          View Applications
                        </button>

                      </div>

                    ) : (

                      <div className="empty-state">

                        <ClipboardList
                          size={45}
                        />

                        <h3>
                          No candidate
                          applications yet
                        </h3>

                        <p>
                          Applications from candidates
                          will appear here.
                        </p>

                        <button
                          className="browse-jobs-button"
                          onClick={() =>
                            navigate(
                              "/recruiter/create-job"
                            )
                          }
                        >
                          Post a Job
                        </button>

                      </div>

                    )

                  ) : (

                    /* CANDIDATE */

                    applicationCount > 0 ? (

                      <div className="empty-state">

                        <ClipboardList
                          size={45}
                        />

                        <h3>
                          {applicationCount} application
                          {applicationCount === 1
                            ? ""
                            : "s"} submitted
                        </h3>

                        <p>
                          View your applications to
                          track their current status.
                        </p>

                        <button
                          className="browse-jobs-button"
                          onClick={() =>
                            navigate(
                              "/applications"
                            )
                          }
                        >
                          View Applications
                        </button>

                      </div>

                    ) : (

                      <div className="empty-state">

                        <ClipboardList
                          size={45}
                        />

                        <h3>
                          No applications yet
                        </h3>

                        <p>
                          Start exploring jobs and
                          apply to opportunities that
                          match your skills.
                        </p>

                        <button
                          className="browse-jobs-button"
                          onClick={() =>
                            navigate(
                              "/job-alerts"
                            )
                          }
                        >
                          Browse Jobs
                        </button>

                      </div>

                    )

                  )}

                </div>

                {/* =================================
                    QUICK ACTIONS
                ================================= */}

                <div className="quick-actions">

                  <div className="section-header">

                    <div>

                      <h2>
                        Quick Actions
                      </h2>

                      <p>
                        {user.role === "recruiter"
                          ? "Manage your recruitment"
                          : "Manage your job search"}
                      </p>

                    </div>

                  </div>

                  {/* =================================
                      RECRUITER ACTIONS
                  ================================= */}

                  {user.role === "recruiter" ? (

                    <>

                      {/* POST JOB */}

                      <button
                        className="quick-action-item"
                        onClick={() =>
                          navigate(
                            "/recruiter/create-job"
                          )
                        }
                      >

                        <div className="quick-action-icon">
                          <BriefcaseBusiness
                            size={20}
                          />
                        </div>

                        <div className="quick-action-text">

                          <strong>
                            Post a Job
                          </strong>

                          <span>
                            Create a new job
                            opportunity
                          </span>

                        </div>

                        <ArrowRight
                          size={18}
                        />

                      </button>

                      {/* MY JOBS */}

                      <button
                        className="quick-action-item"
                        onClick={() =>
                          navigate(
                            "/recruiter/jobs"
                          )
                        }
                      >

                        <div className="quick-action-icon">
                          <ClipboardList
                            size={20}
                          />
                        </div>

                        <div className="quick-action-text">

                          <strong>
                            My Jobs
                          </strong>

                          <span>
                            Manage your posted jobs
                          </span>

                        </div>

                        <ArrowRight
                          size={18}
                        />

                      </button>

                      {/* APPLICATIONS */}

                      <button
                        className="quick-action-item"
                        onClick={() =>
                          navigate(
                            "/recruiter/applications"
                          )
                        }
                      >

                        <div className="quick-action-icon">
                          <ClipboardList
                            size={20}
                          />
                        </div>

                        <div className="quick-action-text">

                          <strong>
                            Applications
                          </strong>

                          <span>
                            View candidates who
                            applied to your jobs
                          </span>

                        </div>

                        <ArrowRight
                          size={18}
                        />

                      </button>

                      {/* COMPANY PROFILE */}

                      <button
                        className="quick-action-item"
                        onClick={() =>
                          navigate(
                            "/recruiter/profile"
                          )
                        }
                      >

                        <div className="quick-action-icon">
                          <User size={20} />
                        </div>

                        <div className="quick-action-text">

                          <strong>
                            Company Profile
                          </strong>

                          <span>
                            Manage your company
                            information
                          </span>

                        </div>

                        <ArrowRight
                          size={18}
                        />

                      </button>

                    </>

                  ) : (

                    /* =================================
                       CANDIDATE ACTIONS
                    ================================= */

                    <>

                      {/* UPLOAD RESUME */}

                      <button
                        className="quick-action-item"
                        onClick={() =>
                          navigate("/resume")
                        }
                      >

                        <div className="quick-action-icon">
                          <Upload size={20} />
                        </div>

                        <div className="quick-action-text">

                          <strong>
                            Upload Resume
                          </strong>

                          <span>
                            Add or update your resume
                          </span>

                        </div>

                        <ArrowRight
                          size={18}
                        />

                      </button>

                      {/* BROWSE JOBS */}

                      <button
                        className="quick-action-item"
                        onClick={() =>
                          navigate(
                            "/job-alerts"
                          )
                        }
                      >

                        <div className="quick-action-icon">
                          <Search size={20} />
                        </div>

                        <div className="quick-action-text">

                          <strong>
                            Browse Jobs
                          </strong>

                          <span>
                            Find your next
                            opportunity
                          </span>

                        </div>

                        <ArrowRight
                          size={18}
                        />

                      </button>

                      {/* COMPLETE PROFILE */}

                      <button
                        className="quick-action-item"
                        onClick={() =>
                          navigate("/profile")
                        }
                      >

                        <div className="quick-action-icon">
                          <User size={20} />
                        </div>

                        <div className="quick-action-text">

                          <strong>
                            Complete Profile
                          </strong>

                          <span>
                            Improve your profile
                            visibility
                          </span>

                        </div>

                        <ArrowRight
                          size={18}
                        />

                      </button>

                    </>

                  )}

                </div>

              </div>

            </>
          )}

        </section>

      </main>

    </div>
  );
}

export default Dashboard;