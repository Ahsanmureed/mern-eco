import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Review = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(1);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [error, setError] = useState('');
    const { slug } = useParams();

    const fetchReviews = async () => {
        const { data } = await axios.get(`http://localhost:3000/api/v1/review/product/${slug}`);
        setReviews(data.data);
    };

 
    useEffect(() => {
        fetchReviews();
    }, [productId]);


    const renderStars = (rating) => {
        return (
            <div>
                {[...Array(5)].map((_, index) => (
                    <span key={index} className={`text-xl ${index < rating ? 'text-yellow-500' : 'text-gray-400'}`}>
                        ★
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
            {reviews[0]?.reviews?.length > 0 ? (
                reviews[0]?.reviews?.map((review) => (
                    <div key={review._id} className="border rounded-lg p-4 my-2 shadow-md bg-white">
                        <h3 className="text-lg font-bold">{review.customer.username}</h3>
                        <div className="my-2">
                            {renderStars(review.rating)}
                        </div>
                        <p className="text-gray-800 my-2">{review.comment}</p>
                       
                            <div className="flex flex-wrap">
                                {review?.images?.map((img) => (
                                    <img
                                        key={img}
                                        src={img}
                                        alt="Review"
                                        className="w-20 h-20  rounded-md mr-2 mb-2"
                                    />
                                ))}
                            </div>
                       
                    </div>
                ))
            ) : (
                <p className="text-gray-600">No reviews yet.</p>
            )}

           
        </div>
    );
};

export default Review;
