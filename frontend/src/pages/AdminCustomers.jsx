import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminCustomers.css";

function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/users"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch customers"
        );
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">

      {/* Header */}
      <header className="admin-header">
        <Link to="/" className="admin-logo">
          Shop<span>Nova</span>
        </Link>

        <div className="admin-header-links">
          <Link to="/admin">
            Dashboard
          </Link>

          <Link to="/" className="back-home">
            ← Back to Store
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="admin-container">

        <div className="admin-title">
          <p>SHOPNOVA ADMIN</p>

          <h1>Customers</h1>

          <span>
            View registered customers of your store.
          </span>
        </div>

        {/* Customer Stats */}
        <div className="customer-stat-card">
          <div className="customer-stat-icon">
            👥
          </div>

          <div>
            <span>Total Customers</span>
            <strong>{users.length}</strong>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="customers-loading">
            Loading customers...
          </div>
        ) : error ? (
          <div className="customers-error">
            <div>⚠️</div>

            <h2>
              Unable to load customers
            </h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={fetchUsers}
            >
              Try Again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="customers-empty">
            <div>👥</div>

            <h2>
              No Customers Found
            </h2>

            <p>
              No registered customers are available.
            </p>
          </div>
        ) : (
          <div className="customers-table">

            {/* Table Header */}
            <div className="customers-table-header">
              <span>Customer</span>
              <span>Email</span>
              <span>Role</span>
              <span>Customer ID</span>
            </div>

            {/* Customers */}
            {users.map((user) => (
              <div
                className="customer-row"
                key={user._id}
              >
                <div className="customer-info">
                  <div className="customer-avatar">
                    {user.name
                      ?.charAt(0)
                      .toUpperCase() || "U"}
                  </div>

                  <div>
                    <strong>
                      {user.name || "Unknown User"}
                    </strong>

                    <small>
                      Registered Customer
                    </small>
                  </div>
                </div>

                <span className="customer-email">
                  {user.email || "—"}
                </span>

                <span
                  className={
                    user.role === "admin"
                      ? "customer-role admin-role"
                      : "customer-role"
                  }
                >
                  {user.role || "user"}
                </span>

                <small className="customer-id">
                  {user._id?.slice(-8) || "—"}
                </small>
              </div>
            ))}

          </div>
        )}

      </main>

      <footer className="admin-footer">
        © 2026 ShopNova. All rights reserved.
      </footer>

    </div>
  );
}

export default AdminCustomers;