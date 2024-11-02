import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Review from '../components/Review';
import ProductDetailsSkelton from '../components/skeltons/ProductDetailsSkelton';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import ChatModal from './customer/ChatModal';

const ProductDetail = () => {
    const [product, setProduct] = useState({});
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const { slug } = useParams();
    const [selectedImage, setSelectedImage] = useState('');
    const [isChatOpen, setChatOpen] = useState(false);

    const getProduct = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`http://localhost:3000/api/v1/product/${slug}`);
            setProduct(data.data[0]);
            if (data.data[0].images.length > 0) {
                setSelectedImage(data.data[0].images[0]);
            }
        } catch (error) {
            console.error("Error fetching product:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProduct();
    }, [slug]);

    const handleAddToCart = () => {
        dispatch(addToCart(product));
        alert(`${product.name} has been added to the cart!`);
    };

    if (loading) {
        return <ProductDetailsSkelton />;
    }

    return (
        <>
            <div className="container mx-auto pt-[120px] px-20 py-10">
                <div className="flex flex-col md:flex-row items-center md:space-x-6">
                    <div className='flex flex-col'>
                        <div className="w-full flex flex-col md:w-1/2 mb-6">
                            {selectedImage && (
                                <img
                                    src={selectedImage}
                                    alt={product?.name}
                                    className="w-[35vw] h-[35vh] object-center rounded-lg shadow-lg mb-4 transition-transform duration-200 hover:scale-105"
                                />
                            )}
                        </div>
                        <div className="flex flex-row items-center space-x-2 md:w-1/2">
                            {product?.images && product?.images.length > 0 ? (
                                product.images.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-[5vw] h-[6vh] rounded-lg cursor-pointer border border-gray-300 transition-transform duration-200 hover:scale-105"
                                        onClick={() => setSelectedImage(img)}
                                    />
                                ))
                            ) : (
                                <p>No images available</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 md:mt-0 md:w-1/2">
                        <h1 className="text-4xl font-bold text-gray-900">{product?.name}</h1>
                        <p className="mt-2 text-2xl text-gray-800">${product?.price}</p>
                        <div className="mt-4 flex items-center space-x-4">
                            <button 
                                onClick={handleAddToCart} 
                                className="bg-gray-900 text-white py-2 px-6 rounded-md shadow hover:bg-gray-700 transition"
                            >
                                Add to Cart
                            </button>
                        </div>
                        <div className="mt-8">
                            <h2 className="text-2xl font-semibold text-gray-800">Product Details</h2>
                            <ul className="list-disc list-inside mt-2 text-gray-600">
                                <li>Quantity Available: <span className="font-medium">{product?.quantity}</span></li>
                                <li className='mt-1.5'>
                                    Sold By: <strong>{product?.shopDetails?.name}</strong>
                                    <button 
                                        className='p-1 bg-blue-600 rounded-md text-white ml-2' 
                                        onClick={() => setChatOpen(true)}
                                    >
                                        Chat now
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 py-10">
                <div className="container mx-auto px-4">
                    <Review productId={product?._id} />
                </div>
            </div>

            {/* Chat Modal */}
            <ChatModal 
                isOpen={isChatOpen} 
                onClose={() => setChatOpen(false)} 
                recipientId={product.shopDetails?.userId} 
                recipientName={product.shopDetails?.name} 
            />
        </>
    );
};

export default ProductDetail;
