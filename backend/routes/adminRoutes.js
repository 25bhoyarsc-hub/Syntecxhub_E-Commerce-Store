const express = require("express");
const jwt = require("jsonwebtoken");

const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

const router = express.Router();


// =========================
// AUTH MIDDLEWARE
// =========================

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Not authorized. Please login.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};


// =========================
// ADMIN MIDDLEWARE
// =========================

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Not authorized.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required.",
    });
  }

  next();
};


// =========================
// DASHBOARD STATS
// =========================

router.get(
  "/stats",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const totalProducts =
        await Product.countDocuments();

      const totalCustomers =
        await User.countDocuments({
          role: { $ne: "admin" },
        });

      const totalOrders =
        await Order.countDocuments();

      const pendingOrders =
        await Order.countDocuments({
          status: {
            $in: ["Placed", "Processing"],
          },
        });

      const revenueResult =
        await Order.aggregate([
          {
            $match: {
              status: {
                $ne: "Cancelled",
              },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: {
                $sum: "$totalAmount",
              },
            },
          },
        ]);

      const totalRevenue =
        revenueResult.length > 0
          ? revenueResult[0].totalRevenue
          : 0;

      res.json({
        totalProducts,
        totalCustomers,
        totalOrders,
        pendingOrders,
        totalRevenue,
      });
    } catch (error) {
      console.log(
        "Dashboard stats error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch dashboard statistics.",
      });
    }
  }
);


// =========================
// GET ALL PRODUCTS
// =========================

router.get(
  "/products",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const products = await Product.find().sort({
        createdAt: -1,
      });

      res.json(products);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Failed to fetch products.",
      });
    }
  }
);


// =========================
// ADD PRODUCT
// =========================

router.post(
  "/products",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        category,
        image,
        stock,
      } = req.body;

      if (
        !name ||
        !description ||
        price === undefined ||
        !category ||
        !image
      ) {
        return res.status(400).json({
          message:
            "Please provide all product details.",
        });
      }

      const product = await Product.create({
        name,
        description,
        price,
        category,
        image,
        stock: stock || 0,
      });

      res.status(201).json({
        message: "Product added successfully.",
        product,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Failed to add product.",
      });
    }
  }
);


// =========================
// UPDATE PRODUCT
// =========================

router.put(
  "/products/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        category,
        image,
        stock,
      } = req.body;

      const product =
        await Product.findByIdAndUpdate(
          req.params.id,
          {
            name,
            description,
            price,
            category,
            image,
            stock,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!product) {
        return res.status(404).json({
          message: "Product not found.",
        });
      }

      res.json({
        message:
          "Product updated successfully.",
        product,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          "Failed to update product.",
      });
    }
  }
);


// =========================
// DELETE PRODUCT
// =========================

router.delete(
  "/products/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const product =
        await Product.findByIdAndDelete(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          message: "Product not found.",
        });
      }

      res.json({
        message:
          "Product deleted successfully.",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          "Failed to delete product.",
      });
    }
  }
);


// =========================
// GET ALL ORDERS
// =========================

router.get(
  "/orders",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .populate("user", "name email")
        .populate("items.product")
        .sort({
          createdAt: -1,
        });

      res.json(orders);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          "Failed to fetch orders.",
      });
    }
  }
);


// =========================
// UPDATE ORDER STATUS
// =========================

router.put(
  "/orders/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "Placed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message:
            "Invalid order status.",
        });
      }

      const order =
        await Order.findByIdAndUpdate(
          req.params.id,
          {
            status,
          },
          {
            new: true,
          }
        );

      if (!order) {
        return res.status(404).json({
          message: "Order not found.",
        });
      }

      res.json({
        message:
          "Order status updated successfully.",
        order,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          "Failed to update order status.",
      });
    }
  }
);


module.exports = router;