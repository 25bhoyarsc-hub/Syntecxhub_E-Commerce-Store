import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";
function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login as admin.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch statistics."
        );
      }

      setStats(data);
    } catch (error) {
      console.log("Stats error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">

      {/* Header */}
      <div className="admin-header">
        <Link to="/" className="admin-logo">
          Shop<span>Nova</span>
        </Link>

        <Link to="/" className="back-home">
          ← Back to Store
        </Link>
      </div>

      {/* Main */}
      <main className="admin-container">

        <div className="admin-title">
          <p>SHOPNOVA ADMIN</p>

          <h1>Admin Dashboard</h1>

          <span>
            Manage your store from one place.
          </span>
        </div>


        {/* Error */}
        {error && (
          <div className="admin-error">
            ⚠️ {error}
          </div>
        )}


        {/* Statistics */}
        <div className="admin-stats">

          {/* Products */}
          <div className="stat-card">
            <div className="stat-icon">
              📦
            </div>

            <div>
              <span>Total Products</span>

              <strong>
                {loading
                  ? "..."
                  : stats.totalProducts}
              </strong>
            </div>
          </div>


          {/* Orders */}
          <div className="stat-card">
            <div className="stat-icon">
              🛒
            </div>

            <div>
              <span>Total Orders</span>

              <strong>
                {loading
                  ? "..."
                  : stats.totalOrders}
              </strong>
            </div>
          </div>


          {/* Customers */}
          <div className="stat-card">
            <div className="stat-icon">
              👥
            </div>

            <div>
              <span>Total Customers</span>

              <strong>
                {loading
                  ? "..."
                  : stats.totalCustomers}
              </strong>
            </div>
          </div>


          {/* Revenue */}
          <div className="stat-card">
            <div className="stat-icon">
              💰
            </div>

            <div>
              <span>Total Revenue</span>

              <strong>
                {loading
                  ? "..."
                  : `₹${Number(
                      stats.totalRevenue
                    ).toLocaleString("en-IN")}`}
              </strong>
            </div>
          </div>


          {/* Pending */}
          <div className="stat-card">
            <div className="stat-icon">
              ⏳
            </div>

            <div>
              <span>Pending Orders</span>

              <strong>
                {loading
                  ? "..."
                  : stats.pendingOrders}
              </strong>
            </div>
          </div>

        </div>


        {/* Admin Cards */}
        <div className="admin-cards">

          {/* Products */}
          <div className="admin-card">

            <div className="admin-card-icon">
              📦
            </div>

            <h2>Products</h2>

            <p>
              Add, edit and delete products
              from your store.
            </p>

            <Link
              to="/admin/products"
              className="admin-action-btn"
            >
              Manage Products →
            </Link>

          </div>


          {/* Orders */}
          <div className="admin-card">

            <div className="admin-card-icon">
              🛒
            </div>

            <h2>Orders</h2>

            <p>
              View customer orders and update
              order status.
            </p>

            <Link
              to="/admin/orders"
              className="admin-action-btn"
            >
              Manage Orders →
            </Link>

          </div>


          {/* Customers */}
          <div className="admin-card">

            <div className="admin-card-icon">
              👥
            </div>

            <h2>Customers</h2>

            <p>
              View registered customers
              of your store.
            </p>

            <Link
              to="/admin/customers"
              className="admin-action-btn"
            >
              View Customers →
            </Link>

          </div>

        </div>


        {/* Quick Actions */}
        <div className="admin-quick-section">

          <h2>Quick Actions</h2>

          <div className="admin-quick-actions">

            <Link
              to="/admin/products"
              className="quick-action"
            >
              <span>➕</span>

              <div>
                <strong>Add Product</strong>

                <small>
                  Create a new product
                </small>
              </div>
            </Link>


            <Link
              to="/admin/orders"
              className="quick-action"
            >
              <span>📋</span>

              <div>
                <strong>View Orders</strong>

                <small>
                  Manage customer orders
                </small>
              </div>
            </Link>


            <Link
              to="/"
              className="quick-action"
            >
              <span>🛍️</span>

              <div>
                <strong>View Store</strong>

                <small>
                  Open ShopNova store
                </small>
              </div>
            </Link>

          </div>
        </div>

      </main>


      <footer className="admin-footer">
        © 2026 ShopNova. All rights reserved.
      </footer>

    </div>
  );
}

export default AdminDashboard;