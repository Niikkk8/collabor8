import Post from '@/components/ui-elements/Post';
import Link from 'next/link';

export default function page() {
    const posts = [
        {
            profileName: 'Niket Shah',
            profileSrc: '/assets/placeholder-images/profile-picture.jpg',
            userId: 'nik8',
            followers: '20k',
            time: '2h ago',
            content: 'Just deployed my first full-stack app using Next.js and Tailwind CSS!',
            likes: 230,
            comments: 18,
        },
        {
            profileName: 'Niket Shah',
            profileSrc: '/assets/placeholder-images/profile-picture.jpg',
            userId: 'nik8',
            followers: '20k',
            time: '4h ago',
            content: 'Finally mastered React Hooks! Can`t wait to apply them to my projects.',
            likes: 190,
            comments: 25,
        },
        {
            profileName: 'Niket Shah',
            profileSrc: '/assets/placeholder-images/profile-picture.jpg',
            userId: 'nik8',
            followers: '20k',
            time: '6h ago',
            content: 'Exploring the new features in Next.js 14. The App Router is a game changer!',
            likes: 145,
            comments: 10,
        },
        {
            profileName: 'Niket Shah',
            profileSrc: '/assets/placeholder-images/profile-picture.jpg',
            userId: 'nik8',
            followers: '20k',
            time: '8h ago',
            content: 'Working on a new open-source project for the developer community. Stay tuned!',
            likes: 300,
            comments: 42,
        },
    ];

    return (
        <>
            <div className='mt-6 flex justify-evenly py-2 border-b border-dark-700'>
                <Link href="/profile" className={`relative after:content-[""] after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-[2px] after:bg-white-500 after:rounded-full' : 'text-white-800'`}>
                    Posts
                </Link>
                <Link href="/profile/scheduled-events" className={`relative text-white-800`} >
                    Scheduled Events
                </Link>
                <Link href="/profile/saved" className={`relative text-white-800`}>
                    Saved
                </Link>
                <Link href="/profile/portfolio" className={`relative text-white-800`}>
                    Niket's Portfolio
                </Link>
            </div>
            {posts.map((post, index) => (
                <Post key={index} post={post} />
            ))}
        </>
    )
}