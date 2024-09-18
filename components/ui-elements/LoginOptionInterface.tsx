import React from 'react'
import { useAppDispatch } from '@/redux/hooks';
import { openLoginModal, openSignupModal } from '@/redux/modalSlice';

export default function LoginOptionInterface() {
  const dispatch = useAppDispatch();

  return (
    <div className='absolute bottom-0 w-full py-6 flex flex-col items-center bg-brand-700 px-2'>
        <p className='text-lg text-center'>Looks like you&apos;re not logged in yet! :/</p>
        <div className="flex space-x-4 mt-3">
          <button className='border border-white-500 px-6 py-2 rounded-full text-sm font-medium' onClick={() => dispatch(openSignupModal())}>Create Account</button>
          <button className='bg-white-500 text-black px-6 py-2 rounded-full text-sm font-medium' onClick={() => dispatch(openLoginModal())}>Log In</button>
        </div>
    </div>
  )
}
