import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  User,
  Phone,
  MapPin,
  Code2,
  Briefcase,
  GraduationCap,
  Save,
  LoaderCircle,
  Building2,
  Globe,
  FileText,
} from "lucide-react";

type ProfileType = "candidate" | "recruiter";

interface CandidateProfileData {
  phone: string;
  location: string;
  skills: string;
  experience_years: number;
  education: string;
}

interface RecruiterProfileData {
  company_name: string;
  company_website: string;
  company_description: string;
  company_location: string;
}

function Profile() {
  const [profileType, setProfileType] =
    useState<ProfileType>("candidate");

  const [candidateProfile, setCandidateProfile] =
    useState<CandidateProfileData>({
      phone: "",
      location: "",
      skills: "",
      experience_years: 0,
      education: "",
    });

  const [recruiterProfile, setRecruiterProfile] =
    useState<RecruiterProfileData>({
      company_name: "",
      company_website: "",
      company_description: "",
      company_location: "",
    });

  const [recruiterProfileExists, setRecruiterProfileExists] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      /*
       * First check recruiter profile.
       *
       * Recruiter:
       * 200 -> recruiter profile exists
       * 404 -> recruiter account but profile doesn't exist yet
       *
       * Candidate:
       * 403 -> not a recruiter, so check candidate profile
       */

      const recruiterResponse = await fetch(
        "http://127.0.0.1:8000/api/users/recruiter-profile/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (recruiterResponse.status === 200) {
        const data = await recruiterResponse.json();

        setProfileType("recruiter");
        setRecruiterProfileExists(true);

        setRecruiterProfile({
          company_name: data.company_name || "",
          company_website: data.company_website || "",
          company_description: data.company_description || "",
          company_location: data.company_location || "",
        });

        return;
      }

      /*
       * 404 means recruiter account but profile
       * has not been created yet.
       */
      if (recruiterResponse.status === 404) {
        setProfileType("recruiter");
        setRecruiterProfileExists(false);

        setRecruiterProfile({
          company_name: "",
          company_website: "",
          company_description: "",
          company_location: "",
        });

        return;
      }

      /*
       * If recruiter endpoint returns 403,
       * check candidate profile.
       */
      if (recruiterResponse.status === 403) {
        const candidateResponse = await fetch(
          "http://127.0.0.1:8000/api/users/candidate-profile/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!candidateResponse.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await candidateResponse.json();

        setProfileType("candidate");

        setCandidateProfile({
          phone: data.phone || "",
          location: data.location || "",
          skills: data.skills || "",
          experience_years: data.experience_years || 0,
          education: data.education || "",
        });

        return;
      }

      throw new Error("Unable to determine profile type.");
    } catch (error) {
      console.error(error);
      setError("Unable to load profile information.");
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setCandidateProfile((previousProfile) => ({
      ...previousProfile,
      [name]:
        name === "experience_years"
          ? Number(value)
          : value,
    }));
  };

  const handleRecruiterChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setRecruiterProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));
  };

  const handleCandidateSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/users/candidate-profile/",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(candidateProfile),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.error ||
          data.detail ||
          "Failed to update profile.";

        throw new Error(errorMessage);
      }

      setMessage("Candidate profile updated successfully!");

      if (data.profile) {
        setCandidateProfile(data.profile);
      }
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to update profile. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRecruiterSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const method = recruiterProfileExists
        ? "PUT"
        : "POST";

      const response = await fetch(
        "http://127.0.0.1:8000/api/users/recruiter-profile/",
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(recruiterProfile),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.error ||
          data.detail ||
          "Failed to save recruiter profile.";

        throw new Error(errorMessage);
      }

      setRecruiterProfileExists(true);

      setMessage(
        recruiterProfileExists
          ? "Recruiter profile updated successfully!"
          : "Recruiter profile created successfully!"
      );

      if (data.profile) {
        setRecruiterProfile(data.profile);
      }
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to save profile. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="My Profile"
        subtitle="Manage your personal and professional information"
      >
        <div className="loading-container">
          <LoaderCircle
            size={32}
            className="loading-spinner"
          />
          <p>Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="My Profile"
      subtitle="Manage your personal and professional information"
    >
      <div className="profile-page">
        <div className="profile-card">

          {/* ============================= */}
          {/* RECRUITER PROFILE */}
          {/* ============================= */}

          {profileType === "recruiter" ? (
            <>
              <div className="profile-header">
                <div>
                  <h2>Recruiter Profile</h2>
                  <p>
                    Manage your company and professional
                    information.
                  </p>
                </div>

                <div className="profile-avatar">
                  <Building2 size={30} />
                </div>
              </div>

              {message && (
                <div className="profile-success">
                  {message}
                </div>
              )}

              {error && (
                <div className="profile-error">
                  {error}
                </div>
              )}

              <form
                className="profile-form"
                onSubmit={handleRecruiterSubmit}
              >
                <div className="profile-form-grid">

                  {/* Company Name */}
                  <div className="profile-input-group">
                    <label>
                      <Building2 size={17} />
                      Company Name
                    </label>

                    <input
                      type="text"
                      name="company_name"
                      value={recruiterProfile.company_name}
                      onChange={handleRecruiterChange}
                      placeholder="Google"
                      required
                    />
                  </div>

                  {/* Company Website */}
                  <div className="profile-input-group">
                    <label>
                      <Globe size={17} />
                      Company Website
                    </label>

                    <input
                      type="url"
                      name="company_website"
                      value={
                        recruiterProfile.company_website
                      }
                      onChange={handleRecruiterChange}
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Company Location */}
                  <div className="profile-input-group">
                    <label>
                      <MapPin size={17} />
                      Company Location
                    </label>

                    <input
                      type="text"
                      name="company_location"
                      value={
                        recruiterProfile.company_location
                      }
                      onChange={handleRecruiterChange}
                      placeholder="Chennai, India"
                    />
                  </div>

                </div>

                {/* Company Description */}
                <div className="profile-input-group full-width">
                  <label>
                    <FileText size={17} />
                    Company Description
                  </label>

                  <textarea
                    name="company_description"
                    value={
                      recruiterProfile.company_description
                    }
                    onChange={handleRecruiterChange}
                    placeholder="Tell candidates about your company..."
                    rows={5}
                  />
                </div>

                <button
                  type="submit"
                  className="save-profile-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="loading-spinner"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {recruiterProfileExists
                        ? "Update Profile"
                        : "Create Profile"}
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (

          /* ============================= */
          /* CANDIDATE PROFILE */
          /* ============================= */

            <>
              <div className="profile-header">
                <div>
                  <h2>Candidate Profile</h2>
                  <p>
                    Keep your personal and professional
                    information up to date.
                  </p>
                </div>

                <div className="profile-avatar">
                  <User size={30} />
                </div>
              </div>

              {message && (
                <div className="profile-success">
                  {message}
                </div>
              )}

              {error && (
                <div className="profile-error">
                  {error}
                </div>
              )}

              <form
                className="profile-form"
                onSubmit={handleCandidateSubmit}
              >
                <div className="profile-form-grid">

                  {/* Phone */}
                  <div className="profile-input-group">
                    <label>
                      <Phone size={17} />
                      Phone Number
                    </label>

                    <input
                      type="text"
                      name="phone"
                      value={candidateProfile.phone}
                      onChange={handleCandidateChange}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Location */}
                  <div className="profile-input-group">
                    <label>
                      <MapPin size={17} />
                      Location
                    </label>

                    <input
                      type="text"
                      name="location"
                      value={candidateProfile.location}
                      onChange={handleCandidateChange}
                      placeholder="Chennai, India"
                    />
                  </div>

                  {/* Experience */}
                  <div className="profile-input-group">
                    <label>
                      <Briefcase size={17} />
                      Years of Experience
                    </label>

                    <input
                      type="number"
                      name="experience_years"
                      value={
                        candidateProfile.experience_years
                      }
                      onChange={handleCandidateChange}
                      min="0"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="profile-input-group full-width">
                  <label>
                    <Code2 size={17} />
                    Skills
                  </label>

                  <textarea
                    name="skills"
                    value={candidateProfile.skills}
                    onChange={handleCandidateChange}
                    placeholder="Python, React, Machine Learning, SQL..."
                    rows={4}
                  />
                </div>

                {/* Education */}
                <div className="profile-input-group full-width">
                  <label>
                    <GraduationCap size={17} />
                    Education
                  </label>

                  <textarea
                    name="education"
                    value={candidateProfile.education}
                    onChange={handleCandidateChange}
                    placeholder="B.Tech Artificial Intelligence and Data Science..."
                    rows={4}
                  />
                </div>

                <button
                  type="submit"
                  className="save-profile-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="loading-spinner"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Profile
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;