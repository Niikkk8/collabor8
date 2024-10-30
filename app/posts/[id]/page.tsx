'use client'

import getCommunitiesData from '@/components/helpers/fetchCommunityData';
import getPostsData from '@/components/helpers/fetchPostData';
import getUserData from '@/components/helpers/fetchUserData';
import { useAppSelector } from '@/redux/hooks';
import { Community, Post, User } from '@/types';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Moment from 'react-moment';
import Link from 'next/link';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export default function PostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser: User = useAppSelector(state => state.user);

  useEffect(() => {
    async function fetchPostData() {
      setIsLoading(true);
      try {
        const postData = await getPostsData(params.id);
        setPost(postData);
      } catch (error) {
        console.error("Failed to fetch post data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPostData();
  }, [params.id]);

  useEffect(() => {
    if (!post) return;

    const fetchData = async () => {
      try {
        const userData = await getUserData(post.postAuthorId);
        setUser(userData);

        if (post.postCommunityId) {
          const communityData = await getCommunitiesData(post.postCommunityId);
          setCommunity(communityData);
        }
      } catch (error) {
        console.error("Error fetching related data:", error);
      }
    };

    fetchData();
  }, [post]);

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!post || !currentUser) return;

    const isCurrentlyLiked = post.postLikes.includes(currentUser.userUID);

    try {
      const postRef = doc(db, 'posts', String(post.postUID));

      await updateDoc(postRef, {
        postLikes: isCurrentlyLiked
          ? arrayRemove(currentUser.userUID)
          : arrayUnion(currentUser.userUID)
      });

      setPost(prevPost => {
        if (!prevPost) return null;

        const updatedLikes = isCurrentlyLiked
          ? prevPost.postLikes.filter(like => like !== currentUser.userUID)
          : [...prevPost.postLikes, currentUser.userUID];

        return {
          ...prevPost,
          postLikes: updatedLikes
        };
      });
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Post not found</div>
      </div>
    );
  }

  const isLiked = post.postLikes.includes(currentUser.userUID);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-3/4 border-r border-dark-700 p-4 overflow-y-scroll no-scrollbar">
        <div className="flex justify-between items-start">
          <div className="flex">
            {user && (
              <div className="w-12 h-12 relative">
                <Image
                  src={user.userProfilePictureSrc}
                  alt={`${user.userFirstName} ${user.userLastName}`}
                  layout="fill"
                  className="object-cover rounded-full"
                />
              </div>
            )}
            <div className="ml-3">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">
                    {user?.userFirstName} {user?.userLastName}
                  </h3>
                  <p className="text-sm font-light text-white-800">@{user?.userID}</p>
                  <span className="h-[2px] w-[2px] bg-white-800" />
                  <Moment fromNow className="text-white-800 text-sm">
                    {post.postCreatedAt}
                  </Moment>
                </div>
                {community && (
                  <div className="flex items-center space-x-2">
                    <p className="text-white-800 text-sm">posted on</p>
                    <Link
                      href={`/communities/${post.postCommunityId}`}
                      className="underline text-sm hover:text-white-600 transition-colors"
                    >
                      {community.communityName}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button className="hover:bg-dark-700 p-2 rounded-full transition-colors">
            <Image
              src="/assets/svgs/post-verticalellipsis.svg"
              alt="Post options"
              width={12}
              height={12}
            />
          </button>
        </div>

        <p className={`text-sm mt-2 ${!post.postImageSrc && 'border-b border-dark-700 pb-2'}`}>
          {post.postContent}
        </p>
        {post.postImageSrc && (
          <div className="py-4 border-b border-dark-700">
            <img
              src={post.postImageSrc}
              alt="Post image"
              className="w-auto h-auto object-contain rounded-lg"
            />
          </div>
        )}

        <div className="flex justify-between mt-3">
          <div className="flex">
            <button
              onClick={handleLikeToggle}
              className="mr-6 flex items-center space-x-1 group"
            >
              <div className="transition-transform group-hover:scale-110">
                <Image
                  src={isLiked ? "/assets/svgs/post-liked.svg" : "/assets/svgs/post-like.svg"}
                  alt="Like"
                  width={20}
                  height={20}
                  className="transition-opacity"
                />
              </div>
              <p className="text-sm ml-1">{post.postLikes.length}</p>
            </button>

            <button className="mr-6 flex items-center space-x-1 group">
              <div className="transition-transform group-hover:scale-110">
                <Image
                  src="/assets/svgs/post-comment.svg"
                  alt="Comment"
                  width={20}
                  height={20}
                />
              </div>
              <p className="text-sm ml-1">{post.postComments.length}</p>
            </button>

            <button className="mr-6 group">
              <div className="transition-transform group-hover:scale-110">
                <Image
                  src="/assets/svgs/post-repost.svg"
                  alt="Repost"
                  width={20}
                  height={20}
                />
              </div>
            </button>

            <button className="mr-6 group">
              <div className="transition-transform group-hover:scale-110">
                <Image
                  src="/assets/svgs/post-share.svg"
                  alt="Share"
                  width={20}
                  height={20}
                />
              </div>
            </button>
          </div>

          <button className="mr-4 group">
            <div className="transition-transform group-hover:scale-110">
              <Image
                src="/assets/svgs/post-save.svg"
                alt="Save"
                width={20}
                height={20}
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}