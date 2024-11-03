"use client";

import React, { useState } from 'react';
import { db } from '@/firebase';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setUser } from '@/redux/userSlice';
import { User } from '@/types';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import EditProfileModal from './EditProfileModal';
import { openSignupModal } from '@/redux/modalSlice';

export default function ProfileActionButton({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user: User = useAppSelector((state) => state.user);
  const isLoggedInUser: boolean = user.userUID === id;
  const isFollowing: boolean = user.userFollowing.includes(id);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  async function handleFollow() {
    if (!user.userUID) {
      dispatch(openSignupModal())
      return
    }
    try {
      await Promise.all([
        updateDoc(doc(db, 'users', String(user.userUID)), {
          userFollowing: arrayUnion(id),
        }),
        updateDoc(doc(db, 'users', id), {
          userFollowers: arrayUnion(user.userUID),
        }),
      ]);

      dispatch(setUser({
        ...user,
        userFollowing: [...user.userFollowing, id],
      }));

      router.refresh();
    } catch (error) {
      console.error("Error following user:", error);
    }
  }

  async function handleUnfollow() {
    try {
      await Promise.all([
        updateDoc(doc(db, 'users', String(user.userUID)), {
          userFollowing: arrayRemove(id),
        }),
        updateDoc(doc(db, 'users', id), {
          userFollowers: arrayRemove(user.userUID),
        }),
      ]);

      dispatch(setUser({
        ...user,
        userFollowing: user.userFollowing.filter(following => following !== id),
      }));

      router.refresh();
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  }

  return (
    <>
      {isLoggedInUser ? (
        <>
          <button
            className="mt-4 sm:mt-24 w-full sm:w-auto border border-dark-500 hover:bg-dark-500 transition-colors h-fit text-xs sm:text-sm py-1.5 sm:py-2 px-4 sm:px-6 rounded-lg"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </button>
          <EditProfileModal
            user={user}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
          />
        </>
      ) : (
        <button
          className={`mt-4 sm:mt-24 w-full sm:w-auto h-fit text-xs sm:text-sm py-1.5 sm:py-2 px-6 sm:px-8 rounded-lg ${isFollowing ? 'border border-white-800' : 'bg-brand-500'
            }`}
          onClick={isFollowing ? handleUnfollow : handleFollow}
        >
          {isFollowing ? 'Unfollow' : 'Follow'}
        </button>
      )}
    </>
  );
}