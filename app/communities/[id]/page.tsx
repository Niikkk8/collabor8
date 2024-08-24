import Post from '@/components/ui-elements/Post';
import PostInput from '@/components/ui-elements/PostInput'
import ProfileInfo from '@/components/ui-elements/ProfileInfo';
import Image from 'next/image';
import React from 'react'

export default function page() {
    const posts = [
        {
            profileName: "Niket Shah",
            profileSrc: "/assets/placeholder-images/profile-picture.jpg",
            userId: "nik8",
            followers: "20k",
            time: "10 hrs ago",
            content: "Excited to share a new tutorial on React Hooks with the Tech Mentors community! Let's dive into custom hooks.",
            likes: 150,
            comments: 12,
        },
        {
            profileName: "Jane Doe",
            profileSrc: "/assets/placeholder-images/profile-picture.jpg",
            userId: "jane_doe",
            followers: "326",
            time: "12 hrs ago",
            content: "I've been following the morning routine suggested by the Self Improvement Arc, and it's been a game-changer!",
            likes: 120,
            comments: 10,
        },
        {
            profileName: "John Smith",
            profileSrc: "/assets/placeholder-images/profile-picture.jpg",
            userId: "john_smith",
            followers: "500",
            time: "15 hrs ago",
            content: "Any recommendations on the best resources for learning advanced TypeScript? #TechMentors",
            likes: 95,
            comments: 8,
        },
        {
            profileName: "Emma Brown",
            profileSrc: "/assets/placeholder-images/profile-picture.jpg",
            userId: "emma_brown",
            followers: "1.2k",
            time: "18 hrs ago",
            content: "Just completed a 30-day challenge from the Self Improvement Arc community. Feeling more productive and focused!",
            likes: 180,
            comments: 15,
        },
        {
            profileName: "Michael Lee",
            profileSrc: "/assets/placeholder-images/profile-picture.jpg",
            userId: "michael_lee",
            followers: "800",
            time: "20 hrs ago",
            content: "Started a new mentorship session today on Python for Data Science. Loving the enthusiasm in the Tech Mentors community!",
            likes: 210,
            comments: 18,
        },
    ];
    return (
        <div className='flex h-screen'>
            <div className='p-6 w-3/4 border-r border-dark-700 overflow-y-scroll no-scrollbar'>
                <PostInput inputPlaceholder='Make a post in this community!' />
                <div className="flex items-center p-2 mt-4 min-w-fit">
                    <span className="text-sm text-white-800">Sort By: </span>
                    <p className="flex items-center text-sm ml-2">
                        New
                        <Image src="/assets/svgs/searchbar-dropdown.svg" alt="" width={14} height={14} className="ml-1" />
                    </p>
                    <div className="flex-grow ml-2 h-[1px] bg-dark-700" />
                </div>
                <div className="mt-4">
                    {posts.map((post, index) => (
                        <Post post={post} key={index} />
                    ))}
                </div>
            </div>
            <div className='w-1/4 overflow-scroll no-scrollbar'>
                <Image src={'/assets/placeholder-images/community-banner.jpg'} width={400} height={400} alt='' className='w-[540px] h-[240px] object-cover' />
                <div className='mt-[-76px] p-4 border-b border-dark-700'>
                    <div className='flex justify-between items-center'>
                        <Image src={'/assets/placeholder-images/developer.jpg'} width={120} height={120} alt='' className='object-cover rounded-full border-4 border-dark-900' />
                        <Image src={'/assets/svgs/community-ellipsis.svg'} width={28} height={28} alt='' className='mt-8' />
                    </div>
                    <div className='mt-4 flex justify-between items-center'>
                        <h1 className='text-lg font-semibold w-1/2'>Tech Mentors</h1>
                        <button className='bg-brand-500 px-6 py-2 rounded'>Join Community</button>
                    </div>
                    <div className='bg-dark-800 mt-4 py-2 px-4 rounded'>
                        <p className='text-sm'>476,910 members</p>

                    </div>
                    <p className='text-sm my-6'>Interested in programming things? Like to read about programming without seeing a constant flow of technology and political news into your proggit? That&apos;s what this community
                        is for. A pure discussion of programming with a strict policy of programming-related discussions.
                    </p>
                </div>
                <div className='p-4'>
                    <h1 className='font-medium'>Admin</h1>
                    <ProfileInfo />
                </div>
            </div>
        </div>
    )
}
