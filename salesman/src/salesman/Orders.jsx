import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrders, selectOrders, selectOrdersLoading, selectOrdersError, updateOrderStatus } from '../store/orderSlice';
import SideBar from './SideBar';
import Loader from '../components/Loader';

const Orders = () => {
    const dispatch = useDispatch();
    const orders = useSelector(selectOrders);
    const loading = useSelector(selectOrdersLoading);
    const error = useSelector(selectOrdersError);
    
    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    const handleStatusChange = async (orderId, newStatus) => {
        await dispatch(updateOrderStatus({ orderId, status: newStatus }));
      await  dispatch(fetchOrders());
    };

    if (loading) {

        return <div> <SideBar /> <Loader/></div>;
    }

    if (error) {
        return <p className="text-red-500 text-center">{error}</p>;
    }

 
    return (
        <div>
            <SideBar />
            <div className="orders-container ml-64 p-5">
                <h1 className="text-3xl font-bold mb-4 text-center">Your Orders</h1>
                {orders?.length === 0 ? (
                    <p className="text-center">No orders found.</p>
                ) : (
                    <ul className="space-y-12">
                        {orders?.map((order) => (
                            
                            <li key={order._id} className="border p-4 rounded-lg shadow-lg">
                                <h2 className="font-bold text-lg"><strong>Order ID:</strong> {order._id}</h2>
                                <p className="text-gray-600"><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                                <p><strong>Payment: </strong> {order?.total_amount}$</p>
                                <p><strong>Status:</strong> {order.status}</p>
                                <p><strong>Change the status:</strong></p>
                                                        <select
                                                            className="mt-2"
                                                            value={order.status}
                                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                        >
                                
                                                              
                                                              <option value="received">received</option>
                                                            <option value="in_progress">in_progress</option>
                                                            <option value="shipped">shipped</option>
                                                            <option value="delivered">delivered</option>
                                                            <option value="rejected">rejected</option>
                                                        </select>
                                <h3 className="font-semibold mt-2">Products:</h3>
                                <ul className="space-y-2">
                                    {order.products.map((product) => {
                                        const productDetails = order.productsDetails.find(pd => pd._id === product.product_id);
                                        return (
                                            productDetails && (
                                                <li key={product._id} className="flex items-center border p-4 rounded-md shadow-sm">
                                                    {productDetails.images && productDetails.images.length > 0 && (
                                                        <img 
                                                            src={productDetails.images[0]} 
                                                            alt={productDetails.name} 
                                                            className="w-16 h-16 object-cover rounded-md mr-4" 
                                                        />
                                                    )}
                                                    <div>
                                                        <span className="font-bold"><strong>Name: </strong>{productDetails.name}</span>
                                                        <p><strong>Quantity:</strong> {product.product_quantity}</p>
                                                     
                                                    </div>
                                                </li>
                                            )
                                        );
                                    })}
                                </ul>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Orders;
