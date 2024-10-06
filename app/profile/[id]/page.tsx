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
            {posts.map((post, index) => (
                <Post key={index} post={post} />
            ))}
        </>
    )
}