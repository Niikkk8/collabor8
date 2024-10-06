import Image from 'next/image';
import React from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { User } from '@/types';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileActionButton from '@/components/profile/ProfileActionButton';

async function getUserData(id: string): Promise<User | null> {
    const userDocRef = doc(db, 'users', id); // Adjust the collection name if needed
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
                            <ProfileActionButton id={params.id} />
                        </div>
                    </div>
                    <div className='px-4'>
                        <h2 className='text-xl font-medium'>{user.userFirstName} {user.userLastName}</h2>
                        <h3 className='text-sm text-white-800'>@{user.userID}</h3>
                        <p className='mt-4'>{user.userBio || 'No Bio Added'}</p>
                        <p className='mt-4 text-white-800 bg-dark-800 flex items-center rounded-full w-fit px-4 py-2 text-sm'>
                            <Image src='/assets/svgs/profile-calendar.svg' height={18} width={18} alt='' className='mr-2' />
                            Joined {formattedJoiningDate}
                        </p>
                        <div className='flex items-center mt-4'>
                            <p className='text-sm mr-4'>
                                {user.userFollowers.length} <span className='ml-[2px] text-white-800 text-xs'>Followers</span>
                            </p>
                            <p className='text-sm mr-4'>
                                {user.userFollowing.length} <span className='ml-[2px] text-white-800 text-xs'>Following</span>
                            </p>
                            <p className='text-sm mr-4'>
                                {user.userPosts.length} <span className='ml-[2px] text-white-800 text-xs'>Posts</span>
                            </p>
                            <p className='text-sm mr-4'>
                                {user.userCommunities.length} <span className='ml-[2px] text-white-800 text-xs'>Communities</span>
                            </p>
                        </div>
                    </div>
                    <div className='mt-4'>
                        <ProfileTabs id={params.id} />
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
