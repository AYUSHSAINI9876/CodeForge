import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "./createRepo.css";

const CreateRepo = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState(true); // true = public, false = private
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setErrorMsg("Authentication failed. Please sign in again.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3002/repo/create", {
        name,
        description,
        visibility,
        owner: userId,
        content: [],
        issues: []
      });

      setSuccessMsg("Repository created successfully!");
      setLoading(false);
      
      // Navigate to dashboard after short delay
      setTimeout(() => {
        navigate("/");
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Failed to create repository.");
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
          
          {errorMsg && <div className="msg-error">{errorMsg}</div>}
          {successMsg && <div className="msg-success">{successMsg}</div>}

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
