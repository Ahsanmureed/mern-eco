// SkeletonLoader.js
import React from 'react';

const ProductDetailsSkelton = () => {
    return (
        <div className="container mx-auto pt-[120px] px-20 py-10">
            <div className="flex flex-col md:flex-row items-center md:space-x-6">
                {/* Image Section */}
                <div className='flex flex-col'>
                    <div className="w-full flex flex-col md:w-1/2 mb-6 animate-pulse">
                        <div className="bg-gray-300 h-[35vh] rounded-lg mb-4"></div>
                    </div>

                    {/* Thumbnails Section */}
                    <div className="flex flex-row items-center space-x-2 md:w-1/2">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="bg-gray-300 w-[5vw] h-[6vh] rounded-lg"></div>
                        ))}
                    </div>
                </div>

                {/* Details Section */}
                <div className="mt-6 md:mt-0 md:w-1/2 animate-pulse">
                    <div className="bg-gray-300 h-8 w-3/4 rounded mb-4"></div>
                    <div className="bg-gray-300 h-6 w-1/4 rounded mb-4"></div>
                    <div className="flex items-center space-x-4">
                        <div className="bg-gray-300 h-10 w-1/2 rounded"></div>
                    </div>
                    <div className="mt-8">
                        <h2 className="bg-gray-300 h-6 w-3/4 rounded mb-2"></h2>
                        <ul className="list-disc list-inside mt-2 text-gray-600">
                            <li className="bg-gray-300 h-4 w-1/2 rounded mb-2"></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsSkelton;
