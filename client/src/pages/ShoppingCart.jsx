import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateQuantity, removeFromCart, clearCart } from "../store/cartSlice";
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


  const handleCheckout = async () => {
    navigate('/create-order')

  };
  

  return (
    <div className=" mx-auto bg-white px-4 pt-24">
  <h2 className="text-3xl font-bold text-center mb-6">Shopping Cart</h2>

  {cart.length === 0 ? (
    <p className="text-center text-lg text-gray-500">Your cart is empty</p>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 shadow-lg rounded-lg">
        <ul className="divide-y divide-gray-200">
          {cart.map((item) => (
            <li key={item._id} className="flex flex-col sm:flex-row items-center gap-6 py-6">
              {/* Product Image */}
              <div className="w-24 h-24 flex-shrink-0">
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-full h-full object-contain rounded-md "
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 w-full text-center sm:text-left">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{item.name}</h3>
                <p className="text-gray-600 text-sm">${item.price}</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center bg-gray-100 px-2 py-1 rounded-lg">
                <button
                  onClick={() => handleDecreaseQuantity(item._id)}
                  className="px-3 py-1 text-gray-600 hover:text-black transition"
                >
                  -
                </button>
                <span className="w-12 text-center text-gray-800 font-medium">{item.quantity}</span>
                <button
                  onClick={() => handleIncreaseQuantity(item._id)}
                  className="px-3 py-1 text-gray-600 hover:text-black transition"
                >
                  +
                </button>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(item._id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition shadow"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Checkout Button After Items */}
      <div className="mt-5 mb-8 flex justify-center">
        {user ? (
          <button
            onClick={handleCheckout}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            Proceed to Checkout
          </button>
        ) : (
          <button
            onClick={() => navigate("/login", { state: { from: "/cart" } })}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition shadow-lg"
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
