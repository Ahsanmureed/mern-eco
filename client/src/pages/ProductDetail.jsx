import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';  
import Review from '../components/Review';
import ProductDetailsSkelton from '../components/skeltons/ProductDetailsSkelton';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import ChatModal from './customer/ChatModal';
import toast from 'react-hot-toast';

const ProductDetail = () => {
    const [product, setProduct] = useState('');
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
        toast.success(`${product.name} has been added to the cart!`);
    };

    if (loading) {
        return <ProductDetailsSkelton />;
    }
 console.log(product);
 
    return (
        <div>
            {
                product ? (<>
                <Helmet>
    <title>{product?.name ? `${product.name} - Product Details` : "Product Details"}</title>
    <meta name="description" content={product?.description || 'No description available for this product.'} />
</Helmet>

                <div className=" px-4 md:px-8 lg:px-20 pt-[90px]   lg:pt-[120px]  py-10">
                    <div className="flex flex-col md:flex-row  ">
                        {/* Main Image Section */}
                        <div className='flex md:w-[50vw] flex-col mb-6'>
                            <div className="w-full flex flex-col mb-6">
                                {selectedImage && (
                                    <img
                                        src={selectedImage}
                                        alt={product?.name}
                                        className=" w-[90vw] h-[35vh]  lg:w-[30vw]  lg:h-[45vh] md:w-[40vw]  md:h-[30vh]    object-contain rounded-lg shadow-lg mb-4 transition-transform duration-200 hover:scale-105"
                                    />
                                )}
                            </div>
    
                            {/* Thumbnail Images */}
                            <div className="flex flex-row items-center space-x-2 ">
                                {product?.images && product?.images.length > 0 ? (
                                    product.images.map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-[15vw] sm:w-[20vw] md:w-[7vw] md:h-[5vh]  lg:h-[7vh] lg:w-[6vw] h-[7vh] rounded-lg cursor-pointer border border-gray-300 transition-transform duration-200 hover:scale-110"
                                            onClick={() => setSelectedImage(img)}
                                        />
                                    ))
                                ) : (
                                    <p>No images available</p>
                                )}
                            </div>
                        </div>
    
                        {/* Product Details */}
                        <div className="mt-6 md:mt-8 md:w-[50vw] ">
                            <h1 className="text-3xl w-fulll font-bold text-gray-900">{product?.name}</h1>
                            <p className="mt-2 text-2xl text-gray-800">${product?.price}</p>
                            <div className="mt-4 flex items-center space-x-4">
                                <button
                                    onClick={handleAddToCart}
                                    className="bg-gray-900 text-white py-2 px-6 rounded-md shadow hover:bg-gray-700 transition"
                                >
                                    Add to Cart
                                </button>
                            </div>
                            <div className="mt-8 ">
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
                /></>):<><h1 className=' mt-[90px] text-2xl font-semibold text-center'>Product Not Found</h1></>
            }
        </div>
    );
};

export default ProductDetail;
