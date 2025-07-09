import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { FaArrowLeft, FaUsers, FaUserPlus, FaUserEdit, FaUserTimes } from 'react-icons/fa';
import "../styles/pages/AdminUsersPage.css";
import { getActiveUsers } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getActiveUsers(token);
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchUsers();
  }, [token]);

  return (
    <div className="admin-users-container">
      <Header />
      <main className="users-main-content">
        <div className="users-header">
          <button className="back-button" onClick={() => navigate("/admin")}> <FaArrowLeft /> Back to Admin Dashboard </button>
          <h1>User Management</h1>
          <button className="add-user-button"> <FaUserPlus /> Add User </button>
        </div>
        <div className="active-users-section">
          <h3>Active Users</h3>
          {loading && <p>Loading users...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <ul>
            {users.map((user, idx) => (
              <li key={idx}>{user.username || user.usermail || JSON.stringify(user)}</li>
            ))}
          </ul>
        </div>
        <div className="users-content">
          <div className="coming-soon">
            <FaUsers className="coming-soon-icon" />
            <h2>User Management Coming Soon</h2>
            <p>This feature will allow administrators to manage user accounts, permissions, and access levels.</p>
            <div className="feature-list">
              <div className="feature-item">
                <FaUserPlus />
                <span>Add new users</span>
              </div>
              <div className="feature-item">
                <FaUserEdit />
                <span>Edit user profiles</span>
              </div>
              <div className="feature-item">
                <FaUserTimes />
                <span>Deactivate accounts</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUsersPage; 