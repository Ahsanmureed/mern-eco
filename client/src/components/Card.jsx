import React from 'react';
import { useDispatch } from 'react-redux';
import {Link, useNavigate } from 'react-router-dom'
import { addToCart } from '../store/cartSlice';
import toast from 'react-hot-toast';
const Card = ({ product }) => {
  const dispatch= useDispatch()
  const handleAddToCart = () => {
    dispatch(addToCart(product));
    toast.success(`${product.name} has been added to the cart!`); 
  };


const navigate =useNavigate()
  return (
    <div className="group my-6 flex w-full max-w-xs flex-col overflow-hidden border border-gray-200 rounded-lg bg-white shadow-md transition-transform transform hover:scale-105 hover:shadow-lg">
  <Link
    className="relative flex md:h-60 h-52 overflow-hidden items-center justify-center bg-gray-50"
    to={`/product/${product?.slug}`}
  >
    <img
      className="h-full w-auto object-contain cursor-pointer transition-transform duration-300 group-hover:scale-110"
      src={product.images[0]}
      alt={product.name}
    />
  </Link>
  <div className="flex flex-col justify-between flex-1 mt-3 px-4 pb-3">
    <h5 className="text-md font-medium tracking-tight text-gray-800 truncate">
      {product?.name}
    </h5>
    <div className="mt-2 flex items-center justify-between">
      <span className="text-xl font-bold text-gray-900 ">${product.price}</span>
    </div>
    <button
      onClick={handleAddToCart}
      className="mt-3 flex items-center justify-center w-full bg-gray-900 text-white text-sm font-medium py-2 rounded-lg transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
    >
      Add to Cart
    </button>
  </div>
</div>

  );
};

export default Card;
