"use client";

import { db } from '@/firebase';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setUser } from '@/redux/userSlice';
import { User } from '@/types';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileActionButton({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user: User = useAppSelector((state) => state.user);
  const isLoggedInUser: boolean = user.userUID === id;
  const isFollowing: boolean = user.userFollowing.includes(id);

  async function handleFollow() {
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
    <div>
      {isLoggedInUser ? (
        <button className="mt-24 mr-4 border border-white-800 h-fit text-sm py-2 px-6 rounded-lg">
          Edit Profile
        </button>
      ) : (
        <button
          className={`mt-24 mr-4 h-fit text-sm py-2 px-8 rounded-lg ${isFollowing ? 'border border-white-800' : 'bg-brand-500'
            }`}
          onClick={isFollowing ? handleUnfollow : handleFollow}
        >
          {isFollowing ? 'Unfollow' : 'Follow'}
        </button>
      )}
    </div>
  );
}
