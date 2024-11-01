'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function ProfileTabs({ id }: { id: string }) {
    const pathname = usePathname();

    // Utility function to check if the tab is active
    const isActive = (route: string) => pathname === route;

    return (
        <div className='mt-6 flex justify-evenly py-2 border-b border-dark-700'>
            <Link href={`/profile/${id}`} className={`relative ${isActive(`/profile/${id}`) ? 'after:content-[""] after:absolute after:bottom-[-8px] after:left-[-10%] after:w-[120%] after:h-[2px] after:bg-white-500 after:rounded-full' : 'text-white-800'} text-xs md:text-sm`}>
                Posts
            </Link>
            <Link href={`/profile/${id}/scheduled-events`} className={`relative ${isActive(`/profile/${id}/scheduled-events`) ? 'after:content-[""] after:absolute after:bottom-[-8px] after:left-[-10%] after:w-[120%] after:h-[2px] after:bg-white-500 after:rounded-full' : 'text-white-800'} text-xs md:text-sm`}>
                Scheduled Events
            </Link>
            <Link href={`/profile/${id}/saved`} className={`relative ${isActive(`/profile/${id}/saved`) ? 'after:content-[""] after:absolute after:bottom-[-8px] after:left-[-10%] after:w-[120%] after:h-[2px] after:bg-white-500 after:rounded-full' : 'text-white-800'} text-xs md:text-sm`}>
                Saved
            </Link>
            <Link href={`/profile/${id}/portfolio`} className={`relative ${isActive(`/profile/${id}/portfolio`) ? 'after:content-[""] after:absolute after:bottom-[-8px] after:left-[-10%] after:w-[120%] after:h-[2px] after:bg-white-500 after:rounded-full' : 'text-white-800'} text-xs md:text-sm`}>
                Portfolio
            </Link>
        </div>
    );
}
