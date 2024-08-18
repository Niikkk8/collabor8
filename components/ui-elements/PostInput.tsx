import React from 'react'

export default function PostInput() {
  return (
    <div className='bg-dark-800 p-3 rounded-lg'>
      <div className='bg-dark-700 px-4 py-3 rounded'>
        <div className="border-b border-white-800 pb-6">
          <div className="flex items-center p-2">
            <div className='flex w-full'>
              <img src="/assets/placeholder-images/profile-picture.jpg" alt="" className='w-[48px] h-[48px] object-cover rounded-full' />
              <input type="text" name="" id="" className='ml-3 outline-none bg-transparent w-full' placeholder="What's on your mind?" />
            </div>
            <div className='flex'>
              <img src="/assets/svgs/input-gif.svg" alt="" className='w-[28px] h-[28px] mx-1' />
              <img src="/assets/svgs/input-emoji.svg" alt="" className='w-[28px] h-[28px] mx-1' />
            </div>
          </div>
          <div className='flex items-center mt-4 px-2'>
            <img src="/assets/svgs/input-globe.svg" alt="" className='w-[20px] h-[20px]' />
            <p className='text-sm mx-1'>Everyone can reply</p>
            <img src="/assets/svgs/searchbar-dropdown.svg" alt="" className='w-[18px] h-[18px]' />
          </div>
        </div>
        <div className='flex items-center justify-between p-2 mt-1'>
          <div className='flex items-center'>
            <div className='flex items-center mr-4'>
              <img src="/assets/svgs/input-camera.svg" alt="" className='w-[20px] h-[20px] mr-2' />
              <p className='text-sm'>Image/Video</p>
            </div>
            <div className='flex items-center'>
              <img src="/assets/svgs/input-events.svg" alt="" className='w-[20px] h-[20px] mr-2' />
              <p className='text-sm'>Events</p>
            </div>
          </div>
          <button className='bg-brand-500 py-2 px-6 rounded-lg'>Post</button>
        </div>
      </div>
    </div>
  )
}
