import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminOrders.css";
function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login as admin.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/orders/admin",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch orders"
        );
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update status"
        );
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                orderStatus: status,
              }
            : order
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="admin-orders-page">
        <div className="admin-orders-container">
          <h2>Loading orders...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">

      {/* Header */}
      <header className="admin-orders-header">
        <Link to="/" className="admin-orders-logo">
          Shop<span>Nova</span>
        </Link>

        <Link
          to="/admin"
          className="admin-orders-back"
        >
          ← Dashboard
        </Link>
      </header>

      {/* Main */}
      <main className="admin-orders-container">

        <div className="admin-orders-title">
          <p>SHOPNOVA ADMIN</p>

          <h1>Manage Orders</h1>

          <span>
            View customer orders and update their status.
          </span>
        </div>

        {error ? (
          <div className="admin-orders-empty">
            <div className="admin-orders-icon">
              ⚠️
            </div>

            <h2>{error}</h2>

            <Link
              to="/login"
              className="admin-orders-button"
            >
              Login
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-orders-empty">
            <div className="admin-orders-icon">
              📦
            </div>

            <h2>No Orders Found</h2>

            <p>
              There are no customer orders yet.
            </p>
          </div>
        ) : (
          <div className="admin-orders-list">

            {orders.map((order) => (
              <div
                className="admin-order-card"
                key={order._id}
              >

                {/* Order Header */}
                <div className="admin-order-top">

                  <div>
                    <small>ORDER ID</small>

                    <h3>
                      #{order._id?.slice(-8)}
                    </h3>
                  </div>

                  <span className="admin-order-status">
                    {order.orderStatus ||
                      "Processing"}
                  </span>

                </div>

                {/* Customer */}
                <div className="admin-customer">

                  <h3>Customer Details</h3>

                  <p>
                    <strong>Name:</strong>{" "}
                    {order.shippingAddress?.fullName ||
                      order.user?.name ||
                      "N/A"}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {order.shippingAddress?.email ||
                      order.user?.email ||
                      "N/A"}
                  </p>

                  <p>
                    <strong>Phone:</strong>{" "}
                    {order.shippingAddress?.phone ||
                      "N/A"}
                  </p>

                  <p>
                    <strong>Address:</strong>{" "}
                    {order.shippingAddress?.address},{" "}
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.state} -{" "}
                    {order.shippingAddress?.pincode}
                  </p>

                </div>

                {/* Products */}
                <div className="admin-order-products">

                  <h3>Products</h3>

                  {order.items?.map(
                    (item, index) => (
                      <div
                        className="admin-order-product"
                        key={
                          item._id || index
                        }
                      >

                        <img
                          src={
                            item.image ||
                            "https://via.placeholder.com/80"
                          }
                          alt={
                            item.name ||
                            "Product"
                          }
                        />

                        <div>
                          <h4>
                            {item.name ||
                              "Product"}
                          </h4>

                          <p>
                            Quantity:{" "}
                            {item.quantity || 1}
                          </p>

                          <strong>
                            ₹
                            {Number(
                              item.price || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>
                        </div>

                      </div>
                    )
                  )}

                </div>

                {/* Bottom */}
                <div className="admin-order-bottom">

                  <div>
                    <span>Total Amount</span>

                    <strong>
                      ₹
                      {Number(
                        order.totalAmount || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Payment</span>

                    <strong>
                      {order.paymentMethod ||
                        "Cash on Delivery"}
                    </strong>
                  </div>

                  <div>
                    <span>Payment Status</span>

                    <strong>
                      {order.paymentStatus ||
                        "Pending"}
                    </strong>
                  </div>

                </div>

                {/* Status Update */}
                <div className="admin-status-control">

                  <label>
                    Update Order Status
                  </label>

                  <select
                    value={
                      order.orderStatus ||
                      "Processing"
                    }
                    onChange={(e) =>
                      updateStatus(
                        order._id,
                        e.target.value
                      )
                    }
                  >
                    <option value="Processing">
                      Processing
                    </option>

                    <option value="Shipped">
                      Shipped
                    </option>

                    <option value="Delivered">
                      Delivered
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>
                  </select>

                </div>

              </div>
            ))}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="admin-orders-footer">
        © 2026 ShopNova. All rights reserved.
      </footer>

    </div>
  );
}

export default AdminOrders;