const express = require("express");
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");

const router = express.Router();

// =========================
// AUTHENTICATION
// =========================

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
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
    console.log(
      "Authentication error:",
      error.message
    );

    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

// =========================
// ADMIN AUTHENTICATION
// =========================

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Please login.",
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
// CREATE ORDER
// =========================

router.post("/", protect, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      totalAmount,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty.",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        message: "Shipping address is required.",
      });
    }

    if (
      totalAmount === undefined ||
      totalAmount === null
    ) {
      return res.status(400).json({
        message: "Total amount is required.",
      });
    }

    const orderItems = items.map((item) => ({
      product: item.product,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image || "",
    }));

    const order = await Order.create({
      user: req.user.id,

      items: orderItems,

      shippingAddress: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
      },

      totalAmount,

      status: "Placed",
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.log(
      "Create order error:",
      error
    );

    res.status(500).json({
      message: "Failed to place order",
      error: error.message,
    });
  }
});

// =========================
// GET MY ORDERS
// =========================

router.get(
  "/my-orders",
  protect,
  async (req, res) => {
    try {
      const orders = await Order.find({
        user: req.user.id,
      })
        .populate(
          "items.product"
        )
        .populate(
          "user",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

      res.status(200).json(orders);
    } catch (error) {
      console.log(
        "Get my orders error:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch orders",
        error: error.message,
      });
    }
  }
);

// =========================
// ADMIN - GET ALL ORDERS
// =========================

router.get(
  "/admin",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .populate(
          "user",
          "name email"
        )
        .populate(
          "items.product"
        )
        .sort({
          createdAt: -1,
        });

      res.status(200).json(orders);
    } catch (error) {
      console.log(
        "Admin get orders error:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch all orders",
        error: error.message,
      });
    }
  }
);

// =========================
// ADMIN - UPDATE ORDER STATUS
// =========================

router.put(
  "/:id/status",
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

      if (!status) {
        return res.status(400).json({
          message: "Status is required.",
        });
      }

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid order status.",
        });
      }

      const order = await Order.findById(
        req.params.id
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found.",
        });
      }

      order.status = status;

      await order.save();

      const updatedOrder =
        await Order.findById(order._id)
          .populate(
            "user",
            "name email"
          )
          .populate(
            "items.product"
          );

      res.status(200).json({
        message:
          "Order status updated successfully.",
        order: updatedOrder,
      });
    } catch (error) {
      console.log(
        "Update order status error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update order status",
        error: error.message,
      });
    }
  }
);

module.exports = router;