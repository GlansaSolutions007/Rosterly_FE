import React, { useEffect, useState } from "react";
import axios from "axios";
import FeedbackModal from "../Component/FeedbackModal";

function Role() {
  const [roleName, setRoleName] = useState("");
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showConfirmButtons, setShowConfirmButtons] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const baseURL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");

  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${baseURL}/roles`, headers);
      console.log("Roles Response:", response.data);
      setRoles(response.data.data || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!roleName.trim()) {
      setError("Role name is required");
      return;
    }

    try {
      if (editingId) {
        await axios.put(
          `${baseURL}/roles/${editingId}`,
          { role_name: roleName },
          headers
        );
      } else {
        await axios.post(`${baseURL}/roles`, { role_name: roleName }, headers);
      }

      setRoleName("");
      setEditingId(null);
      fetchRoles();
    } catch (err) {
      console.error("Error saving role:", err);
      if (err.response?.status === 401) {
        setError("Unauthorized: Please login again.");
      } else {
        setError("Something went wrong while saving the role.");
      }
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
    setFeedbackMessage("Are you sure you want to delete?");
    setShowConfirmButtons(true);
    setFeedbackModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await axios.delete(`${baseURL}/roles/${confirmDeleteId}`, headers);
      fetchRoles();
    } catch (err) {
      console.error("Error deleting role:", err);
    } finally {
      handleCloseModal();
    }
  };
  const handleCloseModal = () => {
    setFeedbackModalOpen(false);
    setFeedbackMessage("");
    setShowConfirmButtons(false);
    setConfirmDeleteId(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseURL}/roles/${id}`, headers);
      fetchRoles();
    } catch (err) {
      console.error("Error deleting role:", err);
    }
  };

  const handleEdit = (role) => {
    setRoleName(role.role_name || "");
    setEditingId(role.id);
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="mainHeading mb-4 text-center">
        {editingId ? "Edit Role" : "Create Role"}
      </h2>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter role name"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          className="input flex-1"
        />
        <button type="submit" className="buttonSuccess">
          {editingId ? "Update" : "Add"}
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
      )}

      <h3 className="text-xl font-semibold mb-3 text-center">All Roles</h3>

      {roles.length === 0 ? (
        <p className="text-center text-gray-500">No roles found.</p>
      ) : (
        <ul className="space-y-2">
          {roles.map((role) => (
            <li
              key={role.id}
              className="flex items-center gap-2 bg-white-100 card"
            >
              <span className="flex-1 paragraph">
                {role.role_name || "Unnamed Role"}
              </span>
              <button onClick={() => handleEdit(role)} className="buttonTheme">
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(role.id)}
                className="buttonDanger"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={handleCloseModal}
        message={feedbackMessage}
        onConfirm={confirmDelete}
        showConfirmButtons={showConfirmButtons}
      />
    </div>
  );
}

export default Role;
