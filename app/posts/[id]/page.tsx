'use client'

import getCommunitiesData from '@/components/helpers/fetchCommunityData';
import getPostsData from '@/components/helpers/fetchPostData';
import getUserData from '@/components/helpers/fetchUserData';
import { useAppSelector } from '@/redux/hooks';
import { Community, Post, User, Comment } from '@/types';
import Image from 'next/image';
import React, { useEffect, useState, useCallback } from 'react';
import Moment from 'react-moment';
import Link from 'next/link';
import { arrayRemove, arrayUnion, doc, updateDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { CommentInput, CommentDisplay } from '@/components/ui-elements/CommentInputComponent';

export default function PostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentActive, setIsCommentActive] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);

  const currentUser: User = useAppSelector(state => state.user);

  // Fetch post data
  const fetchPostData = useCallback(async () => {
    setIsLoading(true);
    try {
      const postData = await getPostsData(params.id);
      setPost(postData);

      // Fetch related data
      if (postData) {
        const [userData, communityData] = await Promise.all([
          getUserData(postData.postAuthorId),
          postData.postCommunityId ? getCommunitiesData(postData.postCommunityId) : null
        ]);

        setUser(userData);
        setCommunity(communityData);
      }
    } catch (error) {
      console.error("Failed to fetch post data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  // Set up real-time comments listener
  useEffect(() => {
    if (!post?.postUID) return;

    setIsCommentsLoading(true);

    // Query for top-level comments only (no parentCommentId)
    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', post.postUID),
      where('parentCommentId', '==', null),
      orderBy('commentCreatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          commentCreatedAt: data.commentCreatedAt.toDate(),
        } as Comment;
      });
      setComments(fetchedComments);
      setIsCommentsLoading(false);
    }, (error) => {
      console.error("Error fetching comments:", error);
      setIsCommentsLoading(false);
    });

    return () => unsubscribe();
  }, [post?.postUID]);

  useEffect(() => {
    fetchPostData();
  }, [fetchPostData]);

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

  const refreshComments = useCallback(() => {
    // This will trigger the onSnapshot listener to fetch updated comments
    // No need to manually fetch as the listener will handle it
  }, []);

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
      <div className="w-full md:w-3/4 border-r border-dark-700 p-4 overflow-y-scroll no-scrollbar">
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

            <button
              className="mr-6 flex items-center space-x-1 group"
              onClick={() => setIsCommentActive(true)}
            >
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

        <div className="mt-4">
          <CommentInput
            postId={post.postUID}
            onCommentPost={refreshComments}
          />

          {isCommentsLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : comments.length > 0 ? (
            <div className="mt-4 space-y-4">
              {comments.map(comment => (
                <CommentDisplay
                  key={comment.commentUID}
                  comment={comment}
                  onUpdate={refreshComments}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white-800">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </div>

      <div className="hidden md:block w-1/4 p-4">
      </div>
    </div>
  );
}