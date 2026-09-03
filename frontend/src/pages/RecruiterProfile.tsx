import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

interface RecruiterProfileData {
  id?: number;
  company_name: string;
  company_website: string;
  company_description: string;
  company_location: string;
}

function RecruiterProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<RecruiterProfileData>({
    company_name: "",
    company_website: "",
    company_description: "",
    company_location: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/users/recruiter-profile/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setProfile(data);
      } else if (response.status === 404) {
        // Profile doesn't exist yet
        setMessage("Please create your recruiter profile.");
      } else if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
      } else {
        setError(data.detail || "Failed to load recruiter profile.");
      }
    } catch (err) {
      console.error(err);
      setError("Cannot connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const method = profile.id ? "PUT" : "POST";

      const response = await fetch(
        "http://127.0.0.1:8000/api/users/recruiter-profile/",
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            company_name: profile.company_name,
            company_website: profile.company_website,
            company_description: profile.company_description,
            company_location: profile.company_location,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setProfile(data);

        setMessage(
          profile.id
            ? "Recruiter profile updated successfully!"
            : "Recruiter profile created successfully!"
        );
      } else if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
      } else {
        setError(
          data.detail || "Failed to save recruiter profile."
        );
      }
    } catch (err) {
      console.error(err);
      setError("Cannot connect to the backend server.");
    }
  };

  if (loading) {
    return (
      <div>
        <h2>Loading recruiter profile...</h2>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate("/dashboard")}>
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <h1>Recruiter Profile</h1>

      <p>
        Manage your company information and recruiter profile.
      </p>

      {message && <p>{message}</p>}

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Company Name */}
        <div>
          <label>Company Name</label>
          <br />

          <input
            type="text"
            name="company_name"
            value={profile.company_name}
            onChange={handleChange}
            placeholder="Enter company name"
            required
          />
        </div>

        <br />

        {/* Company Website */}
        <div>
          <label>Company Website</label>
          <br />

          <input
            type="url"
            name="company_website"
            value={profile.company_website}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>

        <br />

        {/* Company Location */}
        <div>
          <label>Company Location</label>
          <br />

          <input
            type="text"
            name="company_location"
            value={profile.company_location}
            onChange={handleChange}
            placeholder="Chennai"
          />
        </div>

        <br />

        {/* Company Description */}
        <div>
          <label>Company Description</label>
          <br />

          <textarea
            name="company_description"
            value={profile.company_description}
            onChange={handleChange}
            placeholder="Tell us about your company"
            rows={6}
          />
        </div>

        <br />

        <button type="submit">
          <Save size={18} />
          Save Profile
        </button>
      </form>
    </div>
  );
}

export default RecruiterProfile;