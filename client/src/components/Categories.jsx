import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/v1/category/all');
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
  <h1 className="text-4xl font-bold text-gray-900 mb-10 pt-10 text-center">
    Shop by Categories
  </h1>

  {loading ? (
    <div className="flex justify-center items-center min-h-[40vh]">
      <div className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent w-16 h-16"></div>
    </div>
  ) : (
    <>
      {categories?.length === 0 ? (
        <h1 className="mt-20 text-3xl font-semibold text-gray-700 text-center">
          No categories available
        </h1>
      ) : (
        <div className="px-6 pb-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {categories?.map((category) => (
              <div
                key={category._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                {/* Category Image with Gradient Overlay */}
                <div className="relative w-full h-56">
                  <img
                    className="w-full h-full object-cover rounded-t-xl"
                    src={category.image}
                    alt={category.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                </div>

                {/* Category Name with Button */}
                <div className="w-full p-4 text-center">
                  <Link to={`/subcategory/${category._id}`}>
                    <button className="w-full py-3 bg-blue-600 text-white font-semibold text-lg rounded-full transition-all duration-300 ease-in-out hover:bg-blue-700">
                      {category.name}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )}
</div>

  );
};

export default Categories;
