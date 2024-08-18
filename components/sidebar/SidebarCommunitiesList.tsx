import React from 'react'

export default function SidebarCommunitiesList() {
    const communities = [
        { src: '/assets/placeholder-images/developer.jpg', title: 'Tech Mentors' },
        { src: '/assets/placeholder-images/self-improvement.jpeg', title: 'The Self Improvement Arc' }
    ]

    return (
        <div className='p-6'>
            <h3 className='text-sm text-white-800'>Communities you've joined</h3>
            <div className='border-b border-white-900 pb-2 mt-2'>
                {
                    communities.map((community, index) => (
                        <div className='flex items-center px-4 py-2 hover:bg-gray-500 hover:bg-opacity-20 hover:duration-300 rounded cursor-pointer' key={index}>
                            <img src={community.src} alt="" className='w-[48px] h-[48px] rounded-full object-cover' />
                            <h3 className='text-sm font-medium ml-2'>{community.title}</h3>
                        </div>
                    ))
                }
            </div>
            <div className='flex justify-end'>
                <p className='text-[11px] cursor-pointer mt-2 mr-2 py-1 px-3 hover:bg-gray-700 hover:bg-opacity-40 hover:duration-300 w-fit rounded'>View All</p>
            </div>
        </div>
    )
}
