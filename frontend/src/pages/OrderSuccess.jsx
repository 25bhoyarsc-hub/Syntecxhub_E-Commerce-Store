import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function OrderSuccess() {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem("latestOrder");

    if (savedOrder) {
      try {
        setOrder(JSON.parse(savedOrder));
      } catch (error) {
        console.log(
          "Failed to read latest order:",
          error
        );
      }
    }
  }, []);

  return (
    <div className="order-success-page">

      {/* Header */}
      <header className="order-success-header">

        <Link
          to="/"
          className="order-success-logo"
        >
          Shop<span>Nova</span>
        </Link>

        <Link
          to="/"
          className="order-success-home"
        >
          Home
        </Link>

      </header>

      {/* Main */}
      <main className="order-success-container">

        {/* Success Icon */}
        <div className="order-success-icon">
          ✓
        </div>

        {/* Label */}
        <p className="order-success-label">
          ORDER CONFIRMED
        </p>

        {/* Title */}
        <h1>
          Order Placed!
        </h1>

        {/* Message */}
        <p className="order-success-message">
          Thank you for shopping with ShopNova.
          Your order has been successfully placed.
          We&apos;ll get your order ready for delivery.
        </p>

        {/* Order Info */}
        <div className="order-success-card">

          {/* Order ID */}
          {order?._id && (
            <div className="order-success-row">
              <span>Order ID</span>

              <strong>
                #{order._id.slice(-8)}
              </strong>
            </div>
          )}

          {/* Order Status */}
          <div className="order-success-row">
            <span>Order Status</span>

            <strong>
              {order?.status || "Placed"}
            </strong>
          </div>

          {/* Total */}
          {order?.totalAmount !== undefined && (
            <div className="order-success-row">
              <span>Total Amount</span>

              <strong>
                ₹
                {Number(
                  order.totalAmount
                ).toLocaleString("en-IN")}
              </strong>
            </div>
          )}

          {/* Payment */}
          <div className="order-success-row">
            <span>Payment Method</span>

            <strong>
              Cash on Delivery
            </strong>
          </div>

          {/* Delivery */}
          <div className="order-success-row">
            <span>Delivery</span>

            <strong>
              FREE
            </strong>
          </div>

        </div>

        {/* Continue Shopping */}
        <Link
          to="/"
          className="order-success-btn"
        >
          Continue Shopping →
        </Link>

        {/* My Orders */}
        <Link
          to="/orders"
          className="order-success-secondary"
        >
          View My Orders
        </Link>

      </main>

      {/* Footer */}
      <footer className="order-success-footer">
        © 2026 ShopNova. All rights reserved.
      </footer>

    </div>
  );
}

export default OrderSuccess;