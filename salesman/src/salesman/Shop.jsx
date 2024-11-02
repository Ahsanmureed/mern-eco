import React, { useEffect, useState } from 'react';
import SideBar from './SideBar';
import { useSelector, useDispatch } from 'react-redux';
import { fetchShop, createShop, selectShop, selectShopLoading, selectShopError } from '../store/shopSlice'; 

const Shop = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [shopName, setShopName] = useState('');
    const dispatch = useDispatch();
    const shop = useSelector(selectShop);
    const error = useSelector(selectShopError);
    const user = useSelector((state) => state?.user?.user);

    useEffect(() => {
        if (user?._id) {
            dispatch(fetchShop(user._id));
        }
    }, [user, dispatch]);

    const handleCreateShop = async () => {
        const token = localStorage.getItem('token');
        if (token) {
         const action=  await dispatch(createShop({ shopName }))
            if(createShop.fulfilled.match(action)){
                setShopName('');
                setIsCreating(false);
                dispatch(fetchShop(user?._id));
            }
           
        }
    };

    return (
        <div className='  flex '>
             <div className="sidebar fixed top-16 left-0 h-full"> 
        <SideBar />
      </div>

            <div className="shop-container ml-64  p-5">
                
                {error && <p className="text-red-500">{error}</p>}
                {shop ? (
                    <div>
                        <h2 className="text-3xl mb-2 font-bold">Your Shop</h2>
                        <p className="text-lg capitalize">Shop Name: <strong>{shop.name}</strong></p>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-bold">No Shop Found</h2>
                        {!isCreating ? (
                            <div>
                                <p className="mb-3">You do not have a shop yet. Create one!</p>
                                <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                    onClick={() => setIsCreating(true)}
                                >
                                    Create Shop
                                </button>
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Enter Shop Name"
                                    value={shopName}
                                    onChange={(e) => setShopName(e.target.value)}
                                    className="border p-2 rounded mb-2 w-full"
                                />
                                <button
                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                    onClick={handleCreateShop}
                                >
                                    Create
                                </button>
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded ml-2"
                                    onClick={() => setIsCreating(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Shop;
