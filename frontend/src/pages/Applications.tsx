import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  LoaderCircle,
  FileText,
} from "lucide-react";

interface Application {
  id: number;
  job_title: string;
  company_name: string;
  status: string;
  applied_at: string;
  updated_at: string;
}

function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/users/applications/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();

      setApplications(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load applications.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    return `status-badge status-${status.toLowerCase()}`;
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Applications"
        subtitle="Track your job applications"
      >
        <div className="applications-page">
          <div className="loading-container">
            <LoaderCircle size={30} className="loading-spinner" />
            <p>Loading applications...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Applications"
      subtitle="Track and manage your job applications"
    >
      <div className="applications-page">
        <div className="applications-card">
          <div className="applications-heading">
            <div>
              <h2>My Applications</h2>
              <p>
                Keep track of all the jobs you have applied for.
              </p>
            </div>

            <div className="applications-count">
              {applications.length} Applications
            </div>
          </div>

          {error && (
            <div className="application-error">
              {error}
            </div>
          )}

          {!error && applications.length === 0 && (
            <div className="empty-applications">
              <FileText size={55} />

              <h3>No Applications Yet</h3>

              <p>
                You haven't applied for any jobs yet.
              </p>

              <span>
                Once you apply for a job, it will appear here.
              </span>
            </div>
          )}

          {applications.length > 0 && (
            <div className="applications-list">
              {applications.map((application) => (
                <div
                  className="application-item"
                  key={application.id}
                >
                  <div className="application-icon">
                    <BriefcaseBusiness size={25} />
                  </div>

                  <div className="application-info">
                    <h3>{application.job_title}</h3>

                    <p className="company-name">
                      <Building2 size={16} />
                      {application.company_name}
                    </p>

                    <p className="application-date">
                      <CalendarDays size={16} />
                      Applied on{" "}
                      {new Date(
                        application.applied_at
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={getStatusClass(
                      application.status
                    )}
                  >
                    {application.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Applications;