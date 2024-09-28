import React from 'react';
import Image from 'next/image';
import { useAppSelector } from '@/redux/hooks';
import { User } from '@/types';

export default function ProfileInfo() {
    const user: User = useAppSelector((state) => state.user);

    return (
        <div className='bg-dark-800 p-4 mt-2 rounded-lg'>
            <div className='flex items-center'>
                <Image
                    src={'/assets/placeholder-images/profile-picture.jpg'}
                    alt=''
                    width={56}
                    height={56}
                    className='object-cover rounded-full aspect-square'
                />
                <div className='ml-4'>
                    <h2 className='font-medium leading-5'>{user.userFirstName ? (user.userFirstName + " " + user.userLastName) : 'Niket Shah'}</h2>
                    <p className='text-white-800 text-xs'>@{user.userID ? user.userID : 'nik8'}</p>
                </div>
            </div>
            <div className='flex justify-between'>
                <div className='flex flex-col items-center mt-4'>
                    <h3 className='font-semibold text-sm leading-4'>{user.userFollowers ? user.userFollowers.length : '0'}</h3>
                    <p className='text-sm font-medium text-white-800'>Followers</p>
                </div>
                <div className='flex flex-col items-center mt-4'>
                    <h3 className='font-semibold text-sm leading-4'>{user.userFollowing ? user.userFollowing.length : '0'}</h3>
                    <p className='text-sm font-medium text-white-800'>Following</p>
                </div>
                <div className='flex flex-col items-center mt-4'>
                    <h3 className='font-semibold text-sm leading-4'>{user.userPosts ? user.userPosts.length : '0'}</h3>
                    <p className='text-sm font-medium text-white-800'>Posts</p>
                </div>
                <div className='flex flex-col items-center mt-4'>
                    <h3 className='font-semibold text-sm leading-4'>{user.userCommunities ? user.userCommunities.length : '0'}</h3>
                    <p className='text-sm font-medium text-white-800'>Communities</p>
                </div>
            </div>
        </div>
    )
}
