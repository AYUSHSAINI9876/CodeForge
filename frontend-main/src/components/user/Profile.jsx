import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./profile.css";
import Navbar from "../Navbar";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";

const Profile = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({ username: "Loading..." });
  const [userRepos, setUserRepos] = useState([]);
  const { setCurrentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("userId");

      if (userId) {
        try {
          const response = await axios.get(
            `http://localhost:3002/userProfile/${userId}`
          );
          setUserDetails(response.data);
          
          // Fetch user's repositories for the repos tab
          const repoRes = await axios.get(`http://localhost:3002/repo/user/${userId}`);
          setUserRepos(repoRes.data.repositories || []);
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
          setUserDetails({ username: "Guest User" });
        }
      }
    };
    fetchUserDetails();
  }, []);

  // Mock data for personal profile feel
  const profileInfo = {
    bio: "Full-stack developer passionate about building open-source tools and contributing to the forge. 🚀",
    location: "San Francisco, CA",
    website: "https://ayush.dev",
    twitter: "@ayush_forge",
    company: "@CodeForge-Core",
    pinned: userRepos.slice(0, 4)
  };

  return (
    <>
      <Navbar />

      <div className="profile-sub-nav">
        <div className="sub-nav-container">
          <div 
            className={`sub-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Overview
          </div>

          <div 
            className={`sub-nav-item ${activeTab === 'repos' ? 'active' : ''}`}
            onClick={() => setActiveTab('repos')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            Repositories <span className="tab-count">{userRepos.length}</span>
          </div>

          <div className="sub-nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            Packages
          </div>

          <div className="sub-nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            Stars
          </div>
        </div>
      </div>

      <div className="profile-page-wrapper">
        <div className="user-profile-sidebar">
          <div className="profile-image-container">
            <div className="profile-avatar" style={{background: 'var(--mixture-gradient)'}}>
              {userDetails.username[0]}
            </div>
            <div className="status-badge">
               <span>🎯</span> Working on CodeForge UI
            </div>
          </div>

          <div className="user-info">
            <h1 className="display-name">{userDetails.username}</h1>
            <p className="username">{userDetails.username.toLowerCase()}</p>
            <p className="bio">{profileInfo.bio}</p>
            
            <button className="edit-profile-btn secondary-btn">Edit profile</button>

            <div className="stats-social">
               <div className="stat-line">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  <strong>10</strong> followers · <strong>3</strong> following
               </div>
               
               <div className="info-line">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {profileInfo.location}
               </div>
               <div className="info-line">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  <a href={profileInfo.website} target="_blank" rel="noreferrer">{profileInfo.website}</a>
               </div>
               <div className="info-line">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                  {profileInfo.twitter}
               </div>
            </div>

            <div className="org-section">
               <h3>Organizations</h3>
               <div className="org-list">
                  <div className="org-item" style={{background: "var(--accent-red)"}}></div>
                  <div className="org-item" style={{background: "var(--accent-yellow)"}}></div>
                  <div className="org-item" style={{background: "var(--accent-green)"}}></div>
               </div>
            </div>
            
            <button
               onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("userId");
                  setCurrentUser(null);
                  window.location.href = "/auth";
               }}
               className="logout-action-btn"
            >
               Logout from Account
            </button>
          </div>
        </div>

        <div className="profile-main-content">
          {activeTab === 'overview' && (
            <>
              <div className="pinned-section">
                <div className="section-header">
                  <h3>Pinned</h3>
                  <span>Customize your pins</span>
                </div>
                <div className="pinned-grid">
                  {(profileInfo.pinned.length > 0 ? profileInfo.pinned : userRepos.slice(0, 4)).map((repo, i) => (
                    <div key={i} className="pinned-card" onClick={() => navigate(`/repo/${repo._id}`)}>
                      <div className="pinned-card-header">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                        <strong>{repo.name}</strong>
                        <span className="mini-badge">Public</span>
                      </div>
                      <p className="pinned-desc">{repo.description || "Building something amazing."}</p>
                      <div className="pinned-footer">
                        <span className="lang-indicator">
                           <span className="lang-dot" style={{background: "var(--accent-yellow)"}}></span>
                           JavaScript
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="contribution-section">
                <h3>Contribution Activity</h3>
                <div className="heat-map-container">
                  <HeatMapProfile />
                </div>
              </div>
            </>
          )}

          {activeTab === 'repos' && (
            <div className="repos-list-section animate-fade-in">
               <div className="repo-search-filter">
                  <input type="text" placeholder="Search repositories..." className="repo-mini-search" />
                  <div className="filter-btns">
                     <button className="secondary-btn-small">Type</button>
                     <button className="secondary-btn-small">Language</button>
                     <button className="secondary-btn-small">Sort</button>
                  </div>
               </div>
               
               <div className="repo-items-container">
                  {userRepos.map(repo => (
                     <div key={repo._id} className="repo-list-item" onClick={() => navigate(`/repo/${repo._id}`)}>
                        <div className="repo-item-left">
                           <h3>{repo.name} <span className="mini-badge">Public</span></h3>
                           <p>{repo.description || "No description provided."}</p>
                           <div className="repo-item-meta">
                              <span className="lang-indicator">
                                 <span className="lang-dot" style={{background: "var(--accent-yellow)"}}></span>
                                 JavaScript
                              </span>
                              <span>Updated 2 days ago</span>
                           </div>
                        </div>
                        <div className="repo-item-right">
                           <button className="star-btn-small">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                              Star
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
