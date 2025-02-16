import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../../../salesman/src/components/Loader';

const Review = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(1);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [preview, setPreview] = useState(false);
    const [loading,setLoading]=useState(true)

    const { slug } = useParams();

    const fetchReviews = async () => {
        try {
            const { data } = await axios.get(`http://localhost:3000/api/v1/review/product/${slug}`);
            setReviews(data.data);
            setLoading(false)
        } catch (error) {
            setError(error.response.data.message);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const renderStars = (rating) => (
        <div>
            {[...Array(5)].map((_, index) => (
                <span
                    key={index}
                    className={`text-xl ${index < rating ? 'text-yellow-500' : 'text-gray-400'}`}
                >
                    ★
                </span>
            ))}
        </div>
    );

    const openImageModal = (img) => {
        setSelectedImage(img);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
    };

    return (
       <>
       {
        loading? <div className='h-[50vh] flex items-center justify-center '><Loader/></div>: <div className="mt-10 px-4 md:px-8 lg:px-14">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 border-b pb-2">Reviews</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {reviews[0]?.reviews?.length > 0 ? (
            reviews[0]?.reviews?.map((review) => (
                <div
                    key={review._id}
                    className="border rounded-lg p-6 my-4 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 ease-in-out"
                >
                    <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center text-gray-600 font-bold">
                            {review.customer.username[0].toUpperCase()}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">
                            {review.customer.username}
                        </h3>
                    </div>

                    <div className="flex items-center my-2">{renderStars(review.rating)}</div>

                    <div className=' mb-1'>
                    <p className="text-gray-700  ">{preview ? review.comment:review?.comment?.length > 100 ? review?.comment?.slice(0, 100) + '...' : review?.comment}</p>
                 {
                    review?.comment.length > 100 && (   <button className=' text-blue-600 hover:underline'  onClick={()=> setPreview(!preview)}>{
                        preview? 'Show Less': 'Show More'
                        }</button>)
                 }
                    </div>

                    {review?.images?.length > 0 && (
                        <div className="flex flex-wrap -mx-1">
                            {review.images.map((img) => (
                                <img
                                    key={img}
                                    src={img}
                                    alt="Review"
                                    onClick={() => openImageModal(img)}
                                    className="cursor-pointer w-20 h-20 rounded-md mx-1 my-1 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out"
                                />
                            ))}
                        </div>
                    )}
                </div>
            ))
        ) : (
            <p className="text-gray-600 text-center">No reviews yet. Be the first to leave a review!</p>
        )}

        {/* Modal for Viewing Images */}
        {selectedImage && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={closeImageModal}
            >
                <div
                    className="relative bg-white rounded-lg mx-2.5 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                  <button
className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 focus:outline-none w-8 h-8 flex items-center justify-center"
onClick={closeImageModal}
>
✕
</button>

                    <img
                        src={selectedImage}
                        alt="Selected Review"
                        className="w-full h-full   max-w-2xl max-h-[80vh] object-contain rounded-lg"
                    />
                </div>
            </div>
        )}
    </div>
       }
       </>
    );
};

export default Review;
