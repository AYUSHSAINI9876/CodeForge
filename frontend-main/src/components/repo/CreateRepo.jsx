import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/client";
import Navbar from "../Navbar";
import { useToast } from "../../context/ToastContext";
import "./createRepo.css";

const CreateRepo = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState(true); // true = public, false = private
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await apiClient.post("/repo/create", {
        name,
        description,
        visibility,
      });

      showSuccess("Repository created successfully!");
      navigate(`/repo/${res.data.repositoryID}`);
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.error || "Failed to create repository.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-repo-container">
        <div className="create-repo-card">
          <h2>Create a new repository</h2>
          <p className="subtitle">A repository contains all project files, including the revision history.</p>

          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label htmlFor="repoName">Repository name <span style={{color: "var(--danger)"}}>*</span></label>
              <input
                type="text"
                id="repoName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. hello-world"
                required
                minLength={2}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description (optional)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what this project is about..."
              />
            </div>

            <div className="form-group">
              <label>Visibility</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === true}
                    onChange={() => setVisibility(true)}
                  />
                  <div className="radio-text">
                    <h4>Public</h4>
                    <p>Anyone on the internet can see this repository. You choose who can commit.</p>
                  </div>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === false}
                    onChange={() => setVisibility(false)}
                  />
                  <div className="radio-text">
                    <h4>Private</h4>
                    <p>You choose who can see and commit to this repository.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="btn-group">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/")}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create repository"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateRepo;
