const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
const cors = require("cors");

require("dotenv").config();

// =========================
// DNS
// =========================


// =========================
// ROUTES
// =========================

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
// =========================
// APP
// =========================

const app = express();

const PORT = 5000;

// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use("/api/admin", adminRoutes);
app.use(express.json());

// =========================
// API ROUTES
// =========================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

// =========================
// HOME ROUTE
// =========================

app.get("/", (req, res) => {
  res.send(
    "E-Commerce Backend is Running!"
  );
});

// =========================
// MONGODB CONNECTION
// =========================

console.log(
  "Connecting to MongoDB..."
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(
      "MongoDB Connected Successfully"
    );

    // =========================
    // START SERVER
    // =========================

    app.listen(PORT, () => {
      console.log(
        `Server is running on http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.log(
      "MongoDB Connection Failed"
    );

    console.log(
      "NAME:",
      error.name
    );

    console.log(
      "MESSAGE:",
      error.message
    );

    console.log(
      "CODE:",
      error.code
    );

    console.log(
      "REASON:",
      error.reason
    );
  });