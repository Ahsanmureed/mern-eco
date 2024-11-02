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
console.log(reviews);

 
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

            {/* <form onSubmit={handleSubmit} className="mt-6 p-4 border rounded-lg shadow-md bg-white">
                <h3 className="text-xl font-semibold mb-2">Write a Review</h3>
                <div className="mb-4">
                    <label className="block text-gray-700">Rating:</label>
                    <div className="flex my-2">
                        {[1, 2, 3, 4, 5].map((r) => (
                            <span
                                key={r}
                                className={`text-xl cursor-pointer ${r <= rating ? 'text-yellow-500' : 'text-gray-400'}`}
                                onClick={() => setRating(r)}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Comment:</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mt-1 block w-full border rounded-md p-2 h-24"
                    />
                </div>
                <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-500 transition">
                    Submit Review
                </button>
                {error && <p className="mt-2 text-red-500">{error}</p>}
            </form> */}
        </div>
    );
};

export default Review;
