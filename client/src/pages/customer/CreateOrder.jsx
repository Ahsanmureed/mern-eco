import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../../store/cartSlice';
import toast from 'react-hot-toast';
import { createOrder } from '../../store/orderSlice';
import { loadStripe } from '@stripe/stripe-js';
import Loader from '../../components/Loader';
import { getUser, updateUser } from '../../store/userSlice';

const CreateOrder = () => {
    const dispatch = useDispatch()
  const items = useSelector((state) => state.cart.items);
  const navigate = useNavigate()
    const user = useSelector((state) => state.user.user);
  
  const [error,setError]= useState('')
  const [modalError,setModalError]= useState('')
  const [loading,setLoading]=useState(true)

  const [orderPlaced,setOrderPlaced]= useState(false)
  const total_amount = items?.reduce((acc, item) => acc + item.price * item.quantity, 2);
  const [address,setAddress]= useState(null)
  const [showModal,setShowModal]= useState(false)
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    phone_number: '',
  });
  const [buttonLoading,setButtonLoading]=useState(false)
  const [order, setOrder] = useState({
    products: items.map((item) => ({
      product_id: item._id,
      product_quantity: item.quantity,
    })),
    total_amount,
    address:address,
    billing_type: 'COD',
  });
  

  const handleChange = (e, field, isAddress = false, addressType = '') => {
    const { name, value } = e.target;

    if (isAddress) {
      setOrder((prevOrder) => ({
        ...prevOrder,
        [addressType]: {
          ...prevOrder[addressType],
          [name]: value,
        },
      }));
    } else {
      setOrder((prevOrder) => ({ ...prevOrder, [name]: value }));
    }
  };

  

  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      navigate('/cart');
    } else if (orderPlaced) {
      navigate('/orders');  
    }
  }, [ orderPlaced]);   
  const handleAddressChange = (e)=>{
    const {name,value}=e.target
    setNewAddress((prev)=>({
      ...prev,
      [name]:value
    }))
  }
  
  const token = localStorage.getItem('token')
  const fetchAddress = async()=>{
    

      const  action  = await dispatch(getUser());
       if(getUser.fulfilled.match(action)){
        setAddress(action?.payload?.address);
        setOrder((prev) => ({ ...prev, address: action?.payload?.address }));
        setLoading(false)
       }
       else{
        console.error(action.error.message)
        setLoading(false)
       }
     
  
       
  } 
  const saveAddress = async()=>{
      const action= await dispatch(updateUser({user,newAddress}))
     if(updateUser.fulfilled.match(action)){
      setShowModal(false)
      setAddress(newAddress)
      setOrder((prevOrder) => ({
        ...prevOrder,
        address: newAddress,
      }));
     }
     else{
      setModalError(action.error.message)
     }

    
  }
  
  useEffect(()=>{
    fetchAddress()
  },[])
const handleOpenModal = ()=>{
  setNewAddress(address || { street: '', city: '', state: '', zip: '', phone_number: '' });
  setShowModal(true)
}

