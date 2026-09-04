const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

// ===============================
// CREATE ORDER
// ===============================
const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { items, shippingAddress } = req.body;

    // Check items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "No items in order",
      });
    }

    // Check shipping address
    if (!shippingAddress) {
      return res.status(400).json({
        message: "Shipping address is required",
      });
    }

    // Check shipping fields
    const requiredFields = [
      "name",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];

    for (const field of requiredFields) {
      if (!shippingAddress[field]) {
        return res.status(400).json({
          message: `${field} is required`,
        });
      }
    }

    await session.startTransaction();

    // Combine duplicate products
    const productQuantities = {};

    for (const item of items) {
      if (!item.product) {
        throw new Error("Product ID is required");
      }

      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        throw new Error("Invalid product ID");
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Invalid product quantity");
      }

      if (productQuantities[item.product]) {
        productQuantities[item.product] += quantity;
      } else {
        productQuantities[item.product] = quantity;
      }
    }

    // Prepare order items
    const orderItems = [];
    let totalAmount = 0;

    // Check products + stock + calculate price
    for (const [productId, quantity] of Object.entries(
      productQuantities
    )) {
      // Atomically check stock and reduce it
      const product = await Product.findOneAndUpdate(
        {
          _id: productId,
          stock: { $gte: quantity },
        },
        {
          $inc: { stock: -quantity },
        },
        {
          new: true,
          session,
        }
      );

      if (!product) {
        // Check whether product exists
        const existingProduct = await Product.findById(productId)
          .session(session);

        if (!existingProduct) {
          throw new Error("Product not found");
        }

        throw new Error(
          `Insufficient stock for ${existingProduct.name}`
        );
      }

      const itemTotal = product.price * quantity;

      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image || "",
      });
    }

    // Create order
    const order = await Order.create(
      [
        {
          user: req.user._id,

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
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      message: "Order created successfully",
      order: order[0],
    });
  } catch (error) {
    await session.abortTransaction();

    console.log("Create order error:", error);

    res.status(400).json({
      message: error.message || "Failed to place order",
    });
  } finally {
    session.endSession();
  }
};


// ===============================
// GET MY ORDERS
// ===============================
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.log("Get my orders error:", error);

    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};


// ===============================
// GET ALL ORDERS - ADMIN
// ===============================
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.log("Get all orders error:", error);

    res.status(500).json({
      message: "Failed to fetch all orders",
      error: error.message,
    });
  }
};


// ===============================
// UPDATE ORDER STATUS - ADMIN
// ===============================
const updateOrderStatus = async (req, res) => {
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
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.status = status;

    await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.log("Update order status error:", error);

    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
};


// ===============================
// GET ORDER BY ID
// ===============================
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    console.log("Get order error:", error);

    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};


// ===============================
// EXPORT
// ===============================
module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
};