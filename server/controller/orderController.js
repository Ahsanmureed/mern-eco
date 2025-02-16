import mongoose from "mongoose";
import orderModel from "../models/orderSchema.js";
import productModel from "../models/productSchema.js";
import customerModel from "../models/customerSchema.js";
import masterOrderModel from "../models/masterOrderSchema.js";
import logger from "../utils/logger.js";
import shopModel from "../models/shopSchema.js";
import stripe from "../config/stripe.js";
const YOUR_DOMAIN= 'http://localhost:5173'
const paymentController =async(req,res,next)=>{
  const {cartItems,billing_details,billing_type}= req.body;
  if(!billing_details){
    return res.status(400).json({
      success:false,
      message:'Address is required'
    })
  }
  
  try {
    const params = {
      submit_type:'pay',
      mode:'payment',
      payment_method_types:['card'],
      billing_address_collection:'auto',
      shipping_options:[
        {
          shipping_rate:'shr_1QlOw7AwncZRu9rkiB7pNrT3'
        }
      ],
      customer_email:req.user.email,
      metadata:{
        userId:req.user._id
      },
      line_items:cartItems.map((item)=>{        
        return{
          price_data:{
            currency:'usd',
            product_data:{
              name:item.name,
              images:item.images,
              metadata:{
                productId:item.productId
                      
              }
              
            },
            unit_amount:item.price
          },
          adjustable_quantity:{
            enabled:true,
            minimum:1,
          },
          quantity:item.quantity
        }
      }),
      success_url: `${YOUR_DOMAIN}/orders`,
      cancel_url: `${YOUR_DOMAIN}/canceled`,
    }
    if (billing_details && billing_type) {
      params.metadata.billing_details = JSON.stringify(billing_details);
      params.metadata.billing_type = JSON.stringify(billing_type);
    }
    
    const session = await stripe.checkout.sessions.create(params);
    res.status(200).json(session)
  } catch (error) {
    console.log(error);
    
  }
}
const createOrderController = async (req, res, next) => {
  const { products, address, billing_type,total_amount } = req.body;

  if (!products || products.length === 0 || !Array.isArray(products)) {
      return res.status(400).res({message:"Please fill the required fields."});
  }


  if (!address ) {
      return res.status(400).json({message:"Address is required."});
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
              address: address, 
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
          customer_id: req.user._id,
          products: orderData.products,
          total_amount: orderData.total_amount,
          shop_id: shopId,
          address: orderData.address,
          billing_type: orderData.billing_type,
          status: "in_progress",
      });
      const saveOrder = await newOrder.save();
      orderReferences.push(saveOrder._id);
      logger.info("Order created", { orderId: saveOrder._id, shopId });
  }

  const savedMasterOrder = new masterOrderModel({
      customer_id: req.user._id,
      order_references: orderReferences,
      total_amount: total_amount,
      address: address,
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
  const  shopId  = await shopModel.find({userId:req.user._id})
  
  
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
      {
        $sort:{createdAt:-1}
      }
    ]);

    logger.info("Fetched orders for shop", { shopId });
    res.status(200).json({data:orders});
  } catch (error) {
    logger.error("Error fetching orders for shop", { error });
    res.status(500).json({ message: "Error fetching orders." });
  }
};
const getLineItems= async(lineItems)=>{
      let productItems=[];
      if(lineItems?.data?.length){
        for(const item of lineItems?.data){
         const product= await stripe.products.retrieve(item.price.product);
         
         const productData= {
          productId:product.metadata.productId,
          name:product.name,
          price:item.price.unit_amount/100,
          quantity:item.quantity,
          image:product.images,

         }
         productItems.push(productData)
        }
      }
      return productItems
}
const webhookController =async(req,res)=>{
  const sig = req.headers['stripe-signature'];
  const payLoadString= JSON.stringify(req.body)
  const header =stripe.webhooks.generateTestHeaderString({
    payload:payLoadString,
    secret:process.env.STRIPE_WEBHOOK_SECRET_KEY
  })
  let event;
  try {
    event=stripe.webhooks.constructEvent(payLoadString,header,process.env.STRIPE_WEBHOOK_SECRET_KEY)
  } catch (error) {
    response.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const productDetails= await getLineItems(lineItems)  
      
      const ordersByShop = {};
  for (const { productId, quantity } of productDetails) {
      const product = await productModel.findById(productId);
      if (!product) {
          logger.warn("Product not found", { productId });
          return res.status(404).json({message:`Product not found.`});
      }

      if (!ordersByShop[product.shopId]) {
          ordersByShop[product.shopId] = {
              products: [],
              total_amount: 0,
              shop_id: product.shopId        
          };
      }

      ordersByShop[product.shopId].products.push({
        product_id: productId,
        product_quantity: quantity,
      });

      ordersByShop[product.shopId].total_amount += product.price * quantity;
  }

  const orderReferences = [];
  for (const shopId in ordersByShop) {
      const orderData = ordersByShop[shopId];
      const newOrder = new orderModel({
          customer_id: session.metadata?.userId,
          products: orderData.products,
          total_amount: orderData.total_amount,
          shop_id: shopId,
          address: JSON.parse(session.metadata.billing_details),
          billing_type: JSON.parse(session.metadata.billing_type),
          status: "in_progress",
      });
      const saveOrder = await newOrder.save();
      orderReferences.push(saveOrder._id);
      logger.info("Order created", { orderId: saveOrder._id, shopId });
  }

  const savedMasterOrder = new masterOrderModel({
      customer_id: session.metadata?.userId,
      order_references: orderReferences,
      address: JSON.parse(session.metadata.billing_details),
      billing_type: JSON.parse(session.metadata.billing_type),
      total_amount: session.amount_total/100,
      status: "in_progress",
  });
console.log('billing', typeof JSON.parse(session.metadata.billing_details));

  await savedMasterOrder.save();
  await orderModel.updateMany(
      { _id: { $in: orderReferences } },
      { master_order_id: savedMasterOrder._id }
  );    
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log('PaymentMethod was attached to a Customer!');
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
}
export {
  createOrderController,
  singleOrderDetailController,
  allOrderDetailsController,
  userOrderController,
  updateOrderStatusController,
  fetchOrderWithShopId,
  paymentController,
  webhookController
};
