"use client";

import { useAppSelector } from '@/redux/hooks';
import { User } from '@/types';
import Image from 'next/image';
import React from 'react';

export default function ProfileLayout({
    children
}: {
    children: React.ReactNode
}) {
    const user: User = useAppSelector((state) => state.user);

    // Format the userJoiningDate to a readable format
    const formattedJoiningDate = user.userJoiningDate
        ? new Date(user.userJoiningDate).toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Unknown Date';

    return (
        <div className='flex'>
            <div className='w-3/4 h-screen overflow-scroll no-scrollbar border-r border-dark-700'>
                <div className='p-4'>
                    <Image src={'/assets/placeholder-images/profile-banner.jpeg'} height={400} width={800} alt='' className='w-full h-[200px] object-cover rounded' />
                    <div className='mt-[-72px]'>
                        <div className='flex justify-between px-4 mb-6'>
                            <Image
                                src={'/assets/placeholder-images/profile-picture.jpg'}
                                alt=''
                                width={160}
                                height={160}
                                className='object-cover rounded-full aspect-square border-4 border-dark-900'
                            />
                            <button className='mt-24 mr-4 border border-white-800 h-fit text-sm py-2 px-4 rounded-lg'>Edit Profile</button>
                        </div>
                    </div>
                    <div className='px-4'>
                        <h2 className='text-xl font-medium'>{user.userFirstName ? (user.userFirstName + " " + user.userLastName) : 'Niket Shah'}</h2>
                        <h3 className='text-sm text-white-800'>@{user.userID ? user.userID : 'nik8'}</h3>
                        <p className='mt-4'>{user.userBio || "No Bio Added"}</p>
                        <p className='mt-4 text-white-800 bg-dark-800 flex items-center rounded-full w-fit px-4 py-2 text-sm'>
                            <Image src='/assets/svgs/profile-calendar.svg' height={18} width={18} alt='' className='mr-2' />
                            Joined {formattedJoiningDate}
                        </p>
                        <div className='flex items-center mt-4'>
                            <p className='text-sm mr-4'>
                                {user.userFollowers ? user.userFollowers.length : '0'} <span className='ml-[2px] text-white-800 text-xs'>Followers</span>
                            </p>
                            <p className='text-sm mr-4'>
                                {user.userFollowing ? user.userFollowing.length : '0'} <span className='ml-[2px] text-white-800 text-xs'>Following</span>
                            </p>
                            <p className='text-sm mr-4'>
                                {user.userPosts ? user.userPosts.length : '0'} <span className='ml-[2px] text-white-800 text-xs'>Posts</span>
                            </p>
                            <p className='text-sm mr-4'>
                                {user.userCommunities ? user.userCommunities.length : '0'} <span className='ml-[2px] text-white-800 text-xs'>Communities</span>
                            </p>
                        </div>
                    </div>
                    <div className='mt-4'>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
