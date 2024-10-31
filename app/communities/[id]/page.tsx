'use client';

import CommunityActionButton from '@/components/communities/CommunityActionButton';
import PostInput from '@/components/ui-elements/PostInput';
import Post from '@/components/ui-elements/Post';
import ProfileInfo from '@/components/ui-elements/ProfileInfo';
import { db } from '@/firebase';
import { Community, User, Post as PostType } from '@/types';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import getCommunitiesData from '@/components/helpers/fetchCommunityData';

async function getAdminData(id: string): Promise<User | null> {
    const userDocRef = doc(db, 'users', id);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? (userDoc.data() as User) : null;
}

async function getCommunityPosts(communityId: string): Promise<PostType[]> {
    const postsQuery = query(
        collection(db, 'posts'),
        where('postCommunityId', '==', communityId)
    );

    const postsSnapshot = await getDocs(postsQuery);
    return postsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            postUID: doc.id,
            postContent: data.postContent,
            postImageSrc: data.postImageSrc,
            postCreatedAt: data.postCreatedAt.toDate(),
            postAuthorId: data.postAuthorId,
            postAuthorName: data.postAuthorName,
            postCommunityId: data.postCommunityId,
            postLikes: data.postLikes || [],
            postComments: data.postComments || [],
        } as PostType;
    }).sort((a, b) => b.postCreatedAt.getTime() - a.postCreatedAt.getTime());
}

export default function Page({ params }: { params: { id: string } }) {
    const [community, setCommunity] = useState<Community | null>(null);
    const [adminData, setAdminData] = useState<User | null>(null);
    const [posts, setPosts] = useState<PostType[]>([]);

    useEffect(() => {
        async function fetchData() {
            const communityData = await getCommunitiesData(params.id);
            if (communityData) {
                setCommunity(communityData);
                const [admin, communityPosts] = await Promise.all([
                    getAdminData(communityData.communityAdmin),
                    getCommunityPosts(params.id),
                ]);
                setAdminData(admin);
                setPosts(communityPosts);
            }
        }
        fetchData();
    }, [params.id]);

    if (!community) return <div>Community not found</div>;

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
                <div className="mt-4 space-y-4">
                    {posts.length === 0 ? (
                        <div className="flex justify-center items-center p-8 text-white-800">
                            No posts in this community yet
                        </div>
                    ) : (
                        posts.map((post) => (
                            <Post key={post.postUID} post={post} />
                        ))
                    )}
                </div>
            </div>
            <div className='w-1/4 overflow-scroll no-scrollbar'>
                <Image src={community.communityBannerSrc} width={400} height={400} alt='' className='w-[540px] h-[240px] object-cover aspect-[27/12]' />
                <div className='mt-[-68px] p-4 border-b border-dark-700'>
                    <div className='flex justify-between items-center'>
                        <Image src={community.communityProfileSrc} width={120} height={120} alt='' className='object-cover aspect-square rounded-full border-4 border-dark-900' />
                        {/* <Image src={'/assets/svgs/community-ellipsis.svg'} width={28} height={28} alt='' className='mt-8' /> */}
                    </div>
                    <div className='mt-4 flex justify-between items-center'>
                        <h1 className='text-lg font-semibold w-1/2 truncate'>{community.communityName}</h1>
                        <CommunityActionButton communityId={params.id} communityAdmin={community.communityAdmin} />
                    </div>
                    <div className='bg-dark-800 mt-4 py-2 px-4 rounded'>
                        <p className='text-sm'>{community.communityMembers.length} members</p>
                    </div>
                    <p className='text-sm my-6'>{community.communityDescription}</p>
                </div>
                <div className='p-4'>
                    <h1 className='font-medium'>Admin</h1>
                    {adminData && <ProfileInfo user={adminData} />}
                </div>
            </div>
        </div>
    );
}
