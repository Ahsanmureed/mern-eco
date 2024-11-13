import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'
import {useEffect} from 'react'
const ReviewForm = () => {
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState([]);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [product, setProduct] = useState({});
  const navigate  =  useNavigate();
const slug = useParams().slug



const orderId = useParams().order

const fetchProduct= async()=>{
 try {
  const {data}= await axios.get(`http://localhost:3000/api/v1/product/${slug}`)
  setProduct(data.data[0]);
 } catch (error) {
  console.log(error);
  
 }
}


useEffect(()=>{
fetchProduct()
},[])
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('You can upload a maximum of 5 images.');
      return;
    }
    setImages(files);
    setError('');
  };

  const handleSubmit =async (e) => {
    e.preventDefault();
    
    if (rating < 1 || rating > 5) {
      setError('Please select a valid rating (1-5).');
      return;
    }

    if (images.length < 1) {
      setError('Please upload at least one image.');
      return;
    }
    

    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });
    formData.append('rating', rating);
    formData.append('comment', comment);
    formData.append('productId',product?._id); 
    formData.append('masterorderId',orderId)
        console.log();
        
const token = localStorage.getItem('token')
    try {
      const {data} = await axios.post('http://localhost:3000/api/v1/review/create',formData,{
        headers:{Authorization:`Bearer ${token}`}
       
      })
      navigate(`/product/${slug}`)
    } catch (error) {
      console.log(error);
      
    }

  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-2xl mb-4">Submit a Review for: <strong>{product?.name}</strong></h1>
      
      {/* Product Image */}
      <div className="mb-4">
       {product?.images?.length>0 && (
        <><img 
        src={product?.images[0]} 
        alt={product?.name} 
        className="w-32 h-32 object-cover mb-2" 
      /></>
       )}
      </div>
      
      {/* Star Rating */}
      <div className="mb-4">
        <label className="block mb-2">Rating:</label>
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            onClick={() => setRating(star)} 
            className={`cursor-pointer ${star <= rating ? 'text-yellow-500' : 'text-gray-400'}`}
          >
            ★
          </span>
        ))}
      </div>

      {/* Image Upload */}
      <div className="mb-4">
        <label className="block mb-2">Upload Images:</label>
        <input 
          type="file" 
          accept="image/*" 
          multiple 
          onChange={handleImageChange} 
        />
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block mb-2">Comment:</label>
        <textarea 
          className="border rounded p-2 w-full" 
          rows="4" 
          value={comment} 
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Submit Review
      </button>
    </form>
  );
};

export default ReviewForm;
