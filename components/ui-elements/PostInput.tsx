import React from 'react';
import Image from 'next/image';

export default function PostInput() {
  return (
    <div className='bg-dark-800 p-3 rounded-lg'>
      <div className='bg-dark-700 px-4 py-3 rounded'>
        <div className="border-b border-white-800 pb-6">
          <div className="flex items-center p-2">
            <div className='flex w-full'>
              <Image
                src="/assets/placeholder-images/profile-picture.jpg"
                alt=""
                width={48}
                height={48}
                className='object-cover rounded-full'
              />
              <input
                type="text"
                name=""
                id=""
                className='ml-3 outline-none bg-transparent w-full'
                placeholder="What's on your mind?"
              />
            </div>
            <div className='flex'>
              <Image
                src="/assets/svgs/input-gif.svg"
                alt=""
                width={28}
                height={28}
                className='mx-1'
              />
              <Image
                src="/assets/svgs/input-emoji.svg"
                alt=""
                width={28}
                height={28}
                className='mx-1'
              />
            </div>
          </div>
          <div className='flex items-center mt-4 px-2'>
            <Image
              src="/assets/svgs/input-globe.svg"
              alt=""
              width={20}
              height={20}
            />
            <p className='text-sm mx-1'>Everyone can reply</p>
            <Image
              src="/assets/svgs/searchbar-dropdown.svg"
              alt=""
              width={18}
              height={18}
            />
          </div>
        </div>
        <div className='flex items-center justify-between p-2 mt-1'>
          <div className='flex items-center'>
            <div className='flex items-center mr-4'>
              <Image
                src="/assets/svgs/input-camera.svg"
                alt=""
                width={20}
                height={20}
                className='mr-2'
              />
              <p className='text-sm'>Image/Video</p>
            </div>
            <div className='flex items-center'>
              <Image
                src="/assets/svgs/input-events.svg"
                alt=""
                width={20}
                height={20}
                className='mr-2'
              />
              <p className='text-sm'>Events</p>
            </div>
          </div>
          <button className='bg-brand-500 py-2 px-6 rounded-lg'>Post</button>
        </div>
      </div>
    </div>
  );
}
