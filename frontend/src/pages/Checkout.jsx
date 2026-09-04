import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // =========================
  // LOAD CART + USER
  // =========================
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    const savedUser = localStorage.getItem("user");

    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);

        if (Array.isArray(cartData)) {
          setCart(cartData);
        }
      } catch (error) {
        console.log("Cart error:", error);
        localStorage.removeItem("cart");
      }
    }

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);

        setUser(userData);

        setFormData((previous) => ({
          ...previous,
          name: userData.name || "",
        }));
      } catch (error) {
        console.log("User error:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // =========================
  // HANDLE FORM
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // TOTALS
  // =========================
  const totalPrice = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  const totalItems = cart.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  // =========================
  // PLACE ORDER
  // =========================
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    setError("");

    const token = localStorage.getItem("token");

    // Login check
    if (!token || !user) {
      setError(
        "Please login before placing an order."
      );
      return;
    }

    // Cart check
    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    // Phone validation
    const phone = formData.phone.trim();

    if (!/^[0-9]{10}$/.test(phone)) {
      setError(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    // Pincode validation
    const pincode = formData.pincode.trim();

    if (!/^[0-9]{6}$/.test(pincode)) {
      setError(
        "Please enter a valid 6-digit PIN code."
      );
      return;
    }

    setLoading(true);

    try {
      // Prepare order items
      const orderItems = cart.map((item) => ({
        product: item._id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image || "",
      }));

      const response = await fetch(
        "http://localhost:5000/api/orders",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            items: orderItems,

            shippingAddress: {
              name: formData.name.trim(),
              phone: formData.phone.trim(),
              address: formData.address.trim(),
              city: formData.city.trim(),
              state: formData.state.trim(),
              pincode: formData.pincode.trim(),
            },

            totalAmount: totalPrice,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to place order."
        );
      }

      // Save latest order
      if (data.order) {
        localStorage.setItem(
          "latestOrder",
          JSON.stringify(data.order)
        );
      }

      // Clear cart
      localStorage.removeItem("cart");
      setCart([]);

      // Success page
      navigate("/order-success");
    } catch (error) {
      console.log("Order error:", error);

      setError(
        error.message ||
          "Server se connection nahi ho pa raha."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EMPTY CART
  // =========================
  if (!loading && cart.length === 0) {
    return (
      <div className="checkout-page">

        <div className="checkout-header">
          <Link
            to="/"
            className="cart-logo"
          >
            Shop<span>Nova</span>
          </Link>

          <Link
            to="/cart"
            className="continue-shopping"
          >
            ← Back to Cart
          </Link>
        </div>

        <div className="checkout-container">
          <div className="checkout-empty">
            <div className="checkout-empty-icon">
              🛒
            </div>

            <h2>Your Cart is Empty</h2>

            <p>
              Add some products before
              proceeding to checkout.
            </p>

            <Link
              to="/"
              className="place-order-btn"
            >
              Continue Shopping →
            </Link>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="checkout-page">

      {/* =========================
          HEADER
      ========================= */}
      <div className="checkout-header">

        <Link
          to="/"
          className="cart-logo"
        >
          Shop<span>Nova</span>
        </Link>

        <Link
          to="/cart"
          className="continue-shopping"
        >
          ← Back to Cart
        </Link>

      </div>

      {/* =========================
          MAIN
      ========================= */}
      <div className="checkout-container">

        <div className="checkout-title">

          <p>SECURE CHECKOUT</p>

          <h1>Checkout</h1>

          <span>
            Complete your details to place
            your order.
          </span>

        </div>

        <div className="checkout-layout">

          {/* =========================
              SHIPPING FORM
          ========================= */}
          <div className="checkout-form-card">

            <h2>
              Shipping Information
            </h2>

            <form
              onSubmit={handlePlaceOrder}
            >

              <div className="checkout-form-grid">

                <div className="form-group">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit phone number"
                    maxLength="10"
                    inputMode="numeric"
                    required
                  />

                </div>

              </div>

              <div className="form-group">

                <label>
                  Address
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House no, street, area..."
                  rows="4"
                  required
                />

              </div>

              <div className="checkout-form-grid">

                <div className="form-group">

                  <label>
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    required
                  />

                </div>

              </div>

              <div className="form-group">

                <label>
                  PIN Code
                </label>

                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN code"
                  maxLength="6"
                  inputMode="numeric"
                  required
                />

              </div>

              {/* ERROR */}
              {error && (
                <p className="auth-error">
                  {error}
                </p>
              )}

              {/* PLACE ORDER */}
              <button
                type="submit"
                className="place-order-btn"
                disabled={loading}
              >
                {loading
                  ? "Placing Order..."
                  : "Place Order →"}
              </button>

            </form>

          </div>

          {/* =========================
              ORDER SUMMARY
          ========================= */}
          <div className="checkout-summary">

            <h2>
              Order Summary
            </h2>

            <div className="checkout-items">

              {cart.map((item) => (

                <div
                  className="checkout-item"
                  key={item._id}
                >

                  <img
                    src={
                      item.image ||
                      "https://via.placeholder.com/100"
                    }
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/100";
                    }}
                  />

                  <div>

                    <h3>
                      {item.name}
                    </h3>

                    <p>
                      Qty: {item.quantity}
                    </p>

                  </div>

                  <strong>
                    ₹
                    {(
                      Number(item.price || 0) *
                      Number(item.quantity || 0)
                    ).toLocaleString("en-IN")}
                  </strong>

                </div>

              ))}

            </div>

            <hr />

            <div className="summary-row">

              <span>
                Items
              </span>

              <span>
                {totalItems}
              </span>

            </div>

            <div className="summary-row">

              <span>
                Delivery
              </span>

              <span>
                FREE
              </span>

            </div>

            <div className="summary-total">

              <span>
                Total
              </span>

              <strong>
                ₹
                {totalPrice.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Checkout;