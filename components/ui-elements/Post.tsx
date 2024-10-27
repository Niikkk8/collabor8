import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Community, Post as PostType, User } from '@/types';
import getUserData from '../helpers/fetchUserData';
import Moment from 'react-moment';
import getCommunitiesData from '../helpers/fetchCommunityData';

export default function Post({ post }: { post: PostType }) {
  const [user, setUser] = useState<User | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const fetchedUser = await getUserData(post.postAuthorId);
      setUser(fetchedUser);
    };

    const fetchCommuniy = async () => {
      const fetchedCommunity = await getCommunitiesData(post.postCommunityId!)
      setCommunity(fetchedCommunity)
    }

    if (post.postCommunityId) {
      fetchCommuniy()
    }
    fetchUser();
  }, [post.postAuthorId]);

  return (
    <Link href={`/posts/${post.postUID}`}>
      <div className='p-4 my-2 border border-dark-700 rounded bg-dark-800'>
        <div className='flex justify-between items-start'>
          <div className='flex'>
            {user && (
              <div className='w-12 h-12 relative'>
                <Image src={user.userProfilePictureSrc} alt={`${user.userFirstName} ${user.userLastName}`} layout="fill" className='object-cover rounded-full' />
              </div>
            )}
            <div className='ml-3'>
              <div className='flex flex-col'>
                <div className='flex items-center space-x-2'>
                  <h3 className='font-medium'>{user?.userFirstName} {user?.userLastName}</h3>
                  <p className='text-sm font-light text-white-800'>@{user?.userID}</p>
                  <span className='h-[2px] w-[2px] bg-white-800' />
                  <Moment fromNow className='text-white-800 text-sm'>
                    {post.postCreatedAt ? post.postCreatedAt : post.postCreatedAt}
                  </Moment>
                </div>
                {community &&
                  <div className='flex items-center space-x-2'>
                    <p className='text-white-800 text-sm'>posted on</p>
                    <Link href={`/communities/${post.postCommunityId}`} className='underline text-sm'>{community.communityName}</Link>
                  </div>
                }
              </div>
            </div>
          </div>
          <Image src="/assets/svgs/post-verticalellipsis.svg" alt="Post options" width={12} height={12} />
        </div>
        <p className='text-sm mt-2'>{post.postContent}</p>
        {post.postImageSrc && (
          <div className='py-4 border-b border-dark-700'>
            <img src={post.postImageSrc} alt="" className='w-auto h-auto object-contain' />
          </div>
        )}

        <div className='flex justify-between mt-3'>
          <div className='flex'>
            <div className='mr-6 flex items-center space-x-1'>
              <Image src="/assets/svgs/post-like.svg" alt="Like" width={20} height={20} />
              <p className='text-sm ml-1'>{post.postLikes.length}</p>
            </div>
            <div className='mr-6 flex items-center space-x-1'>
              <Image src="/assets/svgs/post-comment.svg" alt="Comment" width={20} height={20} />
              <p className='text-sm ml-1'>{post.postComments.length}</p>
            </div>
            <div className='mr-6 flex items-center space-x-1'>
              <Image src="/assets/svgs/post-repost.svg" alt="Repost" width={20} height={20} />
            </div>
            <div className='mr-6 flex items-center space-x-1'>
              <Image src="/assets/svgs/post-share.svg" alt="Share" width={20} height={20} />
            </div>
          </div>
          <div className='mr-4 flex items-center space-x-1'>
            <Image src="/assets/svgs/post-save.svg" alt="Save" width={20} height={20} />
          </div>
        </div>
      </div>
    </Link>
  );
}
