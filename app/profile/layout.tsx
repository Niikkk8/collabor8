import Image from 'next/image'
import React from 'react'

export default function ProfileLayout({
    children
}: {
    children: React.ReactNode
}) {

    return (
        <div className='flex'>
            <div className='w-3/4 h-screen overflow-scroll no-scrollbar border-r border-dark-700'>
                <div className='p-4'>
                    <Image src={'/assets/placeholder-images/profile-banner.jpeg'} height={400} width={800} alt='' className='w-full h-[200px] object-cover rounded' />
                    <div className='mt-[-72px]'>
                        <div className='flex justify-between px-4 mb-6'>
                            <Image
                                src={'/assets/placeholder-images/profile-picture.jpg'}
                                alt=''
                                width={160}
                                height={160}
                                className='object-cover rounded-full aspect-square border-4 border-dark-900'
                            />
                            <button className='mt-24 mr-4 border border-white-800 h-fit text-sm py-2 px-4 rounded-lg'>Edit Profile</button>
                        </div>
                    </div>
                    <div className='px-4'>
                        <h2 className='text-xl font-medium'>Niket Shah</h2>
                        <h3 className='text-sm text-white-800'>@nik8</h3>
                        <p className='mt-4'>(maybe) a web dev</p>
                        <p className='mt-4 text-white-800 bg-dark-800 flex items-center rounded-full w-fit px-4 py-2 text-sm'>
                            <Image src='/assets/svgs/profile-calendar.svg' height={18} width={18} alt='' className='mr-2' />
                            Joined August 2024
                        </p>
                        <div className='flex items-center mt-4'>
                            <p className='text-sm mr-4'>
                                20k <span className='ml-[2px] text-white-800 text-xs'>Followers</span>
                            </p>
                            <p className='text-sm mr-4'>
                                404 <span className='ml-[2px] text-white-800 text-xs'>Following</span>
                            </p>
                            <p className='text-sm mr-4'>
                                643 <span className='ml-[2px] text-white-800 text-xs'>Posts</span>
                            </p>
                            <p className='text-sm mr-4'>
                                27 <span className='ml-[2px] text-white-800 text-xs'>Communities</span>
                            </p>
                        </div>
                    </div>
                    <div className='mt-4'>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}