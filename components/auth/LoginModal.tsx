import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { closeLoginModal, openSignupModal } from '@/redux/modalSlice';
import { Modal, TextField, InputAdornment, IconButton } from '@mui/material';
import Image from 'next/image';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '@/firebase';
import { handleGoogleAuth } from './GoogleAuthHandler';
import { setUser } from '@/redux/userSlice';

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginValues.email,
        loginValues.password
      );
      console.log('Login successful:', userCredential);
      dispatch(closeLoginModal());
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const userData = await handleGoogleAuth(false);
      dispatch(setUser({
        ...userData,
        userUID: auth.currentUser!.uid,
      }));
      dispatch(closeLoginModal());
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
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <div
          className="fixed inset-0 bg-black opacity-50"
          onClick={() => dispatch(closeLoginModal())}
        />
        <div className="relative w-full sm:w-[90%] md:w-[70%] lg:w-[50%] min-w-[280px] max-w-[520px] bg-white-500 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-8 sm:py-12">
            <span
              onClick={() => dispatch(closeLoginModal())}
              className="absolute cursor-pointer top-2 right-2 sm:top-5 sm:right-5 px-2 py-1 sm:px-[10px] sm:py-[3px] rounded-full bg-red-500 text-white-500 text-sm"
            >
              X
            </span>

            <form className="flex flex-col w-full text-dark-800 mb-14 sm:mb-6" onSubmit={handleSubmit}>
              <h1 className="text-center font-bold text-base sm:text-lg mb-2">
                Login to Collabor8
              </h1>

              <button
                type="button"
                className="my-2 bg-blue-500 py-2 rounded text-white-500 flex items-center justify-center text-sm sm:text-base"
                onClick={handleGoogleLogin}
              >
                <Image
                  src={'/logos/google.png'}
                  width={24}
                  height={24}
                  alt="Google logo"
                  className="rounded-full bg-white-500 p-1 mr-2 sm:w-8 sm:h-8"
                />
                Login with Google
              </button>

              <div className="flex items-center gap-4 sm:gap-6 mb-4">
                <span className="h-[1px] bg-gray-400 w-full" />
                <p className="text-gray-500 text-sm whitespace-nowrap">or</p>
                <span className="h-[1px] bg-gray-400 w-full" />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div className="col-span-1">
                  <TextField
                    name="email"
                    label="Email"
                    type="email"
                    fullWidth
                    value={loginValues.email}
                    onChange={handleLoginChange}
                    required
                    size="small"
                    className="text-sm sm:text-base"
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
                    size="small"
                    className="text-sm sm:text-base"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={togglePasswordVisibility}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? (
                              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-400 rounded-full" />
                            ) : (
                              <span className="w-4 h-1 sm:w-5 sm:h-1 bg-gray-400 block" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-center mt-2 text-sm">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="mt-4 bg-blue-500 py-2 rounded text-white-500 text-sm sm:text-base"
              >
                Login
              </button>
            </form>

            <button
              onClick={handleToggleModals}
              className="absolute bottom-0 left-0 w-full p-2 sm:p-3 pt-3 sm:pt-4 text-sm sm:text-base text-blue-500 hover:bg-gray-300 active:bg-blue-400 active:text-white-500"
            >
              Don&apos;t have an account?
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
