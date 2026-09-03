import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  BriefcaseBusiness,
  MapPin,
  Clock,
  IndianRupee,
  CalendarDays,
  Trash2,
} from "lucide-react";
import "./SavedJobs.css";

interface SavedJob {
  id: number;
  job: number;
  title: string;
  company_name: string;
  description: string;
  required_skills: string;
  location: string;
  job_type: string;
  salary: string;
  experience_required: number;
  is_active: boolean;
  saved_at: string;
}

function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Please login first.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/users/saved-jobs/",
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
          data.detail ||
            data.error ||
            "Failed to load saved jobs."
        );
      }

      setSavedJobs(data);
    } catch (error) {
      console.error("Saved jobs error:", error);
      setError("Unable to load your saved jobs.");
    } finally {
      setLoading(false);
    }
  };

  const removeSavedJob = async (savedJobId: number) => {
    const confirmRemove = window.confirm(
      "Are you sure you want to remove this job from saved jobs?"
    );

    if (!confirmRemove) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Please login first.");
      return;
    }

    setDeletingId(savedJobId);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/users/saved-jobs/${savedJobId}/`,
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
          data.detail ||
            data.error ||
            "Failed to remove saved job."
        );
      }

      setSavedJobs((currentJobs) =>
        currentJobs.filter(
          (savedJob) => savedJob.id !== savedJobId
        )
      );
    } catch (error) {
      console.error("Remove saved job error:", error);
      setError("Unable to remove the saved job.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout
      title="Saved Jobs"
      subtitle="View the jobs you saved for later"
    >
      <div className="saved-jobs-page">

        {/* Header */}

        <div className="saved-jobs-header">
          <div>
            <h2>Saved Jobs</h2>
            <p>
              Keep track of opportunities you want to apply for.
            </p>
          </div>

          <div className="saved-jobs-count">
            <BriefcaseBusiness size={20} />
            <span>{savedJobs.length} Saved</span>
          </div>
        </div>

        {/* Loading */}

        {loading && (
          <div className="saved-jobs-message">
            <div className="loading-spinner"></div>
            <p>Loading saved jobs...</p>
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="saved-jobs-error">
            <p>{error}</p>

            <button onClick={fetchSavedJobs}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}

        {!loading &&
          !error &&
          savedJobs.length === 0 && (
            <div className="empty-saved-jobs">

              <div className="empty-saved-icon">
                <BriefcaseBusiness size={36} />
              </div>

              <h3>No Saved Jobs Yet</h3>

              <p>
                You haven't saved any jobs yet.
              </p>

              <span>
                Save jobs that interest you and find them here later.
              </span>

            </div>
          )}

        {/* Saved Jobs */}

        {!loading &&
          !error &&
          savedJobs.length > 0 && (
            <div className="saved-jobs-list">

              {savedJobs.map((savedJob) => (
                <div
                  className="saved-job-card"
                  key={savedJob.id}
                >

                  {/* Top */}

                  <div className="saved-job-top">

                    <div className="saved-job-title">

                      <div className="saved-job-icon">
                        <BriefcaseBusiness size={22} />
                      </div>

                      <div>
                        <h3>{savedJob.title}</h3>
                        <p>{savedJob.company_name}</p>
                      </div>

                    </div>

                    <span
                      className={`saved-job-status ${
                        savedJob.is_active
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {savedJob.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>

                  {/* Job information */}

                  <div className="saved-job-info">

                    <div>
                      <MapPin size={17} />
                      <span>
                        {savedJob.location ||
                          "Not specified"}
                      </span>
                    </div>

                    <div>
                      <Clock size={17} />
                      <span>
                        {savedJob.job_type}
                      </span>
                    </div>

                    <div>
                      <IndianRupee size={17} />
                      <span>
                        {savedJob.salary
                          ? `₹${savedJob.salary}`
                          : "Not specified"}
                      </span>
                    </div>

                    <div>
                      <BriefcaseBusiness size={17} />
                      <span>
                        {savedJob.experience_required} years
                      </span>
                    </div>

                  </div>

                  {/* Description */}

                  <div className="saved-job-description">
                    <h4>Description</h4>

                    <p>
                      {savedJob.description}
                    </p>
                  </div>

                  {/* Skills */}

                  <div className="saved-job-skills">

                    <h4>Required Skills</h4>

                    <div className="skills-list">

                      {savedJob.required_skills
                        ? savedJob.required_skills
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

                  <div className="saved-job-footer">

                    <div className="saved-date">
                      <CalendarDays size={16} />

                      <span>
                        Saved{" "}
                        {new Date(
                          savedJob.saved_at
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      className="remove-saved-btn"
                      onClick={() =>
                        removeSavedJob(savedJob.id)
                      }
                      disabled={
                        deletingId === savedJob.id
                      }
                    >
                      <Trash2 size={17} />

                      {deletingId === savedJob.id
                        ? "Removing..."
                        : "Remove"}
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

export default SavedJobs;