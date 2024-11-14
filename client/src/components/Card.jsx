import React from 'react';
import { useDispatch } from 'react-redux';
import {useNavigate } from 'react-router-dom'
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
    <div className="group my-10 flex w-full max-w-xs flex-col overflow-hidden border border-gray-100 bg-white shadow-md">
      <a className="relative flex h-60 overflow-hidden items-center justify-center" >
        <img
        onClick={()=>navigate(`/product/${product?.slug}`)}
          className="h-full cursor-pointer w-auto object-contain"
          src={product.images[0]} 
          alt="product image"
        />
      </a>
      <div className="mt-4 px-5 pb-5">
        <a href="#">
          <h5 className="text-xl tracking-tight text-slate-900">{product?.name?.length>10? product.name.slice(0,10)+'...':product.name}</h5>
        </a>
        <div className="mt-2 mb-5 flex items-center justify-between">
          <p>
            <span className="text-3xl font-bold text-slate-900">${product.price}</span>
          </p>
        </div>
        <button onClick={handleAddToCart} className="flex items-center justify-center bg-gray-900 px-4 py-2.5 rounded-md text-sm text-white transition hover:bg-gray-700">
         
          Add to cart
        </button>
      </div>
    </div>
  );
};

export default Card;
