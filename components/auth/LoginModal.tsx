import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { closeLoginModal, openSignupModal } from '@/redux/modalSlice';
import { Modal, TextField, InputAdornment, IconButton } from '@mui/material';
import Image from 'next/image';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '@/firebase'; // Import auth and Google provider from your firebase config
import { useRouter } from 'next/router';

interface LoginValues {
  email: string;
  password: string;
}

export default function LoginModal() {
  const isOpen = useAppSelector((state) => state.modals.loginModal);
  const dispatch = useAppDispatch();
  const [loginValues, setLoginValues] = useState<LoginValues>({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle email/password login
  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle form submission for email/password login
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    try {
      // Firebase login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginValues.email,
        loginValues.password
      );
      console.log('Login successful:', userCredential);
      dispatch(closeLoginModal()); // Close modal upon successful login
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Google login successful:', result);
      dispatch(closeLoginModal()); // Close modal upon successful Google login
    } catch (error: any) {
      setError(error.message);
    }
  };

  function handleToggleModals() {
    dispatch(closeLoginModal());
    dispatch(openSignupModal())
  }

  return (
    <Modal open={isOpen} onClose={() => dispatch(closeLoginModal())}>
      <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full">
        <div
          className="fixed top-0 left-0 w-full h-full bg-black opacity-50"
          onClick={() => dispatch(closeLoginModal())}
        />
        <div className="relative w-[50%] min-w-[280px] max-w-[520px] px-6 py-12 bg-white-500 flex flex-col items-center justify-center rounded-lg overflow-hidden">
          <span
            onClick={() => dispatch(closeLoginModal())}
            className="absolute cursor-pointer top-5 right-5 px-[10px] py-[3px] rounded-full bg-red-500"
          >
            X
          </span>

          <form className="flex flex-col w-full text-dark-800 mb-6" onSubmit={handleSubmit}>
            <h1 className='text-center font-bold text-lg mb-2'>Login to Collabor8</h1>

            {/* Google Login */}
            <button
              type="button"
              className='my-2 bg-blue-500 py-2 rounded text-white-500 flex items-center justify-center'
              onClick={handleGoogleLogin}
            >
              <Image
                src={'/logos/google.png'}
                width={32}
                height={32}
                alt='Google logo'
                className='rounded-full bg-white-500 p-1 mr-2'
              />
              Login with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-6 mb-4">
              <span className="h-[1px] bg-gray-400 w-[80%]" />
              <p className="text-gray-500">or</p>
              <span className="h-[1px] bg-gray-400 w-[80%]" />
            </div>

            {/* Email/Password Login */}
            <div className="grid grid-cols-1 gap-4">
              <div className="col-span-1">
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  value={loginValues.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <div className="col-span-1">
                <TextField
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  value={loginValues.password}
                  onChange={handleLoginChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? (
                            <div className="w-5 h-5 bg-gray-400 rounded-full" />
                          ) : (
                            <span className="w-5 h-1 bg-gray-400 block" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-red-500 text-center mt-2">{error}</p>
            )}

            <button type="submit" className="mt-4 bg-blue-500 py-2 rounded text-white-500">
              Login
            </button>
          </form>
          <button
            onClick={handleToggleModals}
            className="absolute bottom-0 w-full p-3 pt-4 text-blue-500 hover:bg-gray-300 active:bg-blue-400 active:text-white-500"
          >
            Don&apos;t have an account?
          </button>
        </div>
      </div>
    </Modal>
  );
}
