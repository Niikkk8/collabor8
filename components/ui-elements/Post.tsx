import React from 'react';
import Image from 'next/image';

export default function Post({ post }: { post: any }) {
  const { profileName, profileSrc, userId, followers, time, content, likes, comments } = post;

  return (
    <div className='p-4 border border-dark-600 rounded post-gradient'>
      <div className='flex justify-between items-start'>
        <div className='flex'>
          <div className='w-12 h-12 relative'>
            <Image
              src={profileSrc}
              alt=""
              layout="fill"
              className='object-cover rounded-full'
            />
          </div>
          <div className='ml-3'>
            <div className='flex items-center space-x-2'>
              <h3 className='font-medium'>{profileName}</h3>
              <p className='text-sm font-light text-white-800'>@{userId}</p>
              <span className='h-[2px] w-[2px] bg-white-800' />
              <p className='text-white-800 text-xs'>{followers} followers</p>
            </div>
            <div className='text-white-800 text-sm'>{time}</div>
          </div>
        </div>
        <Image
          src="/assets/svgs/post-verticalellipsis.svg"
          alt=""
          width={12}
          height={12}
        />
      </div>
      <p className='py-4 pl-2 border-b border-dark-400 text-sm'>{content}</p>
      <div className='flex mt-2'>
        <div className='mr-3 flex items-center space-x-1'>
          <Image
            src="/assets/svgs/post-like.svg"
            alt=""
            width={18}
            height={18}
          />
          <p>Like</p>
        </div>
        <div className='mr-3 flex items-center space-x-1'>
          <Image
            src="/assets/svgs/post-comment.svg"
            alt=""
            width={18}
            height={18}
          />
          <p>Comment</p>
        </div>
        <div className='mr-3 flex items-center space-x-1'>
          <Image
            src="/assets/svgs/post-repost.svg"
            alt=""
            width={18}
            height={18}
          />
          <p>Repost</p>
        </div>
        <div className='mr-3 flex items-center space-x-1'>
          <Image
            src="/assets/svgs/post-share.svg"
            alt=""
            width={18}
            height={18}
          />
          <p>Share</p>
        </div>
      </div>
      <div className='mt-2 flex items-center text-xs text-white-800'>
        <p>{likes} likes</p>
        <span className='h-[2px] w-[2px] bg-white-800 mx-2' />
        <p>{comments} comments</p>
      </div>
    </div>
  );
}
