'use client'

import { db } from '@/firebase';
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setUser } from '@/redux/userSlice';
import { User } from '@/types'
import { arrayRemove, arrayUnion, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import React from 'react'

export default function CommunityActionButton({ communityId, communityAdmin }: { communityId: string, communityAdmin: string }) {
    const user: User = useAppSelector(state => state.user);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const hasJoined: boolean = user.userCommunities?.includes(communityId) || false;
    const isAdmin: boolean = user.userUID === communityAdmin;

    async function handleJoin() {
        try {
            await Promise.all([
                updateDoc(doc(db, 'users', String(user.userUID)), {
                    userCommunities: arrayUnion(communityId),
                }),
                updateDoc(doc(db, 'communities', communityId), {
                    communityMembers: arrayUnion(user.userUID),
                }),
            ]);

            dispatch(setUser({
                ...user,
                userCommunities: [...user.userCommunities, communityId],
            }));

            router.refresh();
        } catch (error) {
            console.error("Error Joining Community:", error);
        }
    }

    async function handleLeave() {
        try {
            await Promise.all([
                updateDoc(doc(db, 'users', String(user.userUID)), {
                    userCommunities: arrayRemove(communityId),
                }),
                updateDoc(doc(db, 'communities', communityId), {
                    communityMembers: arrayRemove(user.userUID),
                }),
            ]);

            dispatch(setUser({
                ...user,
                userCommunities: user.userCommunities.filter(community => community !== communityId),
            }));

            router.refresh();
        } catch (error) {
            console.error("Error Leaving Community:", error);
        }
    }

    async function handleDelete() {
        try {
            await Promise.all([
                updateDoc(doc(db, 'users', String(user.userUID)), {
                    userCommunities: arrayRemove(communityId),
                }),
                deleteDoc(doc(db, 'communities', communityId)),
            ]);

            dispatch(setUser({
                ...user,
                userCommunities: user.userCommunities.filter(community => community !== communityId),
            }));

            router.refresh();
        } catch (error) {
            console.error("Error Deleting Community:", error);
        }
    }

    return (
        <>
            {hasJoined ?
                <>
                    {isAdmin ?
                        <button onClick={handleDelete} className='bg-red-500 px-4 py-2 rounded text-sm  w-1/2 hover:bg-red-600 transition-colors'>Delete Community</button>
                        :
                        <button onClick={handleLeave} className='border border-dark-700 px-4 py-2 rounded text-sm w-1/2 hover:bg-dark-500 transition-colors'>Leave Community </button>
                    }
                </>
                :
                <button onClick={handleJoin} className='bg-brand-500 px-6 py-2 rounded text-sm w-1/2 hover:bg-brand-600 transition-colors'>Join Community</button>
            }
        </>
    );
}