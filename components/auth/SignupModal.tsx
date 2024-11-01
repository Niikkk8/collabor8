import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { closeSignupModal, openLoginModal } from '@/redux/modalSlice';
import { Modal, TextField, InputAdornment, IconButton } from "@mui/material";
import Image from 'next/image';
import React, { useState, ChangeEvent, useRef } from 'react';
import { auth, db, provider, storage } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { setUser } from '@/redux/userSlice';
import { handleGoogleAuth } from './GoogleAuthHandler';

interface SignupValues {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  profilePicture: File | null;
  profileBanner: File | null;
}
export default function SignupModal() {
  const isOpen = useAppSelector((state) => state.modals.signupModal);
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [signupValues, setSignupValues] = useState<SignupValues>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePicture: null,
    profileBanner: null
  });
  const [error, setError] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');
  const [profilePreview, setProfilePreview] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');

  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleSignupChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'username') {
      const lowercaseValue = value.toLowerCase();
      const sanitizedValue = lowercaseValue.replace(/[^a-z0-9_\.]/g, '');
      setSignupValues(prevValues => ({
        ...prevValues,
        [name]: sanitizedValue
      }));
      validateUsername(sanitizedValue);
    } else {
      setSignupValues(prevValues => ({
        ...prevValues,
        [name]: value
      }));
    }
  };

  const validateImage = (file: File, type: 'profile' | 'banner'): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const aspectRatio = img.width / img.height;

        if (type === 'profile') {
          if (aspectRatio < 0.95 || aspectRatio > 1.05) {
            setImageError('Profile picture must be square (1:1 ratio)');
            resolve(false);
          } else {
            setImageError('');
            resolve(true);
          }
        } else {
          if (aspectRatio < 1.6 || aspectRatio > 2.5) {
            setImageError('Banner must be rectangular (16:9 ratio recommended)');
            resolve(false);
          } else {
            setImageError('');
            resolve(true);
          }
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setImageError('Invalid image file');
        resolve(false);
      };

      img.src = objectUrl;
    });
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');
    if (type === 'profile') {
      setProfilePreview('');
    } else {
      setBannerPreview('');
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size should be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setImageError('Please upload an image file');
      return;
    }

    try {
      const isValid = await validateImage(file, type);
      if (!isValid) return;

      setSignupValues(prev => ({
        ...prev,
        [type === 'profile' ? 'profilePicture' : 'profileBanner']: file
      }));

      const previewUrl = URL.createObjectURL(file);
      if (type === 'profile') {
        setProfilePreview(previewUrl);
      } else {
        setBannerPreview(previewUrl);
      }

      return () => {
        URL.revokeObjectURL(previewUrl);
      };
    } catch (error) {
      setImageError('Error processing image. Please try another file.');
    }
  };

  const ImagePreview: React.FC<{ src: string; alt: string; type: 'profile' | 'banner' }> = ({ src, alt, type }) => {
    return (
      <div className={`relative ${type === 'profile' ? 'w-[100px] h-[100px]' : 'w-[200px] h-[80px]'}`}>
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-cover ${type === 'profile' ? 'rounded-full' : 'rounded'}`}
        />
      </div>
    );
  };

  const validateUsername = (username: string) => {
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters long');
    } else if (username.length > 20) {
      setUsernameError('Username must be no more than 20 characters long');
    } else if (!/^[a-z0-9_\.]+$/.test(username)) {
      setUsernameError('Username can only contain lowercase letters, numbers, underscores, and periods');
    } else {
      setUsernameError('');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  async function checkUsernameUniqueness(username: string): Promise<boolean> {
    const usernameDoc = await getDoc(doc(db, "usernames", username.toLowerCase()));
    return !usernameDoc.exists();
  }

  async function uploadImage(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (usernameError) {
      setError(usernameError);
      return;
    }

    if (signupValues.password !== signupValues.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const isUsernameUnique = await checkUsernameUniqueness(signupValues.username);
      if (!isUsernameUnique) {
        setError("Username is already taken");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupValues.email,
        signupValues.password
      );
      const user = userCredential.user;

      const defaultUserProfilePicture = '/assets/placeholder-images/profile-picture.jpg';
      const defaultUserBanner = '/assets/placeholder-images/profile-banner.jpeg';

      let profilePictureUrl = defaultUserProfilePicture;
      let bannerUrl = defaultUserBanner;

      if (signupValues.profilePicture) {
        profilePictureUrl = await uploadImage(
          signupValues.profilePicture,
          `users/${user.uid}/profile-picture.${signupValues.profilePicture.name.split('.').pop()}`
        );
      }

      if (signupValues.profileBanner) {
        bannerUrl = await uploadImage(
          signupValues.profileBanner,
          `users/${user.uid}/profile-banner.${signupValues.profileBanner.name.split('.').pop()}`
        );
      }

      const userData = {
        userFirstName: signupValues.firstName,
        userLastName: signupValues.lastName,
        userID: signupValues.username.toLowerCase(),
        userEmail: signupValues.email,
        userProfilePictureSrc: profilePictureUrl,
        userProfileBannerSrc: bannerUrl,
        userBio: "",
        userJoiningDate: new Date(),
        userFollowers: [],
        userFollowing: [],
        userPosts: [],
        userCommunities: [],
        userMeetups: [],
      };

      await setDoc(doc(db, "users", user.uid), userData);
      await setDoc(doc(db, "usernames", signupValues.username.toLowerCase()), {
        uid: user.uid
      });

      dispatch(setUser({
        ...userData,
        userUID: user.uid,
      }));

      dispatch(closeSignupModal());
    } catch (error) {
      setError((error as Error).message);
    }
  }

  const handleGoogleSignup = async () => {
    try {
      const userData = await handleGoogleAuth(true);
      dispatch(setUser({
        ...userData,
        userUID: auth.currentUser!.uid,
      }));
      dispatch(closeSignupModal());
    } catch (error: any) {
      setError(error.message);
    }
  };

  function handleToggleModals() {
    dispatch(closeSignupModal());
    dispatch(openLoginModal())
  }

  return (
    <Modal open={isOpen} onClose={() => dispatch(closeSignupModal())}>
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <div
          className="fixed inset-0 bg-black opacity-50"
          onClick={() => dispatch(closeSignupModal())}
        />
        <div className="relative w-full sm:w-[90%] md:w-[70%] lg:w-[50%] min-w-[280px] max-w-[520px] bg-white-500 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-8 sm:py-12">
            <span
              onClick={() => dispatch(closeSignupModal())}
              className="absolute cursor-pointer top-2 right-2 sm:top-5 sm:right-5 px-2 py-1 sm:px-[10px] sm:py-[3px] rounded-full bg-red-500 text-white-500 text-sm"
            >
              X
            </span>

            <form className="flex flex-col w-full text-dark-800 mb-14 sm:mb-6" onSubmit={handleSubmit}>
              <h1 className="text-center font-bold text-base sm:text-lg mb-2">
                Get Started with the Collabor8
              </h1>

              <button
                type="button"
                onClick={handleGoogleSignup}
                className="my-2 bg-blue-500 py-2 rounded text-white-500 flex items-center justify-center text-sm sm:text-base"
              >
                <Image
                  src={'/logos/google.png'}
                  width={24}
                  height={24}
                  alt=""
                  className="rounded-full bg-white-500 p-1 mr-2 sm:w-8 sm:h-8"
                />
                Signup with Google
              </button>

              <div className="flex items-center gap-4 sm:gap-6 mb-4">
                <span className="h-[1px] bg-gray-400 w-full" />
                <p className="text-gray-500 text-sm whitespace-nowrap">or</p>
                <span className="h-[1px] bg-gray-400 w-full" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="col-span-1">
                  <TextField
                    name="firstName"
                    label="First Name"
                    fullWidth
                    value={signupValues.firstName}
                    onChange={handleSignupChange}
                    required
                    size="small"
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="col-span-1">
                  <TextField
                    name="lastName"
                    label="Last Name"
                    fullWidth
                    value={signupValues.lastName}
                    onChange={handleSignupChange}
                    required
                    size="small"
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <TextField
                    name="username"
                    label="Username"
                    fullWidth
                    value={signupValues.username}
                    onChange={handleSignupChange}
                    required
                    error={!!usernameError}
                    helperText={usernameError}
                    size="small"
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <TextField
                    name="email"
                    label="Email"
                    type="email"
                    fullWidth
                    value={signupValues.email}
                    onChange={handleSignupChange}
                    required
                    size="small"
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <TextField
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    value={signupValues.password}
                    onChange={handleSignupChange}
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

                <div className="col-span-1 sm:col-span-2">
                  <TextField
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    fullWidth
                    value={signupValues.confirmPassword}
                    onChange={handleSignupChange}
                    required
                    size="small"
                    className="text-sm sm:text-base"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={toggleConfirmPasswordVisibility}
                            edge="end"
                            size="small"
                          >
                            {showConfirmPassword ? (
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

                <div className="col-span-1 sm:col-span-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={profileInputRef}
                    onChange={(e) => handleImageChange(e, 'profile')}
                  />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    {profilePreview && (
                      <ImagePreview
                        src={profilePreview}
                        alt="Profile Preview"
                        type="profile"
                        // className="w-16 h-16 sm:w-20 sm:h-20"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => profileInputRef.current?.click()}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100"
                    >
                      Upload Profile Picture (Optional)
                    </button>
                  </div>
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={bannerInputRef}
                    onChange={(e) => handleImageChange(e, 'banner')}
                  />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    {bannerPreview && (
                      <ImagePreview
                        src={bannerPreview}
                        alt="Banner Preview"
                        type="banner"
                        // className="w-24 h-12 sm:w-32 sm:h-16"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100"
                    >
                      Upload Banner (Optional)
                    </button>
                  </div>
                </div>
              </div>

              {imageError && (
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-red-500 text-sm">{imageError}</p>
                </div>
              )}
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

              <button type="submit" className="mt-4 bg-blue-500 py-2 rounded text-white-500 text-sm sm:text-base">
                Sign Up
              </button>
            </form>

            <button
              onClick={handleToggleModals}
              className="absolute bottom-0 left-0 w-full p-2 sm:p-3 pt-3 sm:pt-4 text-sm sm:text-base text-blue-500 hover:bg-gray-300 active:bg-blue-400 active:text-white-500"
            >
              Already have an account?
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}