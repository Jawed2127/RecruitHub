import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  BriefcaseBusiness,
  MapPin,
  Clock,
  Users,
  IndianRupee,
  CalendarDays,
  Trash2,
} from "lucide-react";
import "./RecruiterJobs.css";

interface Job {
  id: number;
  title: string;
  company_name: string;
  description: string;
  required_skills: string;
  location: string;
  job_type: string;
  salary: string;
  experience_required: number;
  created_at: string;
  is_active: boolean;
}

function RecruiterJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Please login first.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/users/recruiter/jobs/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.error || "Failed to load jobs."
        );
      }

      setJobs(data);
    } catch (error) {
      console.error("Jobs error:", error);
      setError("Unable to load your jobs.");
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Please login first.");
      return;
    }

    setDeletingId(jobId);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/users/recruiter/jobs/${jobId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || data.error || "Failed to delete job."
        );
      }

      setJobs((currentJobs) =>
        currentJobs.filter((job) => job.id !== jobId)
      );
    } catch (error) {
      console.error("Delete job error:", error);
      setError("Unable to delete the job.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout
      title="My Jobs"
      subtitle="Manage your posted job opportunities"
    >
      <div className="recruiter-jobs-page">

        {/* Header */}

        <div className="jobs-header">
          <div>
            <h2>Your Job Postings</h2>
            <p>
              View and manage the jobs you have posted.
            </p>
          </div>

          <div className="jobs-count">
            <BriefcaseBusiness size={20} />
            <span>{jobs.length} Jobs</span>
          </div>
        </div>

        {/* Loading */}

        {loading && (
          <div className="jobs-message">
            <div className="loading-spinner"></div>
            <p>Loading your jobs...</p>
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="jobs-error">
            <p>{error}</p>
            <button onClick={fetchJobs}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}

        {!loading && !error && jobs.length === 0 && (
          <div className="empty-jobs">
            <div className="empty-icon">
              <BriefcaseBusiness size={36} />
            </div>

            <h3>No jobs posted yet</h3>

            <p>
              You haven't posted any job opportunities yet.
            </p>
          </div>
        )}

        {/* Jobs */}

        {!loading && !error && jobs.length > 0 && (
          <div className="recruiter-jobs-list">

            {jobs.map((job) => (
              <div
                className="recruiter-job-card"
                key={job.id}
              >

                {/* Top */}

                <div className="job-card-top">

                  <div className="job-title-section">
                    <div className="job-icon">
                      <BriefcaseBusiness size={22} />
                    </div>

                    <div>
                      <h3>{job.title}</h3>
                      <p>{job.company_name}</p>
                    </div>
                  </div>

                  <span
                    className={`job-status ${
                      job.is_active
                        ? "active"
                        : "inactive"
                    }`}
                  >
                    {job.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>

                </div>

                {/* Job Information */}

                <div className="job-info-grid">

                  <div className="job-info-item">
                    <MapPin size={17} />
                    <div>
                      <span>Location</span>
                      <strong>
                        {job.location || "Not specified"}
                      </strong>
                    </div>
                  </div>

                  <div className="job-info-item">
                    <Clock size={17} />
                    <div>
                      <span>Job Type</span>
                      <strong>
                        {job.job_type}
                      </strong>
                    </div>
                  </div>

                  <div className="job-info-item">
                    <Users size={17} />
                    <div>
                      <span>Experience</span>
                      <strong>
                        {job.experience_required} years
                      </strong>
                    </div>
                  </div>

                  <div className="job-info-item">
                    <IndianRupee size={17} />
                    <div>
                      <span>Salary</span>
                      <strong>
                        {job.salary
                          ? `₹${job.salary}`
                          : "Not specified"}
                      </strong>
                    </div>
                  </div>

                </div>

                {/* Description */}

                <div className="job-description">
                  <h4>Job Description</h4>
                  <p>{job.description}</p>
                </div>

                {/* Skills */}

                <div className="job-skills">
                  <h4>Required Skills</h4>

                  <div className="skills-list">
                    {job.required_skills
                      ? job.required_skills
                          .split(",")
                          .map((skill, index) => (
                            <span key={index}>
                              {skill.trim()}
                            </span>
                          ))
                      : (
                        <span>
                          No specific skills listed
                        </span>
                      )}
                  </div>
                </div>

                {/* Footer */}

                <div className="job-card-footer">

                  <div className="posted-date">
                    <CalendarDays size={16} />
                    <span>
                      Posted{" "}
                      {new Date(
                        job.created_at
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    className="delete-job-btn"
                    onClick={() => deleteJob(job.id)}
                    disabled={deletingId === job.id}
                  >
                    <Trash2 size={17} />

                    {deletingId === job.id
                      ? "Deleting..."
                      : "Delete Job"}
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default RecruiterJobs;