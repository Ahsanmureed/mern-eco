import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { useDispatch } from 'react-redux';
import { forgotPassword } from '../store/userSlice';
import toast from 'react-hot-toast';
import ButtonLoader from '../components/ButtonLoader';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [timer, setTimer] = useState(60); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const action = await dispatch(forgotPassword({ email }));
      if (forgotPassword.fulfilled.match(action)) {
        toast.success(action.payload);
        setEmailSent(true);
      } else {
        setError(action.error.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      const action = await dispatch(forgotPassword({ email }));
      if (forgotPassword.fulfilled.match(action)) {
        toast.success(action.payload);
        setTimer(60);
      } else {
        setError(action.error.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval = null;
    if (emailSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval); 
  }, [emailSent, timer]);

  if (emailSent) {
    return (
      <div className="p-4 pt-[100px] mx-auto">
        <h1 className="text-xl font-semibold text-center text-green-600">Check Your Inbox!</h1>
        <p className="mt-2 text-center text-gray-600">
          We've sent you an email with a link to reset your password. Please check your inbox (and spam folder, just in case).
          If you don't receive, click below to resend the email.
        </p>
        <div className="mt-4 flex justify-center items-center">
  <button
    className="inline-flex justify-center items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 min-w-[200px] h-10"
    onClick={handleResendEmail}
    disabled={timer > 0} 
  >
    {loading ? (
      <ButtonLoader />
    ) : (
      `Resend Email ${timer > 0 ? `(${timer}s)` : ''}`
    )}
  </button>

  <button
    className="ml-2 inline-flex justify-center items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 min-w-[200px] h-10"
    onClick={() => navigate('/login')}
  >
    Back to Login
  </button>
</div>

      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center pt-[120px] px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img alt="Your Company" src={logo} className="mx-auto h-10 w-auto" />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Forgot Password
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm ">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {loading ? (
                <ButtonLoader />
              ) : (
                'Reset Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
