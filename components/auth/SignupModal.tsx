import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { closeSignupModal, openLoginModal } from '@/redux/modalSlice';
import { Modal, TextField, InputAdornment, IconButton } from "@mui/material";
import Image from 'next/image';
import React, { useState, ChangeEvent } from 'react';
import { auth, db, provider } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { setUser } from '@/redux/userSlice';

interface SignupValues {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
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
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string>('');

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
      // Check username uniqueness
      const isUsernameUnique = await checkUsernameUniqueness(signupValues.username);
      if (!isUsernameUnique) {
        setError("Username is already taken");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, signupValues.email, signupValues.password);
      const user = userCredential.user;

      const defaultUserProfilePicture = '/assets/placeholder-images/profile-picture.jpg';
      const defaultUserBanner = '/assets/placeholder-images/profile-banner.jpeg';

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        userFirstName: signupValues.firstName,
        userLastName: signupValues.lastName,
        userID: signupValues.username.toLowerCase(),
        userEmail: signupValues.email,
        userProfilePictureSrc: defaultUserProfilePicture,
        userProfileBannerSrc: defaultUserBanner,
        userBio: "",
        userJoiningDate: new Date(),
        userFollowers: [],
        userFollowing: [],
        userPosts: [],
        userCommunities: [],
        userMeetups: [],
      });

      // Dispatch the user information to Redux store
      dispatch(setUser({
        userFirstName: signupValues.firstName,
        userLastName: signupValues.lastName,
        userID: signupValues.username.toLowerCase(),
        userEmail: signupValues.email,
        userUID: user.uid,
        userProfilePictureSrc: defaultUserProfilePicture,
        userProfileBannerSrc: defaultUserBanner,
        userBio: "",
        userJoiningDate: new Date(),
        userFollowers: [],
        userFollowing: [],
        userPosts: [],
        userCommunities: [],
        userMeetups: []
      }));

      // Store username separately for uniqueness check
      await setDoc(doc(db, "usernames", signupValues.username.toLowerCase()), {
        uid: user.uid
      });

      dispatch(closeSignupModal());
    } catch (error) {
      setError((error as Error).message);
    }
  }

  async function handleGoogleSignup() {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) {
        throw new Error("No email associated with the Google account");
      }

      // Extract username from email
      let username = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_\.]/g, '');
      let isUnique = false;
      let counter = 0;

      while (!isUnique) {
        const testUsername = counter === 0 ? username : `${username}${counter}`;
        isUnique = await checkUsernameUniqueness(testUsername);
        if (isUnique) {
          username = testUsername;
        } else {
          counter++;
        }
      }

      const defaultUserProfilePicture = '/assets/placeholder-images/profile-picture.jpg';
      const defaultUserBanner = '/assets/placeholder-images/profile-banner.jpeg';

      await setDoc(doc(db, "users", user.uid), {
        userFirstName: user.displayName?.split(' ')[0] || '',
        userLastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        userID: username,
        userEmail: user.email,
        userProfilePictureSrc: user.photoURL || defaultUserProfilePicture,
        userProfileBannerSrc: defaultUserBanner,
        userBio: "",
        userJoiningDate: new Date(),
        userFollowers: [],
        userFollowing: [],
        userPosts: [],
        userCommunities: [],
        userMeetups: [],
      });

      await setDoc(doc(db, "usernames", username), {
        uid: user.uid
      });

      // Dispatch user information to Redux store
      dispatch(setUser({
        userFirstName: user.displayName?.split(' ')[0] || '',
        userLastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        userID: username,
        userEmail: user.email || '',
        userUID: user.uid,
        userProfilePictureSrc: user.photoURL || defaultUserProfilePicture,
        userProfileBannerSrc: defaultUserBanner,
        userBio: "",
        userJoiningDate: new Date(),
        userFollowers: [],
        userFollowing: [],
        userPosts: [],
        userCommunities: [],
        userMeetups: []
      }));

      console.log("User signed up with Google successfully");
      dispatch(closeSignupModal());
    } catch (error) {
      setError((error as Error).message);
    }
  }

  function handleToggleModals() {
    dispatch(closeSignupModal());
    dispatch(openLoginModal())
  }

  return (
    <Modal open={isOpen} onClose={() => dispatch(closeSignupModal())}>
      <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full">
        <div
          className="fixed top-0 left-0 w-full h-full bg-black opacity-50"
          onClick={() => dispatch(closeSignupModal())}
        />
        <div className="relative w-[50%] min-w-[280px] max-w-[520px] px-6 py-12 bg-white-500 flex flex-col items-center justify-center rounded-lg overflow-hidden">
          <span
            onClick={() => dispatch(closeSignupModal())}
            className="absolute cursor-pointer top-5 right-5 px-[10px] py-[3px] rounded-full bg-red-500"
          >
            X
          </span>
          <form className="flex flex-col w-full text-dark-800 mb-6" onSubmit={handleSubmit}>
            <h1 className='text-center font-bold text-lg mb-2'>Get Started with the Collabor8</h1>
            <button type="button" onClick={handleGoogleSignup} className='my-2 bg-blue-500 py-2 rounded text-white-500 flex items-center justify-center'>
              <Image src={'/logos/google.png'} width={32} height={32} alt='' className='rounded-full bg-white-500 p-1 mr-2' />
              Signup with Google
            </button>
            <div className="flex items-center gap-6 mb-4">
              <span className="h-[1px] bg-gray-400 w-[80%]" />
              <p className="text-gray-500">or</p>
              <span className="h-[1px] bg-gray-400 w-[80%]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <TextField
                  name="firstName"
                  label="First Name"
                  fullWidth
                  value={signupValues.firstName}
                  onChange={handleSignupChange}
                  required
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
                />
              </div>
              <div className="col-span-2">
                <TextField
                  name="username"
                  label="Username"
                  fullWidth
                  value={signupValues.username}
                  onChange={handleSignupChange}
                  required
                  error={!!usernameError}
                  helperText={usernameError}
                />
              </div>
              <div className="col-span-2">
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  value={signupValues.email}
                  onChange={handleSignupChange}
                  required
                />
              </div>
              <div className="col-span-2">
                <TextField
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  value={signupValues.password}
                  onChange={handleSignupChange}
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
              <div className="col-span-2">
                <TextField
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  fullWidth
                  value={signupValues.confirmPassword}
                  onChange={handleSignupChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={toggleConfirmPasswordVisibility}
                          edge="end"
                        >
                          {showConfirmPassword ? (
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
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <button type="submit" className="mt-4 bg-blue-500 py-2 rounded text-white-500">
              Sign Up
            </button>
          </form>
          <button
            onClick={handleToggleModals}
            className="absolute bottom-0 w-full p-3 pt-4 text-blue-500 hover:bg-gray-300 active:bg-blue-400 active:text-white-500"
          >
            Already have an account?
          </button>
        </div>
      </div>
    </Modal>
  )
}