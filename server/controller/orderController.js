import mongoose from "mongoose";
import orderModel from "../models/orderSchema.js";
import productModel from "../models/productSchema.js";
import customerModel from "../models/customerSchema.js";
import masterOrderModel from "../models/masterOrderSchema.js";
import logger from "../utils/logger.js";
import shopModel from "../models/shopSchema.js";
const createOrderController = async (req, res, next) => {
  const { products, billing_address, shipment_address, billing_type,total_amount } = req.body;

  if (!products || products.length === 0 || !Array.isArray(products)) {
      return res.status(400).res({message:"Please fill the required fields."});
  }

  const requiredAddressFields = ['street', 'city', 'state', 'zip', 'phone_number'];
  const missingShipmentAddressFields = requiredAddressFields.filter(field => !shipment_address[field]);
  const missingBillingAddressFields = requiredAddressFields.filter(field => !billing_address[field]);

  if (missingShipmentAddressFields.length > 0 || missingBillingAddressFields.length > 0) {
      return res.status(400).json({message:"Please fill the required fields."});
  }

  const ordersByShop = {};
  for (const { product_id, product_quantity } of products) {
      const product = await productModel.findById(product_id);
      if (!product) {
          logger.warn("Product not found", { product_id });
          return res.status(404).json({message:`Product not found.`});
      }

      if (!ordersByShop[product.shopId]) {
          ordersByShop[product.shopId] = {
              products: [],
              total_amount: 0,
              shop_id: product.shopId,
              shipment_address: shipment_address, 
              billing_address: billing_address,    
              billing_type: billing_type,          
          };
      }

      ordersByShop[product.shopId].products.push({
          product_id,
          product_quantity,
      });

      ordersByShop[product.shopId].total_amount += product.price * product_quantity;
  }

  const orderReferences = [];
  for (const shopId in ordersByShop) {
      const orderData = ordersByShop[shopId];
      const newOrder = new orderModel({
          customer_id: req.userId,
          products: orderData.products,
          total_amount: orderData.total_amount,
          shop_id: shopId,
          shipment_address: orderData.shipment_address,
          billing_address: orderData.billing_address,
          billing_type: orderData.billing_type,
          status: "in_progress",
      });
      const saveOrder = await newOrder.save();
      orderReferences.push(saveOrder._id);
      logger.info("Order created", { orderId: saveOrder._id, shopId });
  }

  const savedMasterOrder = new masterOrderModel({
      customer_id: req.userId,
      order_references: orderReferences,
      total_amount: total_amount,
      shipment_address: shipment_address,
      billing_address: billing_address,
      billing_type: billing_type,
      status: "in_progress",
  });

  await savedMasterOrder.save();
  await orderModel.updateMany(
      { _id: { $in: orderReferences } },
      { master_order_id: savedMasterOrder._id }
  );

  res.status(201).json({ message: "order created" });
};

const singleOrderDetailController = async (req, res) => {
  const orderId = new mongoose.Types.ObjectId(req.params.id);
  try {
    const order = await orderModel.aggregate([
      { $match: { _id: orderId } },
      {
        $lookup: {
          from: "customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product_id",
          foreignField: "_id",
          as: "products",
        },
      },
      { $unwind: "$customer" },
      { $project: { "customer.password": 0 } },
    ]);

    if (!order.length) {
      logger.warn("Order not found", { orderId });
      return res.status(404).json({ message: "Order not found." });
    }

    logger.info("Fetched single order", { orderId });
    res.json({ order });
  } catch (error) {
    logger.error("Error fetching single order", { error });
    res.status(500).json({ message: "Internal server error." });
  }
};

const allOrderDetailsController = async (req, res) => {
  try {
    const orders = await orderModel.aggregate([
      {
        $lookup: {
          from: "customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product_id",
          foreignField: "_id",
          as: "products",
        },
      },
      { $unwind: "$customer" },
      { $project: { "customer.password": 0 } },
    ]);

    logger.info("Fetched all orders");
    res.json({ data: orders });
  } catch (error) {
    logger.error("Error fetching all orders", { error });
    res.status(500).json({ message: "Internal server error." });
  }
};

const userOrderController = async (req, res) => {
  const customer = new mongoose.Types.ObjectId(req.params.id);
  try {
    const orders = await orderModel.aggregate([
      { $match: { customer_id: customer } },
      {
        $lookup: {
          from: "customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product_id",
          foreignField: "_id",
          as: "products",
        },
      },
      { $unwind: "$customer" },
      { $project: { "customer.password": 0 } },
    ]);

    logger.info("Fetched orders for user", { customerId: customer });
    res.json({ data: orders });
  } catch (error) {
    logger.error("Error fetching user orders", { error });
    res.status(500).json({ message: "Internal server error." });
  }
};

const updateOrderStatusController = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await orderModel.findById(id);
    if (!order) {
      logger.warn("Order not found for update", { orderId: id });
      return res.status(404).json({ message: "Order not found" });
    }

    const previousStatus = order.status;
    order.status = status;
    await order.save();

    if (status === "delivered" && previousStatus !== "delivered") {
      for (const product of order.products) {
        const { product_id, product_quantity } = product;

        const productInInventory = await productModel.findById(product_id);
        if (!productInInventory) {
          logger.warn("Product not found in inventory", { product_id });
          return res
            .status(404)
            .json({ message: "Product not found in inventory" });
        }

        if (productInInventory.quantity < product_quantity) {
          logger.warn("Insufficient stock for product", { product_id });
          return res
            .status(400)
            .json({ message: "Insufficient stock for product", product_id });
        }

        productInInventory.quantity -= product_quantity;
        await productInInventory.save();
      }
    }

    if (order.master_order_id) {
      const masterOrder = await masterOrderModel.findById(
        order.master_order_id
      );
      if (masterOrder) {
        const orders = await orderModel.find({
          master_order_id: masterOrder._id,
        });

        const allShipped = orders.every((order) => order.status === "shipped");
        const allDelivered = orders.every(
          (order) => order.status === "delivered"
        );
        const anyDelivered = orders.some(
          (order) => order.status === "delivered"
        );
        const anyRejected = orders.some((o) => o.status === "rejected");
   console.log(allDelivered);
   
        if (allDelivered) {
          masterOrder.status = "delivered";
        } else if (allShipped) {
          masterOrder.status = "shipped";
        }
        else if(anyDelivered){
          masterOrder.status='partially_delivered'
        }
        else if (anyRejected) {
          masterOrder.status = "canceled";
        } else {
          masterOrder.status = "in_progress";
        }

        await masterOrder.save();
      }
    }

    logger.info("Order updated successfully", { orderId: id, status });
    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error) {
    logger.error("Error updating order status", { error });
    res.status(500).json({ message: "Internal server error." });
  }
};

const fetchOrderWithShopId = async (req, res) => {
  const  shopId  = await shopModel.find({userId:req.userId})
  
  
  const shopObjectId = new mongoose.Types.ObjectId(shopId[0]?._id);

  
  try {
    const orders = await orderModel.aggregate([
      { $match: { shop_id: shopObjectId } },
      {
        $lookup: {
          from: "products",
          localField: "products.product_id",
          foreignField: "_id",
          as: "productsDetails",
        },
      },
    ]);

    logger.info("Fetched orders for shop", { shopId });
    res.status(200).json({data:orders});
  } catch (error) {
    logger.error("Error fetching orders for shop", { error });
    res.status(500).json({ message: "Error fetching orders." });
  }
};
export {
  createOrderController,
  singleOrderDetailController,
  allOrderDetailsController,
  userOrderController,
  updateOrderStatusController,
  fetchOrderWithShopId,
};
