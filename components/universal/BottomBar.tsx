import { useAppSelector } from '@/redux/hooks';
import { User } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BottomBar = () => {
    const pathname = usePathname();
    const user: User = useAppSelector((state) => state.user);

    const getLinkClasses = (path: string, containsString?: boolean) => {
        const isActive = (containsString ? pathname.includes(path) : pathname === path);
        return `flex items-center justify-center text-sm font-medium p-3 rounded ${!isActive && 'hover:bg-gray-700 hover:bg-opacity-50'
            } hover:duration-300 ${isActive ? 'bg-brand-500' : ''}`;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-dark-900 border-t border-gray-800">
            <nav className="flex items-center justify-around px-4 py-2">
                <Link href="/" className={getLinkClasses('/')}>
                    <Image src={'/assets/svgs/sidebar-home.svg'} height={20} width={20} alt='' className="w-6 h-6" />
                </Link>

                <Link href="/communities" className={getLinkClasses('/communities')}>
                    <Image src={'/assets/svgs/sidebar-communities.svg'} height={20} width={20} alt='' className="w-6 h-6" />
                </Link>

                <Link href="/events" className={getLinkClasses('/events')}>
                    <Image src={'/assets/svgs/sidebar-calendar.svg'} height={20} width={20} alt='' className="w-6 h-6" />
                </Link>

                <Link href="/notifications" className={getLinkClasses('/notifications', true)}>
                    <Image src={'/assets/svgs/sidebar-notification.svg'} height={20} width={20} alt='' className="w-6 h-6" />
                </Link>

                <Link href={`/profile/${user.userUID}`} className={getLinkClasses(`/profile/${user.userUID}`, true)}>
                    <Image src={'/assets/svgs/sidebar-profile.svg'} height={20} width={20} alt='' className='w-6 h-6' />
                </Link>
            </nav>
        </div>
    );
};

export default BottomBar;