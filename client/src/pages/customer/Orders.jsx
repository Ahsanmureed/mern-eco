import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "./SideBar";
import { useSelector, useDispatch } from "react-redux";
import { getOrders, selectOrders } from "../../store/orderSlice";
import axios from 'axios';
import SkeletonLoader from '../../components/skeltons/SkeletonLoader ';
import { IoMdMenu } from "react-icons/io";

const Orders = () => {
  const user = useSelector((state) => state.user.user);
  const orders = useSelector(selectOrders);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const orderCount = orders?.length > 0 ? orders?.length : 3;
  const productCount = orders?.length > 0
    ? Math.max(...orders?.map(order => 
        order.order_references.reduce((count, ref) => count + ref.products?.length, 0)
      ))
    : 2;
console.log(isSidebarOpen);

  return (
    <div className="flex  min-h-[100vh]   mb-8  pt-[80px]">
      
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-64 bg-gray-800 text-white p-5  fixed top-0 left-0 h-full`}>
        <SideBar onClose={toggleSidebar} />
        
      </div>
      <div    className={`flex-1 w-full   md:ml-64`}>
      <IoMdMenu onClick={toggleSidebar} className="text-black text-2xl mt-2 absolute md:hidden  mx-1 cursor-pointer" />

     <div className="  h-full" onClick={()=>setIsSidebarOpen(false)}>
     <h1 className="text-3xl font-bold mb-4 text-center">Your Orders</h1>
        {loading ? (
          <SkeletonLoader orderCount={orderCount} productCount={productCount} />
        ) : (
          orders?.length === 0 ? (
            <p className="text-center">No orders found.</p>
          ) : (
            <ul className="space-y-8">
            {orders.map((order) => (
              <li
                key={order._id}
                className="border border-gray-300 bg-white p-6 rounded-xl shadow-md  hover:shadow-lg mx-3"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">
                    Order ID: <span className="text-gray-600">{order?._id}</span>
                  </h2>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(order?.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mb-4">
                  <p className="text-base text-gray-700">
                    <strong>Payment:</strong> ${order?.total_amount}
                  </p>
                  <p className="text-base text-gray-700">
                    <strong>Payment Method:</strong> {order?.billing_type}
                  </p>
                  <p className="text-base font-medium text-gray-700">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`${
                        order.status === "delivered"
                          ? "text-green-600"
                          : order.status === "pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </p>
                </div>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">Products:</h3>
                <ul className="space-y-3">
                  {order?.order_references?.map((orderRef) =>
                    orderRef?.products?.map((productItem) => (
                      <li
                        key={productItem?.product?._id}
                        className="flex items-center border border-gray-200 rounded-lg shadow-sm p-4 bg-gray-50"
                      >
                        <img
                          src={productItem?.product?.images[0]}
                          className="w-20 h-20 rounded-lg object-cover mr-4"
                          alt={productItem?.product?.name}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 mb-1">
                            {productItem?.product?.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {productItem?.product_quantity}
                          </p>
                        </div>
                        {order.status === "delivered" &&
                          !hasReviewed(order?._id, productItem?.product._id) && (
                            <button
                              onClick={() =>
                                handleReviewClick(
                                  order?._id,
                                  productItem?.product?.slug
                                )
                              }
                              className="ml-4 bg-blue-500 text-white text-sm px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
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
          
          )
        )}
     </div>
      </div>
    </div>
  );
};

export default Orders;
