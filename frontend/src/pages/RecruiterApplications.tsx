import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Mail,
  User,
  Clock,
  Users,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

interface Application {
  id: number;
  job: number;
  job_title: string;
  company_name: string;
  candidate_username: string;
  candidate_email: string;
  status: string;
  applied_at: string;
  updated_at: string;
}

function RecruiterApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Authentication token not found.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/users/recruiter/applications/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            data.error ||
            "Failed to load applications."
        );
        setLoading(false);
        return;
      }

      setApplications(data);
    } catch (error) {
      console.error(error);
      setError("Something went wrong while loading applications.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPDATE APPLICATION STATUS
  // ==========================================

  const updateStatus = async (
    applicationId: number,
    newStatus: string
  ) => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      setUpdatingId(applicationId);

      const response = await fetch(
        `http://127.0.0.1:8000/api/users/recruiter/applications/${applicationId}/status/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            data.error ||
            "Failed to update application status."
        );
        return;
      }

      setApplications((previousApplications) =>
        previousApplications.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status: data.application.status,
                updated_at: data.application.updated_at,
              }
            : application
        )
      );

      setError("");
    } catch (error) {
      console.error(error);
      setError("Something went wrong while updating status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status: string) => {
    return `recruiter-status recruiter-status-${status}`;
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <DashboardLayout
        title="Applications"
        subtitle="Review and manage candidate applications"
      >
        <div className="recruiter-applications-loading">
          <LoaderCircle
            size={35}
            className="recruiter-loading-spinner"
          />
          <p>Loading applications...</p>
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <DashboardLayout
      title="Applications"
      subtitle="Review and manage candidate applications"
    >
      <div className="recruiter-applications-page">

        {/* PAGE HEADER */}

        <div className="recruiter-applications-header">
          <div>
            <div className="recruiter-page-title">
              <Users size={25} />
              <h1>Candidate Applications</h1>
            </div>

            <p>
              Review candidates who have applied to your jobs.
            </p>
          </div>

          <div className="recruiter-applications-count">
            <Users size={20} />
            <span>{applications.length}</span>
            <small>
              {applications.length === 1
                ? "Application"
                : "Applications"}
            </small>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="recruiter-application-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* EMPTY STATE */}

        {!error && applications.length === 0 && (
          <div className="recruiter-empty-applications">
            <div className="recruiter-empty-icon">
              <Users size={45} />
            </div>

            <h2>No Applications Yet</h2>

            <p>
              Candidates who apply to your jobs will appear here.
            </p>
          </div>
        )}

        {/* APPLICATIONS */}

        {!error && applications.length > 0 && (
          <div className="recruiter-applications-list">

            {applications.map((application) => (
              <div
                className="recruiter-application-card"
                key={application.id}
              >

                {/* CARD TOP */}

                <div className="recruiter-application-top">

                  <div className="recruiter-job-info">

                    <div className="recruiter-job-icon">
                      <BriefcaseBusiness size={24} />
                    </div>

                    <div>
                      <h2>{application.job_title}</h2>

                      <div className="recruiter-company">
                        <Building2 size={16} />
                        <span>
                          {application.company_name}
                        </span>
                      </div>
                    </div>

                  </div>

                  <span
                    className={getStatusClass(
                      application.status
                    )}
                  >
                    {application.status}
                  </span>

                </div>

                {/* DIVIDER */}

                <div className="recruiter-card-divider"></div>

                {/* CANDIDATE */}

                <div className="recruiter-candidate-section">

                  <h3>Candidate Information</h3>

                  <div className="recruiter-candidate-grid">

                    <div className="recruiter-info-item">
                      <div className="recruiter-info-icon">
                        <User size={18} />
                      </div>

                      <div>
                        <span>Candidate</span>
                        <strong>
                          {application.candidate_username}
                        </strong>
                      </div>
                    </div>

                    <div className="recruiter-info-item">
                      <div className="recruiter-info-icon">
                        <Mail size={18} />
                      </div>

                      <div>
                        <span>Email</span>
                        <strong>
                          {application.candidate_email}
                        </strong>
                      </div>
                    </div>

                    <div className="recruiter-info-item">
                      <div className="recruiter-info-icon">
                        <CalendarDays size={18} />
                      </div>

                      <div>
                        <span>Applied On</span>
                        <strong>
                          {new Date(
                            application.applied_at
                          ).toLocaleDateString()}
                        </strong>
                      </div>
                    </div>

                    <div className="recruiter-info-item">
                      <div className="recruiter-info-icon">
                        <Clock size={18} />
                      </div>

                      <div>
                        <span>Last Updated</span>
                        <strong>
                          {new Date(
                            application.updated_at
                          ).toLocaleDateString()}
                        </strong>
                      </div>
                    </div>

                  </div>

                </div>

                {/* STATUS */}

                <div className="recruiter-status-section">

                  <div>
                    <label htmlFor={`status-${application.id}`}>
                      Application Status
                    </label>

                    <p>
                      Update the candidate's recruitment stage.
                    </p>
                  </div>

                  <div className="recruiter-status-control">

                    <select
                      id={`status-${application.id}`}
                      value={application.status}
                      disabled={
                        updatingId === application.id
                      }
                      onChange={(event) =>
                        updateStatus(
                          application.id,
                          event.target.value
                        )
                      }
                    >
                      <option value="applied">
                        Applied
                      </option>

                      <option value="reviewed">
                        Reviewed
                      </option>

                      <option value="interview">
                        Interview
                      </option>

                      <option value="selected">
                        Selected
                      </option>

                      <option value="rejected">
                        Rejected
                      </option>
                    </select>

                    {updatingId === application.id && (
                      <span className="status-updating">
                        Updating...
                      </span>
                    )}

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default RecruiterApplications;