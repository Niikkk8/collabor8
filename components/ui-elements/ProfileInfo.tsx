import React from 'react';
import Image from 'next/image';
import { User } from '@/types';

export default function ProfileInfo({ user }: { user: User }) {

    return (
        <div className='bg-dark-800 p-4 mt-2 rounded-lg'>
            <div className='flex items-center'>
                <Image
                    src={user.userProfilePictureSrc || '/assets/placeholder-images/profile-picture.jpg'}
                    alt=''
                    width={56}
                    height={56}
                    className='object-cover rounded-full aspect-square'
                />
                <div className='ml-4'>
                    <h2 className='font-medium leading-5'>{user.userFirstName + " " + user.userLastName}</h2>
                    <p className='text-white-800 text-xs'>@{user.userID}</p>
                </div>
            </div>
            <div className='flex justify-between'>
                <div className='flex flex-col items-center mt-4 mx-1'>
                    <h3 className='font-semibold text-sm leading-4'>{user.userFollowers.length}</h3>
                    <p className='text-sm font-medium text-white-800'>Followers</p>
                </div>
                <div className='flex flex-col items-center mt-4 mx-1'>
                    <h3 className='font-semibold text-sm leading-4'>{user.userFollowing.length}</h3>
                    <p className='text-sm font-medium text-white-800'>Following</p>
                </div>
                <div className='flex flex-col items-center mt-4 mx-1'>
                    <h3 className='font-semibold text-sm leading-4'>{user.userPosts.length}</h3>
                    <p className='text-sm font-medium text-white-800'>Posts</p>
                </div>
                <div className='flex flex-col items-center mt-4 mx-1'>
                    <h3 className='font-semibold text-sm leading-4'>{user.userCommunities.length}</h3>
                    <p className='text-sm font-medium text-white-800'>Communities</p>
                </div>
            </div>
        </div>
    )
}
