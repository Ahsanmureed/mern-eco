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
    const [toatalImages,setToatalImages]=useState(null)
    let [currentImage,setCurrentImage]=useState(0);   
    const [showFullDescription, setShowFullDescription] = useState(false);
    const descriptionPreview =product?.description?.length>200? product?.description?.slice(0, 200)+'...':product?.description;
    const getProduct = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`http://localhost:3000/api/v1/product/${slug}`);
            setProduct(data.data[0]);
            setToatalImages(data?.data[0]?.images.length-1);
            
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
  
    return (
        <div className="pt-[70px]">
  {product ? (
    <>
      <Helmet>
        <title>{product?.name ? `${product.name} - Product Details` : "Product Details"}</title>
        <meta name="description" content={product?.description || 'No description available for this product.'} />
      </Helmet>

      <div className="px-10 md:px-8 lg:px-28 py-10">
        <div className="flex flex-col md:flex-row">
          {/* Product Image Section */}
          <div className="flex md:w-[50vw] relative flex-col mb-6">
            {product?.images && product?.images.length > 0 && (
              <div className="relative w-full h-[35vh] lg:w-[30vw] lg:h-[50vh] md:w-[40vw] md:h-[40vh]">
                <img
                  src={selectedImage}
                  alt={product?.name}
                  className="w-full h-full rounded-lg shadow-lg mb-4 "
                />
                {/* Previous Button */}
                <button
                  onClick={() => {
                    setSelectedImage(product?.images[currentImage - 1]);
                    setCurrentImage(currentImage - 1);
                  }}
                  className={`${
                    currentImage === 0 ? 'hidden' : ''
                  } absolute bg-gray-800 text-white py-1 px-3 rounded-md shadow-md left-2 top-1/2 transform -translate-y-1/2`}
                >
                  &#x276E;
                </button>
                {/* Next Button */}
                <button
                  onClick={() => {
                    setSelectedImage(product?.images[currentImage + 1]);
                    setCurrentImage(currentImage + 1);
                  }}
                  className={`${
                    currentImage === product?.images.length - 1 ? 'hidden' : ''
                  } absolute bg-gray-800 text-white py-1 px-3 rounded-md shadow-md right-2 top-1/2 transform -translate-y-1/2`}
                >
                  &#x276F;
                </button>
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="mt-6 md:mt-8 md:w-[50vw]">
            <h1 className="text-3xl font-bold text-gray-900">{product?.name}</h1>
            <p className="mt-2 text-2xl text-gray-800">${product?.price}</p>

            {/* Add to Cart Button */}
            <div className="mt-4 flex items-center space-x-4">
              <button
                onClick={handleAddToCart} 
                className="bg-gray-900 text-white py-2 px-6 rounded-md shadow hover:bg-gray-700 transition"
              >
                Add to Cart
              </button>
            </div>

            {/* Product Details */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-800">Product Details</h2>
              <ul className="list-disc list-inside mt-2 text-gray-600">
                <li>Quantity Available: <span className="font-medium">{product?.quantity}</span></li>
                <li className="mt-1.5">
                  Sold By: <strong>{product?.shopDetails?.name}</strong>
                  <button
                    className="p-1 bg-blue-600 rounded-md text-white ml-2"
                    onClick={() => setChatOpen(true)}
                  >
                    Chat now
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Product Description Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800">Product Description</h3>
          <div className="text-gray-600">
            {showFullDescription
              ? product?.description
              : descriptionPreview}
          </div>
          {product?.description?.length > 200 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="mt-1 text-blue-600 hover:underline"
            >
              {showFullDescription ? "Show Less" : "Read More"}
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-50 py-10">
        <div className="mx-auto px-4">
          {/* Reviews Section */}
          <Review productId={product?._id} />
        </div>
      </div>

      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setChatOpen(false)}
        initialRecipientId={product.shopDetails?.userId}
        initialRecipientName={product.shopDetails?.name}
        slug={slug}
      />
    </>
  ) : (
    <h1 className="mt-[90px] text-2xl font-semibold text-center">Product Not Found</h1>
  )}
</div>



    );
};

export default ProductDetail;
