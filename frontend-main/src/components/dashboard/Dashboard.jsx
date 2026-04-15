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
        
        {/* Right Column: Upcoming Events */}
        <aside className="dashboard-section events-section">
          <h3>Upcoming Events</h3>
          <ul className="events-list">
            <li className="event-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <p>Tech Conference - Dec 15</p>
            </li>
            <li className="event-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <p>Developer Meetup - Dec 25</p>
            </li>
            <li className="event-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <p>React Summit - Jan 5</p>
            </li>
          </ul>
        </aside>
      </section>
    </>
  );
};

export default Dashboard;
