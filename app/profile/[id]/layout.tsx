import Image from 'next/image';
import React from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { User } from '@/types';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileActionButton from '@/components/profile/ProfileActionButton';

async function getUserData(id: string): Promise<User | null> {
    const userDocRef = doc(db, 'users', id);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists) {
        return null;
    }
    return userDoc.data() as User;
}

export default async function ProfileLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { id: string };
}) {
    const user = await getUserData(params.id);

    if (!user) {
        return <div>User not found</div>;
    }

    const formattedJoiningDate = user.userJoiningDate
        ? new Date(
            (user.userJoiningDate as any).toDate
                ? (user.userJoiningDate as any).toDate()
                : user.userJoiningDate
        ).toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'long'
        })
        : 'Unknown Date';

    return (
        <div className='flex'>
            <div className='w-full h-screen overflow-scroll no-scrollbar border-r border-dark-700'>
                <div className='p-2 sm:p-4'>
                    <Image
                        src={user.userProfileBannerSrc}
                        height={400}
                        width={800}
                        alt=''
                        className='w-full h-[120px] sm:h-[200px] object-cover rounded'
                    />
                    <div className='mt-[-48px] sm:mt-[-72px]'>
                        <div className='flex flex-col sm:flex-row justify-between px-2 sm:px-4 mb-4 sm:mb-6'>
                            <Image
                                src={user.userProfilePictureSrc}
                                alt=''
                                width={160}
                                height={160}
                                className='w-24 h-24 sm:w-36 sm:h-36 object-cover rounded-full aspect-square border-4 border-dark-900'
                            />
                            <ProfileActionButton id={params.id} />
                        </div>
                    </div>
                    <div className='px-2 sm:px-4'>
                        <h2 className='text-lg sm:text-xl font-medium'>{user.userFirstName} {user.userLastName}</h2>
                        <h3 className='text-sm text-white-800'>@{user.userID}</h3>
                        <p className='mt-3 sm:mt-4 text-sm sm:text-base'>{user.userBio || 'No Bio Added'}</p>
                        <p className='mt-3 sm:mt-4 text-white-800 bg-dark-800 flex items-center rounded-full w-fit px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm'>
                            <Image src='/assets/svgs/profile-calendar.svg' height={18} width={18} alt='' className='mr-2 w-4 h-4 sm:w-[18px] sm:h-[18px]' />
                            Joined {formattedJoiningDate}
                        </p>
                        <div className='flex flex-wrap items-center gap-y-2 mt-3 sm:mt-4'>
                            <p className='text-xs sm:text-sm mr-4'>
                                {user.userFollowers.length} <span className='ml-[2px] text-white-800 text-[10px] sm:text-xs'>Followers</span>
                            </p>
                            <p className='text-xs sm:text-sm mr-4'>
                                {user.userFollowing.length} <span className='ml-[2px] text-white-800 text-[10px] sm:text-xs'>Following</span>
                            </p>
                            <p className='text-xs sm:text-sm mr-4'>
                                {user.userPosts.length} <span className='ml-[2px] text-white-800 text-[10px] sm:text-xs'>Posts</span>
                            </p>
                            <p className='text-xs sm:text-sm mr-4'>
                                {user.userCommunities.length} <span className='ml-[2px] text-white-800 text-[10px] sm:text-xs'>Communities</span>
                            </p>
                        </div>
                    </div>
                    <div className='mt-4'>
                        <ProfileTabs id={params.id} />
                        {children}
                    </div>
                </div>
            </div>
            <div className='hidden lg:block w-1/4' />
        </div>
    );
}