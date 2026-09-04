import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");

    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch {
        localStorage.removeItem("wishlist");
      }
    }
  }, []);

  const removeFromWishlist = (id) => {
    const updatedWishlist = wishlist.filter(
      (item) => item._id !== id
    );

    setWishlist(updatedWishlist);
    localStorage.setItem(
      "wishlist",
      JSON.stringify(updatedWishlist)
    );
  };

  const addToCart = (product) => {
    const savedCart = localStorage.getItem("cart");

    let cart = [];

    try {
      cart = savedCart ? JSON.parse(savedCart) : [];
    } catch {
      cart = [];
    }

    const existing = cart.find(
      (item) => item._id === product._id
    );

    if (existing) {
      cart = cart.map((item) =>
        item._id === product._id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      );
    } else {
      cart.push({
        ...product,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Added to cart!");
  };

  return (
    <div className="wishlist-page">
      <header className="wishlist-header">
        <Link to="/" className="wishlist-logo">
          Shop<span>Nova</span>
        </Link>

        <div className="wishlist-nav">
          <Link to="/">Home</Link>
          <Link to="/cart">🛒 Cart</Link>
        </div>
      </header>

      <main className="wishlist-container">
        <div className="wishlist-title">
          <p>YOUR FAVORITES</p>
          <h2>My Wishlist ❤️</h2>
          <span>
            Save your favorite products for later.
          </span>
        </div>

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">♡</div>

            <h2>Your Wishlist is Empty</h2>

            <p>
              You haven&apos;t added any products yet.
            </p>

            <Link
              to="/"
              className="wishlist-shop-btn"
            >
              Explore Products →
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((product) => (
              <div
                className="wishlist-card"
                key={product._id}
              >
                <div className="wishlist-image">
                  <img
                    src={product.image}
                    alt={product.name}
                  />

                  <button
                    className="wishlist-remove"
                    onClick={() =>
                      removeFromWishlist(product._id)
                    }
                  >
                    ♥
                  </button>
                </div>

                <div className="wishlist-info">
                  <p>{product.category}</p>

                  <h3>{product.name}</h3>

                  <strong>
                    ₹
                    {Number(product.price).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                  <button
                    className="wishlist-cart-btn"
                    onClick={() =>
                      addToCart(product)
                    }
                  >
                    + Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="wishlist-footer">
        © 2026 ShopNova. All rights reserved.
      </footer>
    </div>
  );
}

export default Wishlist;