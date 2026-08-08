import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../api/client";
import "./profile.css";
import Navbar from "../Navbar";
import HeatMapProfile from "./HeatMap";
import EditProfileModal from "./EditProfileModal";
import { useAuth } from "../../authContext";
import { useToast } from "../../context/ToastContext";
import { SkeletonList } from "../common/Skeleton";

const Profile = () => {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const { setCurrentUser } = useAuth();
  const { showError } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [profileUser, setProfileUser] = useState(null);
  const [me, setMe] = useState(null);
  const [userRepos, setUserRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followBusy, setFollowBusy] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const myId = localStorage.getItem("userId");
  const viewingId = routeId || myId;
  const isOwnProfile = viewingId === myId;

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, reposRes] = await Promise.all([
        apiClient.get(`/userProfile/${viewingId}`),
        apiClient.get(`/repo/user/${viewingId}`),
      ]);
      setProfileUser(profileRes.data);
      setUserRepos(reposRes.data.repositories || []);

      if (!isOwnProfile) {
        const meRes = await apiClient.get("/me");
        setMe(meRes.data);
      }
    } catch (err) {
      console.error("Cannot fetch user details: ", err);
      showError("Could not load this profile.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingId, isOwnProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const isFollowing = me?.followedUsers?.some((u) => (u._id || u) === viewingId);

  const handleFollowToggle = async () => {
    if (followBusy) return;
    setFollowBusy(true);
    try {
      const res = await apiClient.patch(`/user/${viewingId}/follow`);
      setMe((prev) => ({
        ...prev,
        followedUsers: res.data.following
          ? [...(prev.followedUsers || []), viewingId]
          : (prev.followedUsers || []).filter((u) => (u._id || u) !== viewingId),
      }));
      setProfileUser((prev) => ({
        ...prev,
        followerCount: (prev.followerCount || 0) + (res.data.following ? 1 : -1),
      }));
    } catch (err) {
      console.error(err);
      showError("Could not update follow status.");
    } finally {
      setFollowBusy(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="profile-page-wrapper" style={{ paddingTop: "2rem" }}>
          <SkeletonList count={4} />
        </div>
      </>
    );
  }

  if (!profileUser) {
    return (
      <>
        <Navbar />
        <div className="profile-page-wrapper" style={{ paddingTop: "2rem" }}>
          <h2>User not found.</h2>
        </div>
      </>
    );
  }

  const pinnedRepos = userRepos.slice(0, 4);

  return (
    <>
      <Navbar />

      <div className="profile-sub-nav">
        <div className="sub-nav-container">
          <div
            className={`sub-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Overview
          </div>

          <div
            className={`sub-nav-item ${activeTab === 'repos' ? 'active' : ''}`}
            onClick={() => setActiveTab('repos')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            Repositories <span className="tab-count">{userRepos.length}</span>
          </div>
        </div>
      </div>

      <div className="profile-page-wrapper">
        <div className="user-profile-sidebar">
          <div className="profile-image-container">
            <div className="profile-avatar" style={{background: 'var(--mixture-gradient)'}}>
              {profileUser.username[0]?.toUpperCase()}
            </div>
          </div>

          <div className="user-info">
            <h1 className="display-name">{profileUser.username}</h1>
            <p className="username">@{profileUser.username.toLowerCase()}</p>
            {profileUser.bio && <p className="bio">{profileUser.bio}</p>}

            {isOwnProfile ? (
              <button className="edit-profile-btn secondary-btn" onClick={() => setShowEditModal(true)}>
                Edit profile
              </button>
            ) : (
              <button
                className={isFollowing ? "secondary-btn" : "primary-btn"}
                style={{ width: "100%" }}
                onClick={handleFollowToggle}
                disabled={followBusy}
              >
                {followBusy ? "..." : isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}

            <div className="stats-social">
               <div className="stat-line">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  <strong>{profileUser.followerCount ?? 0}</strong> followers · <strong>{profileUser.followingCount ?? 0}</strong> following
               </div>

               {profileUser.location && (
                 <div className="info-line">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {profileUser.location}
                 </div>
               )}
               {profileUser.website && (
                 <div className="info-line">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    <a href={profileUser.website} target="_blank" rel="noreferrer">{profileUser.website}</a>
                 </div>
               )}
            </div>

            {isOwnProfile && (
              <button
                 onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    setCurrentUser(null);
                    navigate("/auth", { replace: true });
                 }}
                 className="logout-action-btn"
              >
                 Logout from Account
              </button>
            )}
          </div>
        </div>

        <div className="profile-main-content">
          {activeTab === 'overview' && (
            <>
              <div className="pinned-section">
                <div className="section-header">
                  <h3>Pinned</h3>
                </div>
                {pinnedRepos.length > 0 ? (
                  <div className="pinned-grid">
                    {pinnedRepos.map((repo) => (
                      <div key={repo._id} className="pinned-card" onClick={() => navigate(`/repo/${repo._id}`)}>
                        <div className="pinned-card-header">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                          <strong>{repo.name}</strong>
                          <span className="mini-badge">{repo.visibility ? "Public" : "Private"}</span>
                        </div>
                        <p className="pinned-desc">{repo.description || "Building something amazing."}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{color: "var(--text-muted)"}}>No repositories yet.</p>
                )}
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
               <div className="repo-items-container">
                  {userRepos.length === 0 && <p style={{color: "var(--text-muted)"}}>No repositories yet.</p>}
                  {userRepos.map(repo => (
                     <div key={repo._id} className="repo-list-item" onClick={() => navigate(`/repo/${repo._id}`)}>
                        <div className="repo-item-left">
                           <h3>{repo.name} <span className="mini-badge">{repo.visibility ? "Public" : "Private"}</span></h3>
                           <p>{repo.description || "No description provided."}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>

      {isOwnProfile && (
        <EditProfileModal
          open={showEditModal}
          user={{ _id: viewingId, ...profileUser }}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) => setProfileUser((prev) => ({ ...prev, ...updated }))}
        />
      )}
    </>
  );
};

export default Profile;
