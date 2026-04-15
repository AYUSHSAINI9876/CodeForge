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
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
          setUserDetails({ username: "Guest User" });
        }
      }
    };
    fetchUserDetails();
  }, []);

  return (
    <>
      <Navbar />

      <div className="sub-nav">
        <div 
          className={`sub-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          Overview
        </div>

        <div 
          className={`sub-nav-item ${activeTab === 'repos' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('repos');
            navigate("/repo");
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          Repositories
        </div>
      </div>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          setCurrentUser(null);
          window.location.href = "/auth";
        }}
        className="logout-btn"
      >
        Logout
      </button>

      <div className="profile-page-wrapper">
        <div className="user-profile-section">
          {/* Using a placeholder gradient pattern for the avatar */}
          <div className="profile-image" style={{background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'}}></div>

          <div className="name">
            <h3>{userDetails.username}</h3>
          </div>

          <button className="follow-btn primary-btn">Follow</button>

          <div className="follower">
            <p><span>10</span> Followers</p>
            <p><span>3</span> Following</p>
          </div>
        </div>

        <div className="heat-map-section">
          <HeatMapProfile />
        </div>
      </div>
    </>
  );
};

export default Profile;
