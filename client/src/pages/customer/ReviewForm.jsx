import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import Loader from "../../../../salesman/src/components/Loader";

const ReviewForm = () => {
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState({});
  const navigate = useNavigate();
  const { slug, order: orderId } = useParams();
  

  const fetchProduct = async () => {
    
    try {
      const { data } = await axios.get(
        `http://localhost:3000/api/v1/product/${slug}`
      );
      
      setProduct(data.data[0]);
      setLoading(false)
    } catch (error) {
      console.log(error);
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 5) {
      setError("You can upload a maximum of 5 images.");
      setButtonLoading(false)
      return;
     
    }

    const imagePreviews = files.map((file) =>
      URL.createObjectURL(file)
    );

    setImages([...images, ...files]);
    setError("");
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true)

    if (rating < 1 || rating > 5) {
      setError("Please select a valid rating (1-5).");
      setButtonLoading(false)
      return;
    }

    if (images.length < 1) {
      setError("Please upload at least one image.");
      setButtonLoading(false)
      return;
    }
    if (images.length > 5) {
      setError('You can upload a maximum of 5 images.');
      setButtonLoading(false)
      return;
    }
    const trimComment= comment.trim()

    const formData = new FormData();
    images.forEach((image) => {
      formData.append("images", image);
    });
    formData.append("rating", rating);
    formData.append("comment", trimComment);
    formData.append("productId", product?._id);
    formData.append("masterorderId", orderId);

    const token = localStorage.getItem("token");

    try {
      await axios.post("http://localhost:3000/api/v1/review/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(`/product/${slug}`);
      setButtonLoading(false)
    } catch (error) {
     if(error.response.data.message ==='You have already reviewed this product.'){
      toast.error(error.response.data.message)
     }
     else{
      setError(error.response.data.message)
     }
      setButtonLoading(false)
    }
  };

  return (
  <>
{
  loading?<Loader/>:  <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 ">
  <h1 className="text-2xl font-semibold mb-4">
    Submit a Review for: <strong>{product?.name}</strong>
  </h1>

  {product?.images?.length > 0 && (
    <div className="mb-4">
      <img
        src={product?.images[0]}
        alt={product?.name}
        className="w-32 h-32 object-cover rounded-md"
      />
    </div>
  )}

  <div className="mb-4">
    <label className="block font-medium mb-2">Rating:</label>
    <div className="flex space-x-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => setRating(star)}
          className={`cursor-pointer text-3xl ${
            star <= rating ? "text-yellow-500" : "text-gray-400"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  </div>

  <div className="mb-2">
    <label className="block font-medium mb-4">Upload Images:</label>
    <input
      type="file"
      accept="image/*"
      multiple
      onChange={handleImageChange}
      className="hidden"
      id="file-upload"
    />
    <label
      htmlFor="file-upload"
      className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
    >
      Select Images
    </label>

    <div className="flex mt-5 space-x-2">
      {images.map((image, index) => (
        <div key={index} className="relative">
          <img
            src={URL.createObjectURL(image)}
            alt={`Selected ${index}`}
            className="w-16 h-16 object-cover rounded-md border"
          />
          <button
            type="button"
            onClick={() => removeImage(index)}
            className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  </div>
  <div className="mb-4">
    <label className="block font-medium mb-2">Comment:</label>
    <textarea
      className="border rounded p-2 w-full focus:outline-none focus:ring focus:ring-blue-200"
      rows="4"
      value={comment}
      onChange={(e) => setComment(e.target.value)}
    />
  </div>

  {error && <p className="text-red-500 mb-4">{error}</p>}

  <button
  disabled={buttonLoading}
    type="submit"
    className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
  >
    Submit Review
  </button>
</form>
}
  </>
  );
};

export default ReviewForm;
