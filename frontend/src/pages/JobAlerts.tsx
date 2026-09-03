import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Bookmark, BookmarkCheck } from "lucide-react";

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

interface SavedJob {
  id: number;
  job: number;
  title: string;
}

function JobAlert() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingJobId, setSavingJobId] = useState<number | null>(null);

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
  }, []);

  // ==========================================
  // FETCH JOBS
  // ==========================================

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/users/jobs/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            "Failed to fetch jobs"
        );
      }

      setJobs(data);
    } catch (error) {
      console.error("Jobs error:", error);
      setError("Unable to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH SAVED JOBS
  // ==========================================

  const fetchSavedJobs = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        return;
      }

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
        console.error(
          data.error || "Failed to fetch saved jobs."
        );
        return;
      }

      setSavedJobs(data);
    } catch (error) {
      console.error(
        "Saved jobs error:",
        error
      );
    }
  };

  // ==========================================
  // CHECK WHETHER JOB IS SAVED
  // ==========================================

  const isJobSaved = (jobId: number) => {
    return savedJobs.some(
      (savedJob) => savedJob.job === jobId
    );
  };

  // ==========================================
  // SAVE JOB
  // ==========================================

  const saveJob = async (job: Job) => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        alert("Please login first.");
        return;
      }

      // Prevent duplicate save
      if (isJobSaved(job.id)) {
        alert("You have already saved this job.");
        return;
      }

      setSavingJobId(job.id);

      const response = await fetch(
        "http://127.0.0.1:8000/api/users/saved-jobs/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            job: job.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to save this job."
        );
        return;
      }

      alert("Job saved successfully!");

      // Add newly saved job to state
      setSavedJobs((currentSavedJobs) => [
        ...currentSavedJobs,
        {
          id: data.saved_job.id,
          job: data.saved_job.job,
          title: data.saved_job.title,
        },
      ]);
    } catch (error) {
      console.error(
        "Save job error:",
        error
      );

      alert(
        "Something went wrong while saving the job."
      );
    } finally {
      setSavingJobId(null);
    }
  };

  // ==========================================
  // APPLY FOR JOB
  // ==========================================

  const applyForJob = async (job: Job) => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        alert("Please login first.");
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/users/applications/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            job: job.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to apply for this job."
        );
        return;
      }

      alert(
        "Application submitted successfully!"
      );

      console.log(
        "Application:",
        data
      );
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong while applying."
      );
    }
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <DashboardLayout
      title="Job Alerts"
      subtitle="Find your next career opportunity"
    >
      <div className="jobs-page">

        {/* Loading */}

        {loading && (
          <p>Loading jobs...</p>
        )}

        {/* Error */}

        {error && (
          <p>{error}</p>
        )}

        {/* No Jobs */}

        {!loading &&
          !error &&
          jobs.length === 0 && (
            <p>No jobs available.</p>
          )}

        {/* Jobs */}

        <div className="jobs-list">

          {jobs.map((job) => {

            const saved = isJobSaved(job.id);

            return (
              <div
                className="job-card"
                key={job.id}
              >

                <h2>
                  {job.title}
                </h2>

                <h3>
                  {job.company_name}
                </h3>

                <p>
                  📍 {job.location}
                </p>

                <p>
                  💼 {job.job_type}
                </p>

                <p>
                  🧑‍💻 Experience:{" "}
                  {job.experience_required} years
                </p>

                <p>
                  💰 Salary: ₹{job.salary}
                </p>

                <p>
                  {job.description}
                </p>

                <p>
                  <strong>
                    Required Skills:
                  </strong>{" "}
                  {job.required_skills}
                </p>

                {/* Buttons */}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "16px",
                  }}
                >

                  {/* Apply */}

                  <button
                    className="browse-jobs-button"
                    onClick={() =>
                      applyForJob(job)
                    }
                  >
                    Apply Now
                  </button>

                  {/* Save */}

                  <button
                    className="browse-jobs-button"
                    onClick={() =>
                      saveJob(job)
                    }
                    disabled={
                      saved ||
                      savingJobId === job.id
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: saved
                        ? "#e8f0ff"
                        : undefined,
                      color: saved
                        ? "#3157d5"
                        : undefined,
                      cursor: saved
                        ? "default"
                        : "pointer",
                    }}
                  >

                    {saved ? (
                      <>
                        <BookmarkCheck
                          size={17}
                        />
                        Saved
                      </>
                    ) : (
                      <>
                        <Bookmark
                          size={17}
                        />
                        {savingJobId === job.id
                          ? "Saving..."
                          : "Save Job"}
                      </>
                    )}

                  </button>

                </div>

              </div>
            );
          })}

        </div>

      </div>
    </DashboardLayout>
  );
}

export default JobAlert;