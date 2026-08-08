import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import Navbar from "../Navbar";
import apiClient from "../../api/client";
import { SkeletonList } from "../common/Skeleton";

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [label, secondsPerUnit] of units) {
    const value = Math.floor(seconds / secondsPerUnit);
    if (value >= 1) return `${value} ${label}${value === 1 ? "" : "s"} ago`;
  }
  return "just now";
}

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const debouncedSearch = useDebouncedValue(searchQuery, 250);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchRepositories = async () => {
      try {
        const response = await apiClient.get(`/repo/user/${userId}`);
        setRepositories(response.data.repositories || []);
      } catch (err) {
        console.error("Error while fetching repositories: ", err);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await apiClient.get("/repo/all");
        setSuggestedRepositories(response.data.repositories || []);
      } catch (err) {
        console.error("Error while fetching suggested repositories: ", err);
      }
    };

    Promise.all([fetchRepositories(), fetchSuggestedRepositories()]).finally(() => setLoading(false));
  }, []);

  const searchResults = useMemo(() => {
    if (!debouncedSearch) return repositories;
    return repositories.filter((repo) =>
      repo.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [debouncedSearch, repositories]);

  const recentActivity = useMemo(() => suggestedRepositories.slice(0, 5), [suggestedRepositories]);

  return (
    <>
      <Navbar />
      <section className="dashboard-container">

        {/* Left Column: Suggested Repositories */}
        <aside className="dashboard-section">
          <h3>Suggested Repositories</h3>
          {loading ? (
            <SkeletonList count={3} />
          ) : suggestedRepositories.length === 0 ? (
            <p style={{color: "var(--text-muted)", fontSize: "0.9rem"}}>No suggested repositories found.</p>
          ) : (
            suggestedRepositories.map((repo) => (
              <div
                key={repo._id}
                className="repo-card"
                onClick={() => navigate(`/repo/${repo._id}`)}
                style={{cursor: "pointer"}}
              >
                <h4>{repo.name}</h4>
                <p>{repo.description || "No description provided."}</p>
              </div>
            ))
          )}
        </aside>

        {/* Center Column: Your Repositories */}
        <main className="dashboard-section">
          <h2>Your Repositories</h2>
          <div className="search-bar">
            {/* simple search icon svg */}
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              value={searchQuery}
              placeholder="Find a repository..."
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Find a repository"
            />
          </div>
          {loading ? (
            <SkeletonList count={4} />
          ) : searchResults.length === 0 ? (
             <p style={{color: "var(--text-muted)", textAlign: "center", marginTop: "20px"}}>
               {repositories.length === 0 ? "You don't have any repositories yet." : "No repositories match your search."}
             </p>
          ) : (
            searchResults.map((repo) => (
              <div
                key={repo._id}
                className="repo-card"
                onClick={() => navigate(`/repo/${repo._id}`)}
                style={{cursor: "pointer"}}
              >
                <h4>{repo.name}</h4>
                <p>{repo.description || "No description available."}</p>
              </div>
            ))
          )}
        </main>

        {/* Right Column: Activity */}
        <aside className="dashboard-section events-section">
          <h3>Recent Activity</h3>
          {loading ? (
            <SkeletonList count={3} />
          ) : recentActivity.length === 0 ? (
            <p style={{color: "var(--text-muted)", fontSize: "0.9rem"}}>
              No public activity yet. Create a repository to get started.
            </p>
          ) : (
            recentActivity.map((repo) => (
              <div
                key={repo._id}
                className="community-card animate-fade-in"
                onClick={() => navigate(`/repo/${repo._id}`)}
                style={{cursor: "pointer"}}
              >
                <div className="community-header">
                  <div className="user-avatar-small" style={{background: "var(--mixture-gradient)"}}>
                    {(repo.owner?.username || "?")[0].toUpperCase()}
                  </div>
                  <span>
                    <strong>{repo.owner?.username || "someone"}</strong> created{" "}
                    <strong>{repo.name}</strong>
                  </span>
                </div>
                <p className="community-meta">{formatRelativeTime(repo.createdAt)}</p>
              </div>
            ))
          )}
        </aside>
      </section>

      {/* Explore Feed — real public repositories */}
      <section className="explore-feed-section">
         <div className="explore-header">
            <h2>Explore the Forge</h2>
            <p>Discover public repositories from across the community.</p>
         </div>
         {loading ? (
           <div className="explore-grid"><SkeletonList count={4} /></div>
         ) : suggestedRepositories.length === 0 ? (
           <p style={{color: "var(--text-muted)", textAlign: "center"}}>
             No public repositories yet — be the first to publish one.
           </p>
         ) : (
           <div className="explore-grid">
              {suggestedRepositories.slice(0, 8).map((repo) => (
                 <div
                   key={repo._id}
                   className="explore-card"
                   onClick={() => navigate(`/repo/${repo._id}`)}
                   style={{cursor: "pointer"}}
                 >
                    <div className="explore-card-top">
                       <h4>{repo.name}</h4>
                    </div>
                    <p>{repo.description || "No description provided."}</p>
                    <div className="explore-card-bottom">
                       <span className="lang-indicator">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          {repo.owner?.username || "unknown"}
                       </span>
                       <span className="star-count">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                          {repo.stars?.length ?? 0}
                       </span>
                    </div>
                 </div>
              ))}
           </div>
         )}
      </section>
    </>
  );
};

export default Dashboard;
