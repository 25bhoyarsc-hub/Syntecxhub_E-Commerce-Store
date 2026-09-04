import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProducts } from "./api";

function Home() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // Search / Filter
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");

  // -----------------------------
  // LOAD USER
  // -----------------------------
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.log("User data error:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // -----------------------------
  // LOAD CART
  // -----------------------------
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.log("Cart data error:", error);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // -----------------------------
  // SAVE CART
  // -----------------------------
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // -----------------------------
  // LOAD WISHLIST
  // -----------------------------
  useEffect(() => {
    const savedWishlist =
      localStorage.getItem("wishlist");

    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (error) {
        console.log(
          "Wishlist data error:",
          error
        );

        localStorage.removeItem("wishlist");
      }
    }
  }, []);

  // -----------------------------
  // SAVE WISHLIST
  // -----------------------------
  useEffect(() => {
    localStorage.setItem(
      "wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  // -----------------------------
  // GET PRODUCTS
  // -----------------------------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.log("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // -----------------------------
  // CATEGORIES
  // -----------------------------
  const categories = [
    "All",
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ];

  // -----------------------------
  // FILTER + SORT
  // -----------------------------
  const filteredProducts = [...products]
    .filter((product) =>
      product.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter(
      (product) =>
        category === "All" ||
        product.category === category
    )
    .sort((a, b) => {
      if (sort === "low") {
        return Number(a.price) - Number(b.price);
      }

      if (sort === "high") {
        return Number(b.price) - Number(a.price);
      }

      return 0;
    });

  // -----------------------------
  // ADD TO CART
  // -----------------------------
  const handleAddToCart = (product) => {
    setCart((previousCart) => {
      const existingProduct =
        previousCart.find(
          (item) => item._id === product._id
        );

      if (existingProduct) {
        return previousCart.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...previousCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  // -----------------------------
  // WISHLIST TOGGLE
  // -----------------------------
  const handleWishlist = (product) => {
    setWishlist((previousWishlist) => {
      const alreadyExists =
        previousWishlist.some(
          (item) => item._id === product._id
        );

      if (alreadyExists) {
        return previousWishlist.filter(
          (item) => item._id !== product._id
        );
      }

      return [
        ...previousWishlist,
        product,
      ];
    });
  };

  // -----------------------------
  // CHECK WISHLIST
  // -----------------------------
  const isWishlisted = (productId) => {
    return wishlist.some(
      (item) => item._id === productId
    );
  };

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    navigate("/");
  };

  return (
    <div className="app">

      {/* =========================
          NAVBAR
      ========================= */}
      <nav className="navbar">

        <div className="logo">
          Shop<span>Nova</span>
        </div>

        <div className="nav-links">

          <Link to="/">
            Home
          </Link>

          <a href="#products">
            Products
          </a>

          <a href="#categories">
            Categories
          </a>

          {user && (
            <Link to="/orders">
              My Orders
            </Link>
          )}

          <Link to="/wishlist">
             Wishlist
          </Link>

          {user?.role === "admin" && (
            <Link to="/admin">
              Admin
            </Link>
          )}

        </div>

        <div className="nav-actions">

          {user ? (
            <>
              <span className="welcome-user">
                Hi, {user.name}
              </span>

              <button
                className="login-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="login-btn"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="register-btn"
              >
                Register
              </Link>
            </>
          )}

          <button
            className="cart-btn"
            onClick={() =>
              navigate("/cart")
            }
          >
            🛒 Cart (
            {cart.reduce(
              (total, item) =>
                total + Number(item.quantity || 0),
              0
            )}
            )
          </button>

        </div>

      </nav>

      {/* =========================
          HERO
      ========================= */}
      <section className="hero">

        <div className="hero-content">

          <p className="hero-small">
            ✨ NEW COLLECTION 2026
          </p>

          <h1>
            Discover Your
            <br />
            <span>Perfect Style</span>
          </h1>

          <p className="hero-text">
            Explore premium products, trending
            fashion and everything you love —
            all in one place.
          </p>

          <button
            className="shop-btn"
            onClick={() =>
              document
                .getElementById("products")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            Shop Now →
          </button>

        </div>

        <div className="hero-decoration">

          <div className="circle"></div>

          <div className="floating-card">
            ✨ Trending
          </div>

        </div>

      </section>

      {/* =========================
          CATEGORIES
      ========================= */}
      <section
        className="categories"
        id="categories"
      >

        <h2>
          Shop by Category
        </h2>

        <div className="category-list">

          <div
            className="category"
            onClick={() => {
              setCategory("Fashion");

              document
                .getElementById("products")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }}
          >
            👟 <span>Fashion</span>
          </div>

          <div
            className="category"
            onClick={() => {
              setCategory("Electronics");

              document
                .getElementById("products")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }}
          >
            💻 <span>Electronics</span>
          </div>

          <div
            className="category"
            onClick={() => {
              setCategory("Accessories");

              document
                .getElementById("products")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }}
          >
            ⌚ <span>Accessories</span>
          </div>

          <div
            className="category"
            onClick={() => {
              setCategory("Home");

              document
                .getElementById("products")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }}
          >
            🏠 <span>Home</span>
          </div>

        </div>

      </section>

      {/* =========================
          PRODUCTS
      ========================= */}
      <section
        className="products-section"
        id="products"
      >

        <div className="section-heading">

          <div>
            <p>OUR COLLECTION</p>

            <h2>
              Featured Products
            </h2>
          </div>

          <button
            className="view-btn"
            onClick={() => {
              setSearch("");
              setCategory("All");
              setSort("default");
            }}
          >
            View All →
          </button>

        </div>

        {/* =========================
            SEARCH + FILTER
        ========================= */}
        <div className="product-filters">

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >

            {categories.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}

          </select>

          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
          >

            <option value="default">
              Sort by Price
            </option>

            <option value="low">
              Price: Low to High
            </option>

            <option value="high">
              Price: High to Low
            </option>

          </select>

          {(search ||
            category !== "All" ||
            sort !== "default") && (

            <button
              className="clear-filter-btn"
              onClick={() => {
                setSearch("");
                setCategory("All");
                setSort("default");
              }}
            >
              Clear
            </button>

          )}

        </div>

        {/* =========================
            PRODUCT LIST
        ========================= */}
        {loading ? (

          <h3 className="loading">
            Loading products...
          </h3>

        ) : (

          <div className="product-grid">

            {filteredProducts.length === 0 ? (

              <p className="empty">
                No products found.
              </p>

            ) : (

              filteredProducts.map(
                (product) => {

                  const wishlisted =
                    isWishlisted(
                      product._id
                    );

                  return (

                    <div
                      className="product-card"
                      key={product._id}
                    >

                      {/* IMAGE */}
                      <div className="image-container">

                        <span className="sale-badge">
                          NEW
                        </span>

                        <img
                          src={product.image}
                          alt={product.name}
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/400x400?text=Product";
                          }}
                        />

                        {/* WISHLIST */}
                        <button
                          className={`heart ${
                            wishlisted
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            handleWishlist(
                              product
                            )
                          }
                          title={
                            wishlisted
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                        >
                          {wishlisted
                            ? "♥"
                            : "♡"}
                        </button>

                      </div>

                      {/* PRODUCT INFO */}
                      <div className="product-info">

                        <p className="category-name">
                          {product.category}
                        </p>

                        <h3>
                          {product.name}
                        </h3>

                        <p className="description">
                          {product.description}
                        </p>

                        <div className="product-bottom">

                          <span className="price">
                            ₹
                            {Number(
                              product.price || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>

                          <button
                            className="add-btn"
                            onClick={() =>
                              handleAddToCart(
                                product
                              )
                            }
                          >
                            + Add
                          </button>

                        </div>

                      </div>

                    </div>

                  );
                }
              )

            )}

          </div>

        )}

      </section>

      {/* =========================
          FOOTER
      ========================= */}
      <footer>

        <div className="footer-logo">
          Shop<span>Nova</span>
        </div>

        <p>
          © 2026 ShopNova. All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default Home;