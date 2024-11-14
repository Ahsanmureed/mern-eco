import React, { useEffect, useState } from 'react';
import logo from '../assets/logo.png';
import { useDispatch } from 'react-redux';
import { clearError, resetPassword, resetTokenChecker } from '../store/userSlice';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const navigate = useNavigate();
    const { token } = useParams();
    const dispatch = useDispatch();
    const [password, setPassword] = useState('');
    const [errorMessage,setErrorMessage]= useState('')
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        try {
            const action = await dispatch(resetPassword({ token, password }));
            if (resetPassword.fulfilled.match(action)) {
                toast.success(action.payload);
                navigate('/login');
            } else {
                setErrorMessage(action.error.message);
            }
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const fetch = async () => {
        const action = await dispatch(resetTokenChecker({ token }));
        if (resetTokenChecker.fulfilled.match(action)) {
            console.log('Token is valid');
        } else {
            console.log('Invalid token, navigating to login');
            setError('Token has expired or is invalid. Please request a new password reset link.');
            setTimeout(() => {
                navigate('/login');
            }, 5000); 
        }
    };

    useEffect(() => {
        fetch();
    }, [dispatch, token]);

    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    return (
    <>
    {
        error? (<div className="text-black  text-2xl font-semibold mt-2 pt-[80px] text-center">
            {error}
        </div>):( <div className="flex min-h-full flex-1 flex-col justify-center pt-[120px] px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img alt="Your Company" src={logo} className="mx-auto h-10 w-auto" />
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Reset Password
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                            New Password
                        </label>
                        <div className="mt-2">
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">
                            Confirm New Password
                        </label>
                        <div className="mt-2">
                            <input
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                    {errorMessage && (
                        <div className="text-red-500 text-sm mt-2">
                            {errorMessage}
                        </div>
                    )}
                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Reset Password
                        </button>
                    </div>
                </form>
            </div>
        </div>)
    }
    </>

    );
};

export default ResetPassword;
