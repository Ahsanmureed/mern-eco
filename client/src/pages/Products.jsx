import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Card from '../components/Card';

const Products = () => {
  const { id } = useParams(); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/api/v1/product/products/${id}`);
        setProducts(response.data.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id]);

  return (
    <div className="px-6 mt-[70px] py-10">
      <h3 className="text-3xl font-semibold text-gray-800 mb-4">Products:</h3>

      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent w-12 h-12"></div>
        </div>
      ) : products?.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product._id}>
              <Card product={product} />
            </div>
          ))}
        </div>
      ) : (
        <h1 className="mt-[90px] text-3xl font-semibold text-center">No products available for this category</h1>
      )}
    </div>
  );
};

export default Products;
