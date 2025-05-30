'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import SidebarCommunitiesList from '@/components/sidebar/SidebarCommunitiesList';
import ProfileInfo from '../ui-elements/ProfileInfo';
import { User } from '@/types';
import { useAppSelector } from '@/redux/hooks';

export default function Sidebar() {
  const pathname = usePathname();
  const user: User = useAppSelector((state) => state.user)

  const getLinkClasses = (path: string, containsString?: boolean) => {
    const isActive = (containsString ? pathname.includes(path) : pathname === path);
    return `flex items-center text-sm font-medium py-3 px-4 rounded my-1 ${!isActive && 'hover:bg-gray-700 hover:bg-opacity-50'} hover:duration-300 ${isActive ? 'bg-brand-500' : ''}`;
  };

  return (
    <div className='hidden w-1/5 min-w-fit h-screen border-r border-dark-700 md:flex flex-col justify-between'>
      <div>
        <div className='p-6 flex items-center'>
          <h1 className='bg-[#1F28FF] text-3xl rounded w-fit py-1 px-4' style={{ fontFamily: 'Impact, sans-serif' }}>C</h1>
          <h1 className='text-3xl ml-2' style={{ fontFamily: 'Impact, sans-serif' }}>Collabor8</h1>
        </div>
        <div className='px-6'>
          <ProfileInfo user={user} />
        </div>
        <div className='border-b border-dark-700 p-6'>
          <Link href='/' className={getLinkClasses('/')}>
            <Image src={'/assets/svgs/sidebar-home.svg'} height={20} width={20} alt='' className='mr-3' />
            Home
          </Link>
          <Link href='/communities' className={getLinkClasses('/communities')}>
            <Image src={'/assets/svgs/sidebar-communities.svg'} height={20} width={20} alt='' className='mr-3' />
            Communities
          </Link>
          <Link href='/events' className={getLinkClasses('/events')}>
            <Image src={'/assets/svgs/sidebar-calendar.svg'} height={20} width={20} alt='' className='mr-3' />
            Events
          </Link>
          <Link href='/notifications' className={getLinkClasses('/notifications')}>
            <Image src={'/assets/svgs/sidebar-notification.svg'} height={20} width={20} alt='' className='mr-3' />
            Notifications
          </Link>
          <Link href={`/profile/${user.userUID}`} className={getLinkClasses(`/profile/${user.userUID}`, true)}>
            <Image src={'/assets/svgs/sidebar-profile.svg'} height={20} width={20} alt='' className='mr-3' />
            Profile
          </Link>
          {/* <Link href='/settings' className={getLinkClasses('/settings')}>
            <Image src={'/assets/svgs/sidebar-settings.svg'} height={20} width={20} alt='' className='mr-3' />
            Settings
          </Link> */}
        </div>
        <SidebarCommunitiesList />
      </div>
      <div className='p-6'>
        <p className='text-xs text-white-900'>@2024 Collabor8 All Rights Reserved</p>
        <p className='text-xs text-white-900'>
          Developed by&nbsp;
          <Link href={'https://niket.dev/'} target='_blank' className='text-blue-500 underline'>Niket Shah</Link>
        </p>
      </div>
    </div>
  );
}