const handleCheckout = async (e) => {
e.preventDefault()
  const token = localStorage.getItem('token');
  if (order.billing_type==='CardPayment') {
    setButtonLoading(true)
    const stripe = await loadStripe(`${import.meta.env.VITE_STRIPE_PUBLIC_KEY}`);
    const formattedCart = items.map((item) => ({
      name: item.name,
      price: item.price * 100, 
      quantity: item.quantity,
      images: item.images,
      productId: item._id, 
    }));
  


    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/order/payment/session`,
        { cartItems: formattedCart,billing_details:order.address,billing_type:order.billing_type },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );


      if (data?.id) {
        await stripe.redirectToCheckout({ sessionId: data.id });
        setButtonLoading(false)
      } else {
        console.error('No session ID returned from the server.');
      }
    } catch (error) {
      setError(error.response.data.message);
      setButtonLoading(false)
    }
   
  } else {
    try {
      setButtonLoading(true)
      const action = await dispatch(createOrder(order));
      if (createOrder.fulfilled.match(action)) {
        setOrderPlaced(true)
        setButtonLoading(false)
        toast.success('Order created successfully!');
        localStorage.removeItem('cart');
        dispatch(clearCart());
      } else {
        setError(action.error.message)
        setButtonLoading(false)
      }
    } catch (error) {
      setError(action.error.message)
    }
  }
};

  
  return (
    <>
    {loading ? (
      <Loader />
    ) : (
      <form
        onSubmit={handleCheckout}
        className="max-w-3xl  mx-auto  p-8 mt-[70px] mb-10 "
      >
        {/* Title */}
        <h1 className="text-3xl text-center font-bold mb-6 text-gray-800">
          Place Order
        </h1>
  
        {/* Products Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-700">Products</h2>
          <div className="space-y-3">
            {items?.map((product) => (
              <div
                key={product._id}
                className="flex items-center flex-col md:flex-row justify-between bg-gray-100 p-4  rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-1.5 md:gap-3 ">
                  <img
                    className="w-14 h-auto "
                    src={product?.images[0]}
                    alt={product?.name}
                  />
                  <h3 className="font-medium text-gray-800 truncate">{product?.name}</h3>
                </div>
                <div className=' flex-col flex items-center'>
                    <span className="text-gray-600">
                  <strong>Quantity:</strong> x{product?.quantity}
                </span>
                <span className="text-gray-600">
                  <strong>Price:</strong> ${product?.price}
                </span>
                </div>
               
              </div>
            ))}
          </div>
        </div>
        {/* shipping Charges */}
        <div className="my-4">
          <h2 className="text-lg font-semibold text-gray-700">Shipping Charges</h2>
          <p className="text-gray-800 text-xl font-bold">
            2$
          </p>
        </div>
        {/* Total Amount */}
        <div className="my-4">
          <h2 className="text-lg font-semibold text-gray-700">Total Amount</h2>
          <p className="text-gray-800 text-xl font-bold">
            ${total_amount}
          </p>
        </div>
  
        {/* Address Section */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Address</h2>
          {address ? (
            <div className="p-4 bg-gray-100 rounded-lg shadow">
              <p>
                <strong>Street:</strong> {address.street}
              </p>
              <p>
                <strong>City:</strong> {address.city}
              </p>
              <p>
                <strong>State:</strong> {address.state}
              </p>
              <p>
                <strong>Country:</strong> {address.country}
              </p>
              <p>
                <strong>Zip:</strong> {address.zip}
              </p>
              <p>
                <strong>Phone:</strong> {address.phone_number}
              </p>
              <button
                type="button"
                onClick={handleOpenModal}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Update Address
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add Address
            </button>
          )}
        </div>
  
        {/* Address Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-[95%]">
              <h2 className="text-xl font-semibold mb-4">Enter Address</h2>
              {["street", "city", "state", "zip", "country", "phone_number"].map(
                (field) => (
                  <div key={field} className="mb-3">
                    <input
                      type="text"
                      name={field}
                      required
                      value={newAddress[field] || ""}
                      placeholder={field.replace("_", " ").toUpperCase()}
                      onChange={handleAddressChange}
                      className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                )
              )}
              {modalError && (
                <p className="text-red-500 text-sm mb-3">{modalError}</p>
              )}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveAddress}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Save Address
                </button>
              </div>
            </div>
          </div>
        )}
  
        {/* Billing Type Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Billing Type
          </label>
          <select
            name="billing_type"
            value={order.billing_type}
            onChange={handleChange}
            className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="COD">Cash on Delivery</option>
            <option value="CardPayment">Card Payment</option>
          </select>
        </div>
  
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
  
        <button
          type="submit"
          disabled={buttonLoading}
          className="bg-blue-600 flex mx-auto text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition shadow-lg"
        >
          Submit Order
        </button>
      </form>
    )}
  </>
  
  );
};

export default CreateOrder;
