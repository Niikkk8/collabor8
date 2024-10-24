// import Post from '@/components/ui-elements/Post';
import CommunityActionButton from '@/components/communities/CommunityActionButton';
import PostInput from '@/components/ui-elements/PostInput'
import ProfileInfo from '@/components/ui-elements/ProfileInfo';
import { db } from '@/firebase';
import { Community, User } from '@/types';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import React from 'react'

async function getCommunityData(id: string): Promise<Community | null> {
    const communityDocRef = doc(db, 'communities', id);
    const communityDoc = await getDoc(communityDocRef);
    if (!communityDoc.exists) {
        return null;
    }
    return communityDoc.data() as Community;
}

async function getAdminData(id: string): Promise<User | null> {
    const userDocRef = doc(db, 'users', id);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists) {
        return null;
    }
    return userDoc.data() as User;
}

export default async function page({ params }: { params: { id: string } }) {
    const community = await getCommunityData(params.id);
    const adminData = await getAdminData(community!.communityAdmin)
    console.log(community)

    if (!community) {
        return <div>Community not found</div>;
    }

    return (
        <div className='flex h-screen'>
            <div className='p-6 w-3/4 border-r border-dark-700 overflow-y-scroll no-scrollbar'>
                <PostInput inputPlaceholder='Make a post in this community!' communityId={params.id} />
                <div className="flex items-center p-2 mt-4 min-w-fit">
                    <span className="text-sm text-white-800">Sort By: </span>
                    <p className="flex items-center text-sm ml-2">
                        New
                        <Image src="/assets/svgs/searchbar-dropdown.svg" alt="" width={14} height={14} className="ml-1" />
                    </p>
                    <div className="flex-grow ml-2 h-[1px] bg-dark-700" />
                </div>
                <div className="mt-4">
                    {/* {posts.map((post, index) => (
                        <Post post={post} key={index} />
                    ))} */}
                </div>
            </div>
            <div className='w-1/4 overflow-scroll no-scrollbar'>
                <Image src={community.communityBannerSrc} width={400} height={400} alt='' className='w-[540px] h-[240px] object-cover' />
                <div className='mt-[-76px] p-4 border-b border-dark-700'>
                    <div className='flex justify-between items-center'>
                        <Image src={community.communityProfileSrc} width={120} height={120} alt='' className='object-cover rounded-full border-4 border-dark-900' />
                        <Image src={'/assets/svgs/community-ellipsis.svg'} width={28} height={28} alt='' className='mt-8' />
                    </div>
                    <div className='mt-4 flex justify-between items-center'>
                        <h1 className='text-lg font-semibold w-1/2 truncate'>{community.communityName}</h1>
                        <CommunityActionButton communityId={community.communityUID} communityAdmin={community.communityAdmin} />
                    </div>
                    <div className='bg-dark-800 mt-4 py-2 px-4 rounded'>
                        <p className='text-sm'>{community.communityMembers.length} members</p>

                    </div>
                    <p className='text-sm my-6'>{community.communityDescription}</p>
                </div>
                <div className='p-4'>
                    <h1 className='font-medium'>Admin</h1>
                    <ProfileInfo user={adminData!} />
                </div>
            </div>
        </div>
    )
}