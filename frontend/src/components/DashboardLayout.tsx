import { type ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  FileText,
  BriefcaseBusiness,
  Bookmark,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

import "../pages/Dashboard.css";

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/users/profile/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login");
        }
      } catch (error) {
        console.error("Profile error:", error);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    navigate("/login");
  };

 const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  },

  {
    name: "My Profile",
    path: "/profile",
    icon: <User size={20} />,
  },

  ...(user?.role === "candidate"
    ? [
        {
          name: "My Resume",
          path: "/resume",
          icon: <FileText size={20} />,
        },
      ]
    : []),

  {
    name: "Applications",
    path:
      user?.role === "recruiter"
        ? "/recruiter/applications"
        : "/applications",
    icon: <BriefcaseBusiness size={20} />,
  },

  ...(user?.role === "candidate"
    ? [
        {
          name: "Saved Jobs",
          path: "/saved-jobs",
          icon: <Bookmark size={20} />,
        },
      ]
    : []),

  {
    name: "Job Alerts",
    path: "/job-alerts",
    icon: <Bell size={20} />,
  },
];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div
          className="sidebar-logo"
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer" }}
        >
          <BriefcaseBusiness size={28} />
          <span>RecruitHub</span>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`menu-item ${
                location.pathname === item.path ? "active" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}

          <div className="menu-divider"></div>

          <button
            className={`menu-item ${
              location.pathname === "/settings" ? "active" : ""
            }`}
            onClick={() => navigate("/settings")}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h2>{title}</h2>

            {subtitle && <p>{subtitle}</p>}
          </div>

          {user && (
            <div className="user-info">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{user.username}</strong>
                <p>{user.role}</p>
              </div>
            </div>
          )}
        </header>

        {/* Page Content */}
        <section className="dashboard-content">{children}</section>
      </main>
    </div>
  );
}

export default DashboardLayout;
