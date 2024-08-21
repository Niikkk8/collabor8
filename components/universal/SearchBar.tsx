import React from 'react';
import Image from 'next/image';

export default function SearchBar() {
  return (
    <div className='px-6 py-4 flex justify-between w-full border-b border-dark-700'>
      <div className='flex items-center bg-dark-800 py-3 px-4 rounded w-full mr-20'>
        <Image
          src='/assets/svgs/searchbar-search.svg'
          alt=""
          width={20}
          height={20}
          className='w-[20px] h-[20px]'
        />
        <input
          type="text"
          name=""
          id=""
          className='bg-transparent outline-none w-full ml-3 text-sm'
          placeholder='Search...'
        />
      </div>
      <div className='flex items-center min-w-fit'>
        <div className='p-3 rounded-lg mx-2 bg-dark-800'>
          <Image
            src='/assets/svgs/searchbar-messages.svg'
            alt=""
            width={22}
            height={22}
            className='w-[22px] h-[22px]'
          />
        </div>
        <div className='p-3 rounded-lg mx-2 bg-dark-800'>
          <Image
            src='/assets/svgs/searchbar-saved.svg'
            alt=""
            width={22}
            height={22}
            className='w-[22px] h-[22px]'
          />
        </div>
        <div className='flex items-center ml-4'>
          <Image
            src="/assets/placeholder-images/profile-picture.jpg"
            alt=""
            width={48}
            height={48}
            className='object-cover rounded-full aspect-square'
          />
          <h3 className='text-sm mx-2'>Niket Shah</h3>
          <Image
            src='/assets/svgs/searchbar-dropdown.svg'
            alt=""
            width={18}
            height={18}
            className='w-[18px] h-[18px]'
          />
        </div>
      </div>
    </div>
  );
}
