import React from 'react';

export default function Post({ post }: { post: any }) {
  const { profileName, profileSrc, userId, followers, time, content, likes, comments } = post;

  return (
    <div className='p-4 border border-dark-600 rounded post-gradient'>
      <div className='flex justify-between'>
        <div className='flex'>
          <img src={profileSrc} alt="" className='w-[48px] h-[48px] object-cover rounded-full' />
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
        <img src="/assets/svgs/post-verticalellipsis.svg" alt="" className='w-[32px] h-[32px]' />
      </div>
      <p className='py-4 pl-2 border-b border-dark-400 text-sm'>{content}</p>
      <div className='flex mt-2'>
        <div className='mr-3 flex items-center space-x-1'>
          <img src="/assets/svgs/post-like.svg" className='w-[18px] h-[18px]' alt="" />
          <p>Like</p>
        </div>
        <div className='mr-3 flex items-center space-x-1'>
          <img src="/assets/svgs/post-comment.svg" className='w-[18px] h-[18px]' alt="" />
          <p>Comment</p>
        </div>
        <div className='mr-3 flex items-center space-x-1'>
          <img src="/assets/svgs/post-repost.svg" className='w-[18px] h-[18px]' alt="" />
          <p>Repost</p>
        </div>
        <div className='mr-3 flex items-center space-x-1'>
          <img src="/assets/svgs/post-share.svg" className='w-[18px] h-[18px]' alt="" />
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
