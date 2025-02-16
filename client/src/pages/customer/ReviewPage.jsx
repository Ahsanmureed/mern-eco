import React from 'react';
import ReviewForm from './ReviewForm'; 

const ReviewPage = ({ productId }) => {
  return (
    <div className="review-page pt-[75px]">
      <ReviewForm productId={productId} />
    </div>
  );
};

export default ReviewPage;
