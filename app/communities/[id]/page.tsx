'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { User, Post as PostType, Community } from '@/types';
import PostInput from '@/components/ui-elements/PostInput';
import Post from '@/components/ui-elements/Post';

interface ProfilePageState {
    user: User | null;
    posts: PostType[];
    communities: Community[];
    loading: boolean;
    error: string | null;
}

export default function ProfilePage({ params }: { params: { id: string } }) {
    const [state, setState] = useState<ProfilePageState>({
        user: null,
        posts: [],
        communities: [],
        loading: true,
        error: null
    });
    const [activeTab, setActiveTab] = useState<'posts' | 'communities'>('posts');

    useEffect(() => {
        async function fetchProfileData() {
            setState(prev => ({ ...prev, loading: true, error: null }));

            try {
                const response = await fetch(`/api/profile/${params.id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch profile data');
                }

                setState({
                    user: data.user,
                    posts: data.posts,
                    communities: data.communities,
                    loading: false,
                    error: null
                });
            } catch (error) {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: error instanceof Error ? error.message : 'An error occurred'
                }));
            }
        }

        fetchProfileData();
    }, [params.id]);

    const handlePostCreated = (newPost: PostType) => {
        setState(prev => ({
            ...prev,
            posts: [newPost, ...prev.posts]
        }));
    };

    if (state.loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (state.error || !state.user) {
        return <div className="flex justify-center items-center h-screen">
            {state.error || 'User not found'}
        </div>;
    }

    return (
        <div className="h-screen flex flex-col">
            <div className="relative">
                <Image
                    src={state.user.userProfileBannerSrc || '/assets/placeholder-images/profile-banner.jpg'}
                    width={1200}
                    height={400}
                    alt=""
                    className="w-full h-[240px] object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-1/2">
                    <Image
                        src={state.user.userProfilePictureSrc}
                        width={120}
                        height={120}
                        alt=""
                        className="rounded-full border-4 border-dark-900"
                    />
                </div>
            </div>

            <div className="mt-24 px-4">
                <h1 className="text-2xl font-bold">
                    {state.user.userFirstName} {state.user.userLastName}
                </h1>
                <p className="text-gray-400">@{state.user.userID}</p>
                <p className="mt-2">{state.user.userBio}</p>

                <div className="flex mt-4 border-b border-dark-700">
                    <button
                        className={`px-4 py-2 ${activeTab === 'posts' ? 'border-b-2 border-brand-500' : ''}`}
                        onClick={() => setActiveTab('posts')}
                    >
                        Posts ({state.posts.length})
                    </button>
                    <button
                        className={`px-4 py-2 ${activeTab === 'communities' ? 'border-b-2 border-brand-500' : ''}`}
                        onClick={() => setActiveTab('communities')}
                    >
                        Communities ({state.communities.length})
                    </button>
                </div>

                <div className="mt-4">
                    {activeTab === 'posts' && (
                        <div className="space-y-4">
                            <PostInput
                                inputPlaceholder="What's on your mind?"
                                onPostCreated={handlePostCreated}
                            />
                            {state.posts.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    No posts yet
                                </div>
                            ) : (
                                state.posts.map(post => (
                                    <Post key={post.postUID} post={post} />
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'communities' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {state.communities.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 col-span-full">
                                    Not a member of any communities yet
                                </div>
                            ) : (
                                state.communities.map(community => (
                                    <div key={community.communityUID} className="bg-dark-800 rounded-lg p-4">
                                        <Image
                                            src={community.communityProfileSrc}
                                            width={64}
                                            height={64}
                                            alt=""
                                            className="rounded-full"
                                        />
                                        <h3 className="mt-2 font-semibold">{community.communityName}</h3>
                                        <p className="text-sm text-gray-400">
                                            {community.communityMembers.length} members
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}