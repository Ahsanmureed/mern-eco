import mongoose from "mongoose"
import masterOrderModel from "../models/masterOrderSchema.js"

const userMasterOrderController = async (req, res) => {
    try {
        const  id  = req.params.id;
        const customerId = new mongoose.Types.ObjectId(id);
        
        const orders = await masterOrderModel.aggregate([
            { $match: { customer_id: customerId } },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order_references',
                    foreignField: '_id',
                    as: 'order_references'
                }
            },
            {
                $unwind: {
                    path: '$order_references',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'products', // Assuming your products collection is named 'products'
                    localField: 'order_references.products.product_id',
                    foreignField: '_id',
                    as: 'product_details'
                }
            },
            {
                $addFields: {
                    'order_references.products': {
                        $map: {
                            input: '$order_references.products',
                            as: 'product',
                            in: {
                                product: {
                                    $arrayElemAt: [
                                        '$product_details',
                                        { $indexOfArray: ['$product_details._id', '$$product.product_id'] }
                                    ]
                                },
                                product_quantity: '$$product.product_quantity' // Add product_quantity
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    customer_id: { $first: '$customer_id' },
                    order_references: { $push: '$order_references' },
                    total_amount: { $first: '$total_amount' },
                    shipment_address: { $first: '$shipment_address' },
                    billing_address: { $first: '$billing_address' },
                    billing_type: { $first: '$billing_type' },
                    status: { $first: '$status' },
                    createdAt: { $first: '$createdAt' },
                    updatedAt: { $first: '$updatedAt' }
                }
            }
        ]);

        res.json({data:orders});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export {userMasterOrderController}