import React from 'react'

export default function SidebarCommunitiesList() {
    const communities = [
        { src: '/assets/placeholder-images/developer.jpg', title: 'Tech Mentors' },
        { src: '/assets/placeholder-images/self-improvement.jpeg', title: 'The Self Improvement Arc' }
    ]

    return (
        <div className='p-6'>
            <h3 className='text-sm text-white-800'>Communities you've joined</h3>
            <div className='border-b border-white-900 pb-2'>
                {
                    communities.map(community => (
                        <div className='flex items-center my-2'>
                            <img src={community.src} alt="" className='w-[48px] h-[48px] rounded-full object-cover' />
                            <h3 className='text-sm font-medium ml-2'>{community.title}</h3>
                        </div>
                    ))
                }
            </div>
            <p className='text-xs cursor-pointer mt-2 mr-2 py-1 px-2 hover:bg-gray-700 hover:duration-300 w-fit rounded'>View All</p>
        </div>
    )
}
