import { useEffect, useState } from "react";
import "./Resume.css";
import DashboardLayout from "../components/DashboardLayout";
import {
  FileUp,
  CheckCircle,
  LoaderCircle,
  FileText,
  Download,
  Trash2,
} from "lucide-react";

interface ResumeData {
  id: number;
  file: string;
  original_filename: string;
  uploaded_at: string;
}

function Resume() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingResume, setExistingResume] = useState<ResumeData | null>(null);

  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchResume();
  }, []);

  // ==========================================
  // GET EXISTING RESUME
  // ==========================================
  const fetchResume = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/resume/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExistingResume(data);
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SELECT FILE
  // ==========================================
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please select a PDF, DOC, or DOCX file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("File size must be less than 5 MB.");
      return;
    }

    setSelectedFile(file);
    setMessage("");
  };

  // ==========================================
  // UPLOAD / REPLACE RESUME
  // ==========================================
  const handleUpload = async () => {
    if (!selectedFile) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      setMessage("You are not logged in.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/users/resume/upload/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (response.ok) {
        setExistingResume(data.resume);
        setSelectedFile(null);
        setMessage("Resume uploaded successfully! 🎉");
      } else {
        setMessage(data.error || "Failed to upload resume.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Cannot connect to the server.");
    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // DELETE RESUME
  // ==========================================
  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your resume?",
    );

    if (!confirmed) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      setMessage("You are not logged in.");
      return;
    }

    setDeleting(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/users/resume/delete/",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        setExistingResume(null);
        setSelectedFile(null);
        setMessage("Resume deleted successfully!");
      } else {
        setMessage(data.error || "Failed to delete resume.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setMessage("Cannot connect to the server.");
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <DashboardLayout
        title="My Resume"
        subtitle="Upload and manage your resume"
      >
        <div className="profile-page">
          <div className="profile-card">
            <p>Loading your resume...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Resume" subtitle="Upload and manage your resume">
      <div className="profile-page">
        <div className="profile-card">
          <h2>Resume Management</h2>
          <p>Upload and manage your latest resume.</p>

          {/* EXISTING RESUME */}
          {existingResume && !selectedFile && (
            <>
              <div className="selected-file">
                <CheckCircle size={45} />

                <div>
                  <h3>Resume Uploaded</h3>

                  <p>{existingResume.original_filename}</p>

                  <span>
                    Uploaded on{" "}
                    {new Date(existingResume.uploaded_at).toLocaleDateString()}
                  </span>
                </div>

                <a
                  href={existingResume.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="change-file-button"
                >
                  <Download size={16} />
                  View Resume
                </a>
              </div>

              <div className="resume-actions">
                <label className="browse-jobs-button">
                  <FileUp size={18} />
                  Replace Resume
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    hidden
                    onChange={handleFileChange}
                  />
                </label>

                <button
                  className="delete-resume-button"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 size={18} />

                  {deleting ? "Deleting..." : "Delete Resume"}
                </button>
              </div>
            </>
          )}

          {/* UPLOAD NEW RESUME */}
          {!existingResume && !selectedFile && (
            <div className="upload-area">
              <div className="profile-placeholder-icon">
                <FileUp size={42} />
              </div>

              <h3>Upload Your Resume</h3>

              <p>Upload your resume in PDF, DOC, or DOCX format.</p>

              <label className="browse-jobs-button">
                <FileUp size={18} />
                Choose File
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  hidden
                  onChange={handleFileChange}
                />
              </label>

              <span className="upload-note">Maximum file size: 5MB</span>
            </div>
          )}

          {/* NEW FILE SELECTED */}
          {selectedFile && (
            <>
              <div className="selected-file">
                <FileText size={45} />

                <div>
                  <h3>New Resume Selected</h3>

                  <p>{selectedFile.name}</p>

                  <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>

              <button
                className="upload-resume-button"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <LoaderCircle size={18} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FileUp size={18} />
                    Upload Resume
                  </>
                )}
              </button>
            </>
          )}

          {/* MESSAGE */}
          {message && <p className="upload-message">{message}</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Resume;
