import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./AdminProducts.css";
const emptyForm = {
  name: "",
  description: "",
  price: "",
  image: "",
  category: "",
  stock: "",
};

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/products"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch products"
        );
      }

      setProducts(
        Array.isArray(data)
          ? data
          : data.products || []
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.price ||
      !formData.category.trim() ||
      formData.stock === ""
    ) {
      setError("Please fill all required fields.");
      return;
    }

    setSaving(true);

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        image: formData.image.trim(),
        category: formData.category.trim(),
        stock: Number(formData.stock),
      };

      const url = editingId
        ? `http://localhost:5000/api/products/${editingId}`
        : "http://localhost:5000/api/products";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save product"
        );
      }

      if (editingId) {
        setProducts((previous) =>
          previous.map((product) =>
            product._id === editingId
              ? data.product
              : product
          )
        );
      } else {
        setProducts((previous) => [
          data.product,
          ...previous,
        ]);
      }

      alert(
        editingId
          ? "Product updated successfully!"
          : "Product added successfully!"
      );

      resetForm();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);

    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      image: product.image || "",
      category: product.category || "",
      stock: product.stock ?? "",
    });

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete product"
        );
      }

      setProducts((previous) =>
        previous.filter(
          (product) => product._id !== id
        )
      );

      if (editingId === id) {
        resetForm();
      }

      alert("Product deleted successfully!");
    } catch (error) {
      setError(error.message);
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

      <main className="admin-container">

        {/* Title */}
        <div className="admin-title-row">
          <div className="admin-title">
            <p>SHOPNOVA ADMIN</p>

            <h1>Manage Products</h1>

            <span>
              Add, edit and manage your store products.
            </span>
          </div>
        </div>

        {/* Product Form */}
        <div className="admin-product-form-card">

          <div className="admin-form-heading">
            <div>
              <h2>
                {editingId
                  ? "Edit Product"
                  : "Add New Product"}
              </h2>

              <p>
                {editingId
                  ? "Update product information."
                  : "Create a new product for your store."}
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                className="admin-cancel-btn"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            className="admin-product-form"
            onSubmit={handleSubmit}
          >

            <div className="admin-form-grid">

              <div className="admin-form-group">
                <label>
                  Product Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Nike Shoes"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>
                  Category *
                </label>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Shoes"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>
                  Price *
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="2999"
                  min="0"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>
                  Stock *
                </label>

                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="10"
                  min="0"
                  required
                />
              </div>

            </div>

            <div className="admin-form-group">
              <label>
                Image URL
              </label>

              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/product.jpg"
              />
            </div>

            <div className="admin-form-group">
              <label>
                Description *
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description..."
                rows="4"
                required
              />
            </div>

            {error && (
              <p className="admin-form-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="admin-save-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Product"
                : "Add Product"}
            </button>

          </form>
        </div>

        {/* Product List */}
        <div className="admin-products-section">

          <div className="admin-section-heading">
            <div>
              <p>YOUR INVENTORY</p>
              <h2>All Products</h2>
            </div>

            <span>
              {products.length} product
              {products.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="admin-loading">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="admin-empty">
              <div>📦</div>

              <h2>No Products Found</h2>

              <p>
                Add your first product above.
              </p>
            </div>
          ) : (
            <div className="admin-products-table">

              <div className="admin-table-header">
                <span>Product</span>
                <span>Category</span>
                <span>Price</span>
                <span>Stock</span>
                <span>Actions</span>
              </div>

              {products.map((product) => (
                <div
                  className="admin-product-row"
                  key={product._id}
                >

                  <div className="admin-product-info">
                    <img
                      src={
                        product.image ||
                        "https://via.placeholder.com/80"
                      }
                      alt={product.name}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/80?text=Product";
                      }}
                    />

                    <div>
                      <strong>
                        {product.name}
                      </strong>

                      <small>
                        ID: {product._id?.slice(-8)}
                      </small>
                    </div>
                  </div>

                  <span>
                    {product.category || "—"}
                  </span>

                  <strong>
                    ₹
                    {Number(
                      product.price || 0
                    ).toLocaleString("en-IN")}
                  </strong>

                  <span
                    className={
                      Number(product.stock || 0) === 0
                        ? "stock-out"
                        : "stock-available"
                    }
                  >
                    {product.stock ?? 0}
                  </span>

                  <div className="admin-product-actions">

                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(product)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-product-btn"
                      onClick={() =>
                        handleDelete(product._id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </main>

      <footer className="admin-footer">
        © 2026 ShopNova. All rights reserved.
      </footer>

    </div>
  );
}

export default AdminProducts;