import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import {
  BriefcaseBusiness,
  Building2,
  FileText,
  Code2,
  MapPin,
  Clock3,
  Wallet,
  GraduationCap,
  Send,
  X,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";
import "./CreateJob.css";

function CreateJob() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("full-time");
  const [salary, setSalary] = useState("");
  const [experienceRequired, setExperienceRequired] =
    useState("0");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Please login first.");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/users/jobs/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            company_name: companyName,
            description,
            required_skills: requiredSkills,
            location,
            job_type: jobType,
            salary,
            experience_required: Number(
              experienceRequired
            ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Create job error:", data);

        setError(
          data.detail ||
            data.error ||
            "Failed to create job."
        );

        return;
      }

      setMessage("Job posted successfully!");

      setTitle("");
      setCompanyName("");
      setDescription("");
      setRequiredSkills("");
      setLocation("");
      setJobType("full-time");
      setSalary("");
      setExperienceRequired("0");
    } catch (error) {
      console.error("Create job error:", error);
      setError(
        "Cannot connect to the backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Post a Job"
      subtitle="Create and publish a new job opportunity"
    >
      <div className="create-job-page">

        <div className="create-job-card">

          {/* Header */}

          <div className="create-job-header">

            <div className="create-job-title-area">

              <div className="create-job-icon">
                <BriefcaseBusiness size={26} />
              </div>

              <div>
                <h2>Create Job Posting</h2>

                <p>
                  Add the details below to publish
                  your job opportunity.
                </p>
              </div>

            </div>

            <div className="posting-badge">
              <span></span>
              New Posting
            </div>

          </div>

          {/* Messages */}

          {message && (
            <div className="job-message success">
              <CheckCircle size={19} />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="job-message error">
              <AlertCircle size={19} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* =====================================
                BASIC INFORMATION
                ===================================== */}

            <div className="job-section">

              <div className="job-section-heading">
                <div className="section-number">
                  01
                </div>

                <div>
                  <h3>Basic Information</h3>
                  <p>
                    Provide the main details about
                    the position.
                  </p>
                </div>
              </div>

              <div className="job-form-grid">

                {/* Job Title */}

                <div className="job-form-group full-width">

                  <label>
                    <BriefcaseBusiness size={16} />
                    Job Title
                  </label>

                  <div className="job-input-wrapper">
                    <input
                      type="text"
                      placeholder="e.g. Machine Learning Engineer"
                      value={title}
                      onChange={(event) =>
                        setTitle(event.target.value)
                      }
                      required
                    />
                  </div>

                </div>

                {/* Company */}

                <div className="job-form-group">

                  <label>
                    <Building2 size={16} />
                    Company Name
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Google"
                    value={companyName}
                    onChange={(event) =>
                      setCompanyName(event.target.value)
                    }
                    required
                  />

                </div>

                {/* Location */}

                <div className="job-form-group">

                  <label>
                    <MapPin size={16} />
                    Location
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Chennai, India"
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                  />

                </div>

              </div>

            </div>

            {/* =====================================
                JOB DETAILS
                ===================================== */}

            <div className="job-section">

              <div className="job-section-heading">
                <div className="section-number">
                  02
                </div>

                <div>
                  <h3>Job Details</h3>
                  <p>
                    Define the requirements and
                    employment conditions.
                  </p>
                </div>
              </div>

              <div className="job-form-grid">

                {/* Job Type */}

                <div className="job-form-group">

                  <label>
                    <Clock3 size={16} />
                    Job Type
                  </label>

                  <select
                    value={jobType}
                    onChange={(event) =>
                      setJobType(event.target.value)
                    }
                  >
                    <option value="full-time">
                      Full Time
                    </option>

                    <option value="part-time">
                      Part Time
                    </option>

                    <option value="internship">
                      Internship
                    </option>

                    <option value="contract">
                      Contract
                    </option>
                  </select>

                </div>

                {/* Salary */}

                <div className="job-form-group">

                  <label>
                    <Wallet size={16} />
                    Salary
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. ₹6,00,000 per year"
                    value={salary}
                    onChange={(event) =>
                      setSalary(event.target.value)
                    }
                  />

                </div>

                {/* Experience */}

                <div className="job-form-group">

                  <label>
                    <GraduationCap size={16} />
                    Experience Required
                  </label>

                  <div className="experience-input">
                    <input
                      type="number"
                      min="0"
                      value={experienceRequired}
                      onChange={(event) =>
                        setExperienceRequired(
                          event.target.value
                        )
                      }
                    />

                    <span>Years</span>
                  </div>

                </div>

                {/* Skills */}

                <div className="job-form-group">

                  <label>
                    <Code2 size={16} />
                    Required Skills
                  </label>

                  <input
                    type="text"
                    placeholder="Python, SQL, React..."
                    value={requiredSkills}
                    onChange={(event) =>
                      setRequiredSkills(
                        event.target.value
                      )
                    }
                  />

                </div>

              </div>

            </div>

            {/* =====================================
                DESCRIPTION
                ===================================== */}

            <div className="job-section">

              <div className="job-section-heading">
                <div className="section-number">
                  03
                </div>

                <div>
                  <h3>Job Description</h3>
                  <p>
                    Give candidates a clear
                    understanding of the role.
                  </p>
                </div>
              </div>

              <div className="job-form-group">

                <label>
                  <FileText size={16} />
                  Description
                </label>

                <textarea
                  placeholder="Describe the responsibilities, qualifications, expectations, and other important details about this position..."
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  rows={7}
                  required
                />

                <span className="field-hint">
                  Write a clear and detailed description
                  to attract the right candidates.
                </span>

              </div>

            </div>

            {/* =====================================
                ACTIONS
                ===================================== */}

            <div className="create-job-actions">

              <button
                type="button"
                className="cancel-job-button"
                onClick={() =>
                  navigate("/dashboard")
                }
                disabled={loading}
              >
                <X size={18} />
                Cancel
              </button>

              <button
                type="submit"
                className="post-job-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="job-loading"
                    />
                    Posting Job...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Post Job
                  </>
                )}
              </button>

            </div>

          </form>

        </div>

      </div>
    </DashboardLayout>
  );
}

export default CreateJob;