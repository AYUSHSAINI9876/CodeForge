import { useState } from "react";
import apiClient from "../../api/client";
import { useToast } from "../../context/ToastContext";

const EditProfileModal = ({ open, user, onClose, onSaved }) => {
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState(() => ({
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
    currentPassword: "",
    password: "",
  }));
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        username: form.username,
        email: form.email,
        bio: form.bio,
        location: form.location,
        website: form.website,
      };
      if (form.password) {
        payload.password = form.password;
        payload.currentPassword = form.currentPassword;
      }

      const res = await apiClient.put(`/updateProfile/${user._id}`, payload);
      showSuccess("Profile updated.");
      onSaved(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-box glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
        <h3>Edit profile</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="edit-username">Username</label>
            <input id="edit-username" type="text" value={form.username} onChange={update("username")} required minLength={3} />
          </div>
          <div className="form-group">
            <label htmlFor="edit-email">Email</label>
            <input id="edit-email" type="email" value={form.email} onChange={update("email")} required />
          </div>
          <div className="form-group">
            <label htmlFor="edit-bio">Bio</label>
            <textarea id="edit-bio" value={form.bio} onChange={update("bio")} maxLength={300} />
          </div>
          <div className="form-group">
            <label htmlFor="edit-location">Location</label>
            <input id="edit-location" type="text" value={form.location} onChange={update("location")} maxLength={100} />
          </div>
          <div className="form-group">
            <label htmlFor="edit-website">Website</label>
            <input id="edit-website" type="text" value={form.website} onChange={update("website")} maxLength={200} placeholder="https://" />
          </div>

          <details style={{ marginBottom: "1rem" }}>
            <summary style={{ cursor: "pointer", color: "var(--text-muted)", fontSize: "0.9rem" }}>Change password</summary>
            <div className="form-group" style={{ marginTop: "0.75rem" }}>
              <label htmlFor="edit-current-password">Current password</label>
              <input id="edit-current-password" type="password" value={form.currentPassword} onChange={update("currentPassword")} autoComplete="current-password" />
            </div>
            <div className="form-group">
              <label htmlFor="edit-new-password">New password</label>
              <input id="edit-new-password" type="password" value={form.password} onChange={update("password")} minLength={6} autoComplete="new-password" />
            </div>
          </details>

          <div className="modal-actions">
            <button type="button" className="modal-cancel-btn" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="primary-btn" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
