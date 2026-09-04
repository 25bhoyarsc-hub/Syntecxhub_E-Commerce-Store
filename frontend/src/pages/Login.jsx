import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      // Save JWT token
      localStorage.setItem("token", data.token);

      // Save user information
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setMessage("Login successful! 🎉");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      setError("Server se connection nahi ho pa raha.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-decoration auth-decoration-one"></div>
      <div className="auth-decoration auth-decoration-two"></div>

      <div className="auth-container">

        <div className="auth-brand">
          <Link to="/" className="auth-logo">
            Shop<span>Nova</span>
          </Link>

          <p>Welcome back to your shopping world ✨</p>
        </div>

        <div className="auth-card">

          <div className="auth-heading">
            <h1>Welcome Back</h1>
            <p>
              Login to continue shopping with us.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">

              <div className="label-row">
                <label>Password</label>

                <a href="#">
                  Forgot password?
                </a>
              </div>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />

            </div>

            {error && (
              <p className="auth-error">
                {error}
              </p>
            )}

            {message && (
              <p className="auth-success">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="auth-submit"
            >
              Login →
            </button>

          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">
              Create account
            </Link>
          </p>

        </div>

        <Link to="/" className="back-home">
          ← Back to Home
        </Link>

      </div>
    </div>
  );
}

export default Login;