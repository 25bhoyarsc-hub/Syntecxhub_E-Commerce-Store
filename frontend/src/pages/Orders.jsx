import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Orders() {
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
        setError("Please login to view your orders.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/orders/my-orders",
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

      setOrders(
        Array.isArray(data)
          ? data
          : data.orders || []
      );
    } catch (err) {
      setError(err.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <h2>Loading your orders...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">

      {/* Header */}
      <header className="orders-header">
        <Link to="/" className="orders-logo">
          Shop<span>Nova</span>
        </Link>

        <Link to="/" className="orders-home">
          Continue Shopping →
        </Link>
      </header>

      {/* Main */}
      <main className="orders-container">

        <div className="orders-title">
          <p>YOUR ORDERS</p>

          <h1>My Orders</h1>

          <span>
            View and track all your ShopNova orders.
          </span>
        </div>

        {/* Error */}
        {error ? (
          <div className="orders-empty">

            <div className="orders-icon">
              ⚠️
            </div>

            <h2>{error}</h2>

            <Link
              to="/login"
              className="orders-button"
            >
              Login
            </Link>

          </div>
        ) : orders.length === 0 ? (

          /* No Orders */
          <div className="orders-empty">

            <div className="orders-icon">
              📦
            </div>

            <h2>No Orders Yet</h2>

            <p>
              You haven&apos;t placed any orders yet.
            </p>

            <Link
              to="/"
              className="orders-button"
            >
              Start Shopping →
            </Link>

          </div>
        ) : (

          /* Orders */
          <div className="orders-list">

            {orders.map((order) => (

              <div
                className="order-card"
                key={order._id}
              >

                {/* Order Top */}
                <div className="order-top">

                  <div>
                    <small>
                      ORDER ID
                    </small>

                    <h3>
                      #{order._id?.slice(-8)}
                    </h3>
                  </div>

                  <span className="order-status">
                    {order.status || "Placed"}
                  </span>

                </div>

                {/* Products */}
                <div className="order-products">

                  {order.items?.map(
                    (item, index) => (

                      <div
                        className="order-product"
                        key={
                          item._id || index
                        }
                      >

                        <img
                          src={
                            item.image ||
                            "https://via.placeholder.com/100"
                          }
                          alt={
                            item.name ||
                            "Product"
                          }
                        />

                        <div>

                          <h3>
                            {item.name ||
                              "Product"}
                          </h3>

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
                <div className="order-bottom">

                  <div>
                    <span>
                      Total
                    </span>

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
                    <span>
                      Order Date
                    </span>

                    <strong>
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "N/A"}
                    </strong>
                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="orders-footer">
        © 2026 ShopNova. All rights reserved.
      </footer>

    </div>
  );
}

export default Orders;