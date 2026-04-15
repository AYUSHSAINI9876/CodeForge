import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "./repoDetail.css";

const RepoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repo, setRepo] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("code"); // 'code', 'issues', 'settings'
  
  // Issue Creation State
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDesc, setIssueDesc] = useState("");

  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchRepoAndIssues = async () => {
      try {
        const repoRes = await axios.get(`http://localhost:3002/repo/${id}`);
        if(repoRes.data && repoRes.data.length > 0) {
           setRepo(repoRes.data[0]);
        } else {
           setErrorMsg("Repository not found.");
        }

        const issuesRes = await axios.get(`http://localhost:3002/issue/all/${id}`);
        if(issuesRes.data) {
          setIssues(issuesRes.data.reverse());
        }
      } catch (err) {
        console.error("Failed fetching directory details: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepoAndIssues();
  }, [id]);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if(!issueTitle || !issueDesc) return;
    try {
      const res = await axios.post(`http://localhost:3002/issue/create/${id}`, {
        title: issueTitle,
        description: issueDesc
      });
      setIssues([res.data, ...issues]);
      setIssueTitle("");
      setIssueDesc("");
      setShowIssueForm(false);
    } catch(err) {
      console.error(err);
      alert("Failed to create issue.");
    }
  };

  const handleDeleteRepo = async () => {
    if(window.confirm("Are you incredibly sure? This cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:3002/repo/delete/${id}`);
        navigate("/");
      } catch(err) {
        alert("Delete failed.");
      }
    }
  };

  if (loading) return <><Navbar /><div className="repo-detail-container"><h2>Loading...</h2></div></>;
  if (errorMsg) return <><Navbar /><div className="repo-detail-container"><h2 style={{color: "var(--danger)"}}>{errorMsg}</h2></div></>;

  const isOwner = repo.owner?._id === currentUserId || repo.owner === currentUserId;

  return (
    <>
      <Navbar />
      <div className="repo-detail-container">
        
        {/* Repo Header */}
        <div className="repo-header">
          <div className="repo-title-wrapper">
            <h1>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              {repo.name} 
              <span className="visibility-badge">{repo.visibility ? "Public" : "Private"}</span>
            </h1>
            <p>{repo.description || "No description provided."}</p>
          </div>
          <div className="repo-actions">
            <button className="action-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
              Star
            </button>
            <button className="action-btn" onClick={() => alert("Clone URL: http://localhost:3002/git/" + repo.name)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Clone
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="repo-tabs">
          <div className={`repo-tab ${activeTab === 'code' ? 'active' : ''}`} onClick={() => setActiveTab('code')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            Code
          </div>
          <div className={`repo-tab ${activeTab === 'issues' ? 'active' : ''}`} onClick={() => setActiveTab('issues')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            Issues <span className="repo-tab-count">{issues.length}</span>
          </div>
          {isOwner && (
            <div className={`repo-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              Settings
            </div>
          )}
        </div>

        {/* Tab Contents */}
        {activeTab === 'code' && (
          <div className="tab-content">
            <div className="file-browser">
              <div className="file-browser-header">
                <span>Latest branch commit</span>
                <span>Active</span>
              </div>
              
              {(repo.content && repo.content.length > 0) ? (
                <div className="file-list">
                   {repo.content.map((file, idx) => (
                      <div className="file-item" key={idx}>
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                         {file}
                      </div>
                   ))}
                </div>
              ) : (
                <div className="empty-repo">
                  <h3>This repository is empty.</h3>
                  <p>Get started by cloning this repository or pushing from the CLI.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="tab-content">
            <div className="issues-header">
              <h3>Issues</h3>
              <button className="primary-btn" onClick={() => setShowIssueForm(!showIssueForm)}>
                {showIssueForm ? "Cancel" : "New Issue"}
              </button>
            </div>

            {showIssueForm && (
              <form className="create-issue-form" onSubmit={handleCreateIssue}>
                <input 
                  type="text" 
                  placeholder="Issue Title" 
                  value={issueTitle}
                  onChange={e => setIssueTitle(e.target.value)}
                  required 
                />
                <textarea 
                  placeholder="Describe the issue, bug, or feature request..." 
                  value={issueDesc}
                  onChange={e => setIssueDesc(e.target.value)}
                  required 
                />
                <button type="submit" className="primary-btn">Submit new issue</button>
              </form>
            )}

            {issues.length > 0 ? (
              <div className="issue-list">
                {issues.map(issue => (
                  <div className="issue-item" key={issue._id}>
                    <svg className={`issue-icon ${issue.status === 'closed' ? 'closed' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <div>
                      <h4 className="issue-title">{issue.title}</h4>
                      <p className="issue-meta">
                         #{issue._id.slice(-4)} opened {new Date(issue.createdAt).toLocaleDateString()} • {issue.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-repo">
                <p>No open issues! Your project is running smoothly.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && isOwner && (
          <div className="tab-content">
             <div className="settings-section">
                <h3>General Settings</h3>
                <p>Repository name and basic parameters.</p>
                {/* Could add a rename form here in the future */}
                <button className="action-btn" style={{marginTop: "16px"}} onClick={() => alert("Settings toggled")}>Update Environment</button>
             </div>

             <div className="danger-zone">
                <h3>Danger Zone</h3>
                <p>Deleting a repository is irreversible. All issues, source codes, and commit histories will be annihilated securely.</p>
                <button 
                  className="primary-btn" 
                  style={{background: "var(--danger)", marginTop: "16px"}}
                  onClick={handleDeleteRepo}
                >
                  Delete this repository
                </button>
             </div>
          </div>
        )}

      </div>
    </>
  );
};

export default RepoDetail;
