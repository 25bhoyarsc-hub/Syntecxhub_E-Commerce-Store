import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);

  // Load cart
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.log("Cart error:", error);
      }
    }
  }, []);

  // Update cart
  const updateCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );
  };

  // Increase quantity
  const increaseQuantity = (id) => {
    const updatedCart = cart.map((item) =>
      item._id === id
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );

    updateCart(updatedCart);
  };

  // Decrease quantity
  const decreaseQuantity = (id) => {
    const updatedCart = cart
      .map((item) =>
        item._id === id
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
      .filter((item) => item.quantity > 0);

    updateCart(updatedCart);
  };

  // Remove product
  const removeItem = (id) => {
    const updatedCart = cart.filter(
      (item) => item._id !== id
    );

    updateCart(updatedCart);
  };

  // Total items
  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Total price
  const totalPrice = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  return (
    <div className="cart-page">

      {/* HEADER */}
      <div className="cart-header">

        <Link to="/" className="cart-logo">
          Shop<span>Nova</span>
        </Link>

        <Link to="/" className="continue-shopping">
          ← Continue Shopping
        </Link>

      </div>


      {/* CART CONTENT */}
      <div className="cart-container">

        <div className="cart-title">

          <p>YOUR SHOPPING BAG</p>

          <h1>
            Shopping Cart
          </h1>

          <span>
            {totalItems} item
            {totalItems !== 1 ? "s" : ""}
          </span>

        </div>


        {cart.length === 0 ? (

          /* EMPTY CART */
          <div className="empty-cart">

            <div className="empty-cart-icon">
              🛒
            </div>

            <h2>
              Your cart is empty
            </h2>

            <p>
              Looks like you haven't added anything
              to your cart yet.
            </p>

            <Link
              to="/"
              className="shop-cart-btn"
            >
              Start Shopping →
            </Link>

          </div>

        ) : (

          /* CART WITH PRODUCTS */
          <div className="cart-layout">

            {/* PRODUCTS */}
            <div className="cart-items">

              {cart.map((item) => (

                <div
                  className="cart-item"
                  key={item._id}
                >

                  <div className="cart-item-image">

                    <img
                      src={item.image}
                      alt={item.name}
                    />

                  </div>


                  <div className="cart-item-info">

                    <p>
                      {item.category}
                    </p>

                    <h3>
                      {item.name}
                    </h3>

                    <span className="cart-price">
                      ₹{item.price}
                    </span>


                    <div className="quantity-section">

                      <button
                        onClick={() =>
                          decreaseQuantity(item._id)
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(item._id)
                        }
                      >
                        +
                      </button>

                    </div>

                  </div>


                  <div className="cart-item-right">

                    <strong>
                      ₹{item.price * item.quantity}
                    </strong>

                    <button
                      className="remove-btn"
                      onClick={() =>
                        removeItem(item._id)
                      }
                    >
                      Remove
                    </button>

                  </div>

                </div>

              ))}

            </div>


            {/* SUMMARY */}
            <div className="cart-summary">

              <h2>
                Order Summary
              </h2>

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
                  Subtotal
                </span>

                <span>
                  ₹{totalPrice}
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


              <hr />


              <div className="summary-total">

                <span>
                  Total
                </span>

                <strong>
                  ₹{totalPrice}
                </strong>

              </div>

                 <button
                className="checkout-btn"
                 onClick={() => {
                 if (cart.length === 0) {
                  return;
                  }

                window.location.href = "/checkout";
                 }}
                  >      
                   Proceed to Checkout →
                </button>
             

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default Cart;