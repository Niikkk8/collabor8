import React from 'react'

export default function SearchBar() {
  return (
    <div className='px-6 py-4 flex justify-between w-full border-b border-white-900'>
      <div className='flex items-center bg-dark-800 py-3 px-4 rounded w-full mr-20'>
        <img src='/assets/svgs/searchbar-search.svg' className='w-[20px] h-[20px]' />
        <input type="text" name="" id="" className='bg-transparent outline-none w-full ml-3 text-sm' placeholder='Search...' />
      </div>
      <div className='flex items-center min-w-fit'>
        <div className='p-3 rounded-lg mx-2 bg-dark-800'>
          <img src='/assets/svgs/searchbar-messages.svg' className='w-[22px] h-[22px]' />
        </div>
        <div className='p-3 rounded-lg mx-2 bg-dark-800'>
          <img src='/assets/svgs/searchbar-saved.svg' className='w-[22px] h-[22px]' />
        </div>
        <div className='flex items-center ml-4'>
          <img src="/assets/placeholder-images/profile-picture.jpg" alt="" className='w-[48px] h-[48px] object-cover rounded-full' />
          <h3 className='text-sm mx-2'>Niket Shah</h3>
          <img src='/assets/svgs/searchbar-dropdown.svg' className='w-[18px] h-[18px]' />
        </div>
      </div>
    </div>
  )
}
