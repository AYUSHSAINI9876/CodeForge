import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import Navbar from "../Navbar";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchRepositories = async () => {
      try {
        const response = await fetch(
          `http://localhost:3002/repo/user/${userId}`
        );
        const data = await response.json();
        setRepositories(data.repositories || []);
      } catch (err) {
        console.error("Error while fetching repositories: ", err);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(`http://localhost:3002/repo/all`);
        const data = await response.json();
        setSuggestedRepositories(data || []);
      } catch (err) {
        console.error("Error while fetching suggested repositories: ", err);
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
  }, []);

  useEffect(() => {
    if (searchQuery === "") {
      setSearchResults(repositories);
    } else {
      const filteredRepo = repositories.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  return (
    <>
      <Navbar />
      <section className="dashboard-container">
        
        {/* Left Column: Suggested Repositories */}
        <aside className="dashboard-section">
          <h3>Suggested Repositories</h3>
          {suggestedRepositories.length === 0 && (
             <p style={{color: "var(--text-muted)", fontSize: "0.9rem"}}>No suggested repositories found.</p>
          )}
          {suggestedRepositories.map((repo) => {
            return (
              <div 
                key={repo._id} 
                className="repo-card"
                onClick={() => navigate(`/repo/${repo._id}`)}
                style={{cursor: "pointer"}}
              >
                <h4>{repo.name}</h4>
                <p>{repo.description || "No description provided."}</p>
              </div>
            );
          })}
        </aside>
        
        {/* Center Column: Your Repositories */}
        <main className="dashboard-section">
          <h2>Your Repositories</h2>
          <div className="search-bar">
            {/* simple search icon svg */}
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              value={searchQuery}
              placeholder="Find a repository..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchResults.length === 0 && (
             <p style={{color: "var(--text-muted)", textAlign: "center", marginTop: "20px"}}>You don't have any repositories yet.</p>
          )}
          {searchResults.map((repo) => {
            return (
              <div 
                key={repo._id} 
                className="repo-card"
                onClick={() => navigate(`/repo/${repo._id}`)}
                style={{cursor: "pointer"}}
              >
                <h4>{repo.name}</h4>
                <p>{repo.description || "No description available."}</p>
              </div>
            );
          })}
        </main>
        
        {/* Right Column: Community & Events */}
        <aside className="dashboard-section events-section">
          <h3>Community Feed</h3>
          <div className="community-card animate-fade-in">
             <div className="community-header">
                <div className="user-avatar-small" style={{background: "var(--accent-yellow)"}}></div>
                <strong>janesmith</strong> starred <strong>CodeForge</strong>
             </div>
             <p className="community-meta">2 hours ago</p>
          </div>
          <div className="community-card animate-fade-in" style={{animationDelay: "0.1s"}}>
             <div className="community-header">
                <div className="user-avatar-small" style={{background: "var(--accent-green)"}}></div>
                <strong>mikeross</strong> pushed to <strong>main</strong> in <strong>atlas-core</strong>
             </div>
             <p className="community-meta">5 hours ago</p>
          </div>

          <h3>Upcoming Events</h3>
          <ul className="events-list">
            <li className="event-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-yellow)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <p>Tech Conference - Dec 15</p>
            </li>
            <li className="event-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-yellow)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <p>Developer Meetup - Dec 25</p>
            </li>
          </ul>

          <div className="explore-more-box">
             <h4>Explore More</h4>
             <p>Discover new projects and developers tailored to your interests.</p>
             <button className="secondary-btn" style={{width: "100%"}}>Browse Marketplace</button>
          </div>
        </aside>
      </section>

      {/* New Down Section: Explore Feed */}
      <section className="explore-feed-section">
         <div className="explore-header">
            <h2>Explore the Forge</h2>
            <p>Discover trending repositories and global activity.</p>
         </div>
         <div className="explore-grid">
            {[
               { name: "quantum-js", desc: "A high-performance quantum computing library for Node.js.", stars: "2.4k", lang: "JavaScript", color: "var(--accent-yellow)" },
               { name: "oxide-db", desc: "Rust-based distributed database with extreme ACID compliance.", stars: "8.1k", lang: "Rust", color: "#f74c00" },
               { name: "nebula-css", desc: "Next-gen CSS framework with built-in glassmorphism utilities.", stars: "1.2k", lang: "CSS", color: "var(--accent-green)" },
               { name: "forge-cli", desc: "The ultimate CLI tool for managing your CodeForge instances.", stars: "542", lang: "Go", color: "#00add8" }
            ].map((item, i) => (
               <div key={i} className="explore-card">
                  <div className="explore-card-top">
                     <h4>{item.name}</h4>
                     <button className="star-btn-small">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                        Star
                     </button>
                  </div>
                  <p>{item.desc}</p>
                  <div className="explore-card-bottom">
                     <span className="lang-indicator">
                        <span className="lang-dot" style={{background: item.color}}></span>
                        {item.lang}
                     </span>
                     <span className="star-count">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                        {item.stars}
                     </span>
                  </div>
               </div>
            ))}
         </div>
      </section>
    </>
  );
};

export default Dashboard;
