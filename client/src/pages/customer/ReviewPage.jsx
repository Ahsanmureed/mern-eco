import React from 'react';
import ReviewForm from './ReviewForm'; 

const ReviewPage = ({ productId }) => {
  return (
    <div className="review-page pt-[80px]">
      <h1 className="text-2xl mb-4">Submit a Review</h1>
      <ReviewForm productId={productId} />
    </div>
  );
};

export default ReviewPage;
