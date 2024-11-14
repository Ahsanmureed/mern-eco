import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "./SideBar";
import { useSelector, useDispatch } from "react-redux";
import { getOrders, selectOrders } from "../../store/orderSlice";
import axios from 'axios';
import SkeletonLoader from '../../components/skeltons/SkeletonLoader '

const Orders = () => {
  const user = useSelector((state) => state.user.user);
  const orders = useSelector(selectOrders);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchData = async () => {
      if (user?._id) {
        setLoading(true); 

      

        await dispatch(getOrders(user._id));
        await fetchReviews();
        setLoading(false); 
      }
    };
    fetchData();
  }, [dispatch, user]);

  const handleReviewClick = (orderId, slug) => {
    navigate(`/review/${slug}/${orderId}`);
  };

  const fetchReviews = async () => {
    const { data } = await axios.get("http://localhost:3000/api/v1/review/all");
    setReviews(data.data);
    console.log(data.data);
  };

  const hasReviewed = (orderId, productId) => {
    return reviews.some(
      (review) =>
        review.product === productId && review.masterorderId === orderId
    );
  };

  if (loading) {
    const orderCount = orders?.length > 0 ? orders?.length : 3; 
    const productCount = orders?.length > 0
      ? Math.max(...orders?.map(order => 
          order.order_references.reduce((count, ref) => count + ref.products?.length, 0)
        ))
      : 2; 

    return (
      <div>
        <SideBar />
        <div className="orders-container ml-64 p-5">
          <h1 className="text-3xl font-bold mb-4 text-center">Your Orders</h1>
          <SkeletonLoader orderCount={orderCount} productCount={productCount} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <SideBar />
      <div className="orders-container ml-64 pt-[80px] p-5">
        <h1 className="text-3xl font-bold mb-4 text-center">Your Orders</h1>
        {orders?.length === 0 ? (
          <p className="text-center">No orders found.</p>
        ) : (
          <ul className="space-y-8">
            {orders?.map((order) => (
              <li key={order._id} className="border p-4 rounded-lg shadow-lg">
                <h2 className="font-bold text-lg">
                  <strong>Order ID:</strong> {order._id}
                </h2>
                <p className="text-gray-600">
                  <strong>Date:</strong>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Payment:</strong> {order.total_amount}$
                </p>
                <p>
                  <strong>Payment method type:</strong> {order?.billing_type}
                </p>
                <p>
                  <strong>Status:</strong> {order.status}
                </p>
                <h3 className="font-semibold mt-2">Products:</h3>
                <ul className="space-y-2">
                  {order?.order_references?.map((orderRef) =>
                    orderRef?.products?.map((productItem) => (
                      <li
                        key={productItem.product._id}
                        className="flex items-center border p-4 rounded-md shadow-sm"
                      >
                        <img
                          src={productItem.product.images[0]}
                          className="w-16 h-16 object-cover rounded-md mr-4"
                          alt={productItem.product.name}
                        />
                        <div className="flex-1">
                          <span className="font-bold">
                            <strong>Name:</strong> {productItem.product.name}
                          </span>
                          <p>
                            <strong>Quantity:</strong>{" "}
                            {productItem.product_quantity}
                          </p>
                        </div>
                        {order.status === "delivered" && !hasReviewed(order._id, productItem.product._id) && (
                          <button
                            onClick={() =>
                              handleReviewClick(
                                order?._id,
                                productItem?.product?.slug
                              )
                            }
                            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
                          >
                            Review
                          </button>
                        )}
                      </li>
                    ))
                  )}
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
