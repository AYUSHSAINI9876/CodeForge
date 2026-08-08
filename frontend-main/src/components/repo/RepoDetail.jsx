import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../api/client";
import Navbar from "../Navbar";
import HeatMap from "@uiw/react-heat-map";
import ConfirmModal from "../common/ConfirmModal";
import { useToast } from "../../context/ToastContext";
import "./repoDetail.css";

const RepoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [repo, setRepo] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("code");
  const [starBusy, setStarBusy] = useState(false);

  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDesc, setIssueDesc] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentUserId = localStorage.getItem("userId");

  const fetchRepoAndIssues = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const repoRes = await apiClient.get(`/repo/${id}`);
      setRepo(repoRes.data);

      const issuesRes = await apiClient.get(`/issue/all/${id}`);
      setIssues(Array.isArray(issuesRes.data) ? issuesRes.data : []);
    } catch (err) {
      console.error("Error loading repository: ", err);
      setErrorMsg(
        err.response?.status === 404
          ? "Repository not found. It may be private or have been deleted."
          : "Unable to load repository. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRepoAndIssues();
  }, [fetchRepoAndIssues]);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!issueTitle || !issueDesc) return;
    try {
      const res = await apiClient.post(`/issue/create/${id}`, {
        title: issueTitle,
        description: issueDesc,
      });
      setIssues([res.data, ...issues]);
      setIssueTitle("");
      setIssueDesc("");
      setShowIssueForm(false);
      showSuccess("Issue opened.");
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.error || "Failed to create issue.");
    }
  };

  const handleToggleStar = async () => {
    if (starBusy) return;
    setStarBusy(true);
    try {
      const res = await apiClient.patch(`/repo/${id}/star`);
      setRepo((prev) => ({ ...prev, isStarred: res.data.starred, starCount: res.data.starCount }));
    } catch (err) {
      console.error(err);
      showError("Failed to update star.");
    } finally {
      setStarBusy(false);
    }
  };

  const handleDeleteRepo = async () => {
    try {
      await apiClient.delete(`/repo/delete/${id}`);
      setShowDeleteConfirm(false);
      showSuccess("Repository deleted.");
      navigate("/");
    } catch (err) {
      console.error(err);
      showError("Delete failed. You may not have permission.");
    }
  };

  if (loading) return <><Navbar /><div className="repo-detail-container"><h2>Loading...</h2></div></>;
  if (errorMsg) return <><Navbar /><div className="repo-detail-container"><h2 style={{color: "var(--accent-red)"}}>{errorMsg}</h2></div></>;

  const isOwner = repo.owner?._id === currentUserId || repo.owner === currentUserId;

  // Mock data for stats that have no backing field yet.
  const stats = {
    stars: repo.starCount ?? 0,
    forks: 42,
    watching: 15,
    contributors: 8
  };

  const languages = [
    { name: "JavaScript", percentage: 75, color: "var(--accent-yellow)" },
    { name: "HTML", percentage: 15, color: "var(--accent-red)" },
    { name: "CSS", percentage: 10, color: "var(--accent-green)" }
  ];

  const value = [
    { date: '2024/01/11', count: 2 },
    { date: '2024/01/12', count: 20 },
    { date: '2024/01/13', count: 10 },
    ...[...Array(20)].map((_, i) => ({ date: `2024/02/${i+1}`, count: Math.floor(Math.random() * 20) }))
  ];

  return (
    <>
      <Navbar />
      <div className="repo-detail-container">

        {/* Repo Header */}
        <div className="repo-header">
          <div className="repo-title-wrapper">
            <h1>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              {repo.name}
              <span className="visibility-badge">{repo.visibility ? "Public" : "Private"}</span>
            </h1>
          </div>
          <div className="repo-actions">
            <button
              className="action-btn"
              onClick={handleToggleStar}
              disabled={starBusy}
              style={repo.isStarred ? { borderColor: "var(--accent-yellow)", color: "var(--accent-yellow)" } : undefined}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={repo.isStarred ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
              {repo.isStarred ? "Starred" : "Star"} <span className="repo-tab-count">{stats.stars}</span>
            </button>
            <button className="action-btn" onClick={() => showSuccess(`Clone URL copied concept: git clone ${repo.name}`)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Clone
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="repo-tabs">
          <div className={`repo-tab ${activeTab === 'code' ? 'active' : ''}`} onClick={() => setActiveTab('code')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            Code
          </div>
          <div className={`repo-tab ${activeTab === 'issues' ? 'active' : ''}`} onClick={() => setActiveTab('issues')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            Issues <span className="repo-tab-count">{issues.length}</span>
          </div>
          {isOwner && (
            <div className={`repo-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              Settings
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="repo-main-content">
          {activeTab === 'code' && (
            <>
              <p className="repo-description">{repo.description || "Building the future of software, one commit at a time. No description provided yet."}</p>
              <div className="file-browser">
                <div className="file-browser-header">
                  <div className="commit-info">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4"></circle><line x1="1.05" y1="12" x2="7" y2="12"></line><line x1="17.01" y1="12" x2="22.96" y2="12"></line></svg>
                    <strong>main</strong>
                    <span style={{color: "var(--text-muted)", marginLeft: "8px"}}>Latest commit message here...</span>
                  </div>
                  <span style={{fontSize: "0.85rem"}}>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                </div>

                {(repo.content && repo.content.length > 0) ? (
                  <div className="file-list">
                     {repo.content.map((file, idx) => (
                        <div className="file-item" key={idx}>
                           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
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

              <div className="activity-map">
                <h3 style={{marginBottom: "16px", fontSize: "1rem"}}>Contribution Activity</h3>
                <HeatMap
                  value={value}
                  width={800}
                  style={{ color: 'var(--accent-green)' }}
                  startDate={new Date('2024/01/01')}
                  panelColors={{
                    0: 'rgba(63, 185, 80, 0.05)',
                    2: 'rgba(63, 185, 80, 0.3)',
                    4: 'rgba(63, 185, 80, 0.5)',
                    10: 'rgba(63, 185, 80, 0.7)',
                    20: 'rgba(63, 185, 80, 1)',
                  }}
                />
              </div>
            </>
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
                      <svg className={`issue-icon ${issue.status === 'closed' ? 'closed' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
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
               </div>

               <div className="danger-zone">
                  <h3>Danger Zone</h3>
                  <p>Deleting a repository is irreversible. All issues, source codes, and commit histories will be annihilated securely.</p>
                  <button
                    className="primary-btn"
                    style={{background: "var(--accent-red)", marginTop: "16px", boxShadow: "0 4px 15px rgba(248, 81, 73, 0.3)"}}
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete this repository
                  </button>
               </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="repo-sidebar">
          <div className="sidebar-section">
            <h3>About</h3>
            <div className="stat-item">
              <span>Stars</span>
              <span className="stat-value">{stats.stars}</span>
            </div>
            <div className="stat-item">
              <span>Forks</span>
              <span className="stat-value">{stats.forks}</span>
            </div>
            <div className="stat-item">
              <span>Watching</span>
              <span className="stat-value">{stats.watching}</span>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Languages</h3>
            <div className="language-bar">
              {languages.map((lang, i) => (
                <div
                  key={i}
                  className="lang-progress"
                  style={{ width: `${lang.percentage}%`, background: lang.color }}
                />
              ))}
            </div>
            <div className="lang-list">
              {languages.map((lang, i) => (
                <div key={i} className="lang-item">
                  <div className="lang-dot" style={{ background: lang.color }} />
                  <strong>{lang.name}</strong>
                  <span>{lang.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Contributors</h3>
            <div className="stat-item">
              <div style={{display: "flex", gap: "-8px"}}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: `hsl(${i * 60}, 70%, 50%)`,
                    border: "2px solid var(--primary-bg)",
                    marginLeft: i === 0 ? 0 : "-10px"
                  }} />
                ))}
              </div>
              <span className="stat-value">+{stats.contributors - 5}</span>
            </div>
          </div>
        </div>

      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete this repository?"
        message="This cannot be undone. All issues and commit history will be permanently removed."
        confirmLabel="Delete repository"
        danger
        onConfirm={handleDeleteRepo}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default RepoDetail;
