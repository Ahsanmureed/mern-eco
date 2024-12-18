import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateQuantity, removeFromCart } from "../store/cartSlice";
import { useNavigate } from "react-router-dom";

const ShoppingCart = () => {
  const user = useSelector((state) => state.user.user);
  const cart = useSelector((state) => state.cart.items);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleIncreaseQuantity = (_id) => {
    const item = cart.find((item) => item._id === _id);
    dispatch(updateQuantity({ _id, quantity: item.quantity + 1 }));
  };
  const handleDecreaseQuantity = (_id) => {
    const item = cart.find((item) => item._id === _id);
    if (item.quantity > 1) {
      dispatch(updateQuantity({ _id, quantity: item.quantity - 1 }));
    }
  };

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleCheckout = () => {
    navigate("/create-order");
  };

  return (
    <div className="container mx-auto pt-[75px]">
      <h2 className="text-2xl font-bold text-center mt-4 mb-4">
        Shopping Cart
      </h2>
      {cart.length === 0 ? (
        <p className=" text-center">Your cart is empty</p>
      ) : (
        <div>
          <ul className="space-y-4">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex flex-col sm:flex-row items-center sm:justify-between p-4 border rounded-lg shadow"
              >
                {/* Product Image */}
                <div className="w-full sm:w-auto mb-4 sm:mb-0 sm:mr-4 flex-shrink-0 flex justify-center">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-20 h-20 object-contain"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 w-full text-center sm:text-left">
                  <h3 className="text-lg font-semibold truncate">
                    {item.name}
                  </h3>
                  <p className="text-gray-600">${item.price}</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center mt-4 sm:mt-0">
                  <button
                    onClick={() => handleDecreaseQuantity(item._id)}
                    className="bg-gray-200 px-2 py-1 rounded-l hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="w-12 text-center border">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleIncreaseQuantity(item._id)}
                    className="bg-gray-200 px-2 py-1 rounded-r hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>

                {/* Remove Button */}
                <div className="mt-4 sm:mt-0 ml-0 sm:ml-4">
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            {user ? (
              <button
                onClick={handleCheckout}
                className="bg-blue-500 mx-auto flex text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Checkout
              </button>
            ) : (
              <button
                onClick={() => navigate("/login", { state: { from: "/cart" } })}
                className="bg-blue-500 flex mx-auto text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Please login to checkout
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
