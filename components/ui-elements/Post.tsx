import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Community, Post as PostType, User } from '@/types';
import getUserData from '../helpers/fetchUserData';
import Moment from 'react-moment';
import getCommunitiesData from '../helpers/fetchCommunityData';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAppSelector } from '@/redux/hooks';

export default function Post({ post }: { post: PostType }) {
  const [user, setUser] = useState<User | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [postComponent, setPost] = useState<PostType>(post);
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const currentUser: User = useAppSelector((state) => state.user);
  const hasLiked: boolean = postComponent.postLikes.includes(currentUser.userUID);

  useEffect(() => {
    const fetchUser = async () => {
      const fetchedUser = await getUserData(post.postAuthorId);
      setUser(fetchedUser);
    };

    const fetchCommunity = async () => {
      if (post.postCommunityId) {
        const fetchedCommunity = await getCommunitiesData(post.postCommunityId);
        setCommunity(fetchedCommunity);
      }
    };

    fetchUser();
    fetchCommunity();
  }, [post.postAuthorId, post.postCommunityId]);

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!postComponent || !currentUser) return;

    try {
      await updateDoc(doc(db, 'posts', String(postComponent.postUID)), {
        postLikes: arrayUnion(currentUser.userUID),
      });

      setPost((prevPost) =>
        prevPost ? { ...prevPost, postLikes: [...prevPost.postLikes, currentUser.userUID] } : prevPost
      );
    } catch (error) {
      console.error("Error Liking Post:", error);
    }
  }

  async function removeLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!postComponent || !currentUser) return;

    try {
      await updateDoc(doc(db, 'posts', String(postComponent.postUID)), {
        postLikes: arrayRemove(currentUser.userUID),
      });

      setPost((prevPost) =>
        prevPost ? {
          ...prevPost,
          postLikes: prevPost.postLikes.filter(like => like !== currentUser.userUID)
        } : prevPost
      );
    } catch (error) {
      console.error("Error Liking Post:", error);
    }
  }

  const ActionButton = ({
    icon,
    activeIcon,
    label,
    count,
    isActive,
    onClick
  }: {
    icon: string;
    activeIcon?: string;
    label: string;
    count?: number;
    isActive?: boolean;
    onClick?: (e: React.MouseEvent) => void;
  }) => (
    <button
      className="mr-2 sm:mr-6 flex items-center space-x-1 group relative"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(label)}
      onMouseLeave={() => setIsHovered(null)}
    >
      <div className="transition-transform duration-200 group-hover:scale-110">
        <Image
          src={isActive && activeIcon ? activeIcon : icon}
          alt={label}
          width={16}
          height={16}
          className={`transition-all duration-200 sm:w-5 sm:h-5 ${isActive ? 'scale-105' : ''}`}
        />
      </div>
      {count !== undefined && (
        <p className={`text-xs sm:text-sm ml-1 transition-colors duration-200 
          ${isActive ? 'text-blue-500' : 'text-white-800'} 
          ${isHovered === label ? 'text-white' : ''}`}
        >
          {count}
        </p>
      )}
      {isHovered === label && (
        <div className="hidden sm:block absolute -top-8 left-1/2 transform -translate-x-1/2 bg-dark-700 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
          {label}
        </div>
      )}
    </button>
  );

  const PostContent = () => (
    <div className="p-3 sm:p-4 my-2 border border-dark-700 rounded bg-dark-800 transition-colors duration-200 hover:bg-dark-750">
      <div className="flex justify-between items-start">
        <div className="flex flex-grow">
          {user && (
            <div className="w-10 h-10 sm:w-12 sm:h-12 relative group flex-shrink-0">
              <Image
                src={user.userProfilePictureSrc}
                alt={`${user.userFirstName} ${user.userLastName}`}
                layout="fill"
                className="object-cover rounded-full transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          )}
          <div className="ml-2 sm:ml-3 min-w-0">
            <div className="flex flex-col">
              <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                <h3 className="font-medium hover:underline cursor-pointer text-sm sm:text-base truncate">
                  {user?.userFirstName} {user?.userLastName}
                </h3>
                <p className="text-xs sm:text-sm font-light text-white-800 hover:text-white transition-colors duration-200 truncate">
                  @{user?.userID}
                </p>
                <span className="hidden sm:block h-[2px] w-[2px] bg-white-800" />
                <Moment fromNow className="text-white-800 text-xs sm:text-sm hover:text-white transition-colors duration-200">
                  {postComponent.postCreatedAt}
                </Moment>
              </div>
              {community && (
                <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                  <p className="text-white-800 text-xs sm:text-sm">posted on</p>
                  <Link
                    href={`/communities/${postComponent.postCommunityId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="underline text-xs sm:text-sm hover:text-white transition-colors duration-200 truncate"
                  >
                    {community.communityName}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        <button className="p-1 sm:p-2 rounded-full transition-colors duration-200 hover:bg-dark-700 ml-2 flex-shrink-0">
          <Image
            src="/assets/svgs/post-verticalellipsis.svg"
            alt="Post options"
            width={10}
            height={10}
            className="sm:w-3 sm:h-3"
          />
        </button>
      </div>
      <p className="text-xs sm:text-sm mt-2">
        {postComponent.postContent}
      </p>
      {postComponent.postImageSrc && (
        <div className="py-2 sm:py-4 border-b border-dark-700">
          <img
            src={postComponent.postImageSrc}
            alt=""
            className="object-contain rounded-lg transition-transform duration-200 hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="flex justify-between mt-2 sm:mt-3">
        <div className="flex">
          <ActionButton
            icon="/assets/svgs/post-like.svg"
            activeIcon="/assets/svgs/post-liked.svg"
            label="Like"
            count={postComponent.postLikes.length}
            isActive={hasLiked}
            onClick={hasLiked ? removeLike : handleLike}
          />
          <ActionButton
            icon="/assets/svgs/post-comment.svg"
            label="Comment"
            count={postComponent.postComments.length}
          />
          <ActionButton
            icon="/assets/svgs/post-repost.svg"
            label="Repost"
          />
          <ActionButton
            icon="/assets/svgs/post-share.svg"
            label="Share"
          />
        </div>
        <ActionButton
          icon="/assets/svgs/post-save.svg"
          label="Save"
        />
      </div>
    </div>
  );

  return (
    <Link href={`/posts/${postComponent.postUID}`}>
      <PostContent />
    </Link>
  );
}