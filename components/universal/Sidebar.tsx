import React from 'react'
import { Roboto } from 'next/font/google'
import SidebarProfileInfo from '../sidebar/SidebarProfileInfo'
import Link from 'next/link'
import Image from 'next/image'
import SidebarCommunitiesList from '../sidebar/SidebarCommunitiesList'

const roboto = Roboto({
  weight: '700',
  subsets: ['latin'],
  display: 'swap',
})

export default function Sidebar() {
  return (
    <div className='w-[20%] h-screen border-r border-white-900'>
      <div className={`p-6 flex items-center ${roboto.className}`}>
        <h1 className='bg-[#1F28FF] text-2xl rounded w-fit py-1 px-3 font-bold'>C</h1>
        <h1 className='text-2xl font-bold ml-2'>Collabor8</h1>
      </div>
      <div className='px-6'>
        <SidebarProfileInfo />
      </div>
      <div className='border-b border-white-900 p-6'>
        <Link href={'/'} className='flex items-center text-sm font-medium py-3 px-4 rounded bg-brand-500 my-1 hover:bg-gray-700 hover:duration-300'>
          <Image src={'/assets/svgs/sidebar-home.svg'} height={20} width={20} alt='' className='mr-3' />
          Home
        </Link>
        <Link href={'/'} className='flex items-center text-sm font-medium py-3 px-4 rounded my-1 hover:bg-gray-700 hover:duration-300'>
          <Image src={'/assets/svgs/sidebar-communities.svg'} height={20} width={20} alt='' className='mr-3' />
          Communities
        </Link>
        <Link href={'/'} className='flex items-center text-sm font-medium py-3 px-4 rounded my-1 hover:bg-gray-700 hover:duration-300'>
          <Image src={'/assets/svgs/sidebar-calendar.svg'} height={20} width={20} alt='' className='mr-3' />
          Events
        </Link>
        <Link href={'/'} className='flex items-center text-sm font-medium py-3 px-4 rounded my-1 hover:bg-gray-700 hover:duration-300'>
          <Image src={'/assets/svgs/sidebar-notification.svg'} height={20} width={20} alt='' className='mr-3' />
          Notifications
        </Link>
        <Link href={'/'} className='flex items-center text-sm font-medium py-3 px-4 rounded my-1 hover:bg-gray-700 hover:duration-300'>
          <Image src={'/assets/svgs/sidebar-profile.svg'} height={20} width={20} alt='' className='mr-3' />
          Profile
        </Link>
        <Link href={'/'} className='flex items-center text-sm font-medium py-3 px-4 rounded my-1 hover:bg-gray-700 hover:duration-300'>
          <Image src={'/assets/svgs/sidebar-settings.svg'} height={20} width={20} alt='' className='mr-3' />
          Settings
        </Link>
      </div>
      <SidebarCommunitiesList />
    </div>
  )
}
