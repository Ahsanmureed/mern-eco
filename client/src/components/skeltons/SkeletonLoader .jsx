// SkeletonLoader.js
import React from 'react';

const SkeletonLoader = ({ orderCount, productCount }) => {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Your Orders</h1>
      {Array.from({ length: orderCount }).map((_, orderIndex) => (
        <div key={orderIndex} className="border p-4 rounded-lg shadow-lg animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <h3 className="font-semibold mt-2">Products:</h3>
          <div className="space-y-8">
            {Array.from({ length: productCount }).map((_, productIndex) => (
              <div key={productIndex} className="flex items-center animate-pulse">
                <div className="w-16 h-16 bg-gray-300 rounded mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-1"></div>
                  <div className="h-4 bg-gray-300 rounded mb-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
