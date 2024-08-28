import Image from 'next/image'
import React from 'react'

export default function EventCard() {
    return (
        <div className='bg-dark-800 p-3 w-[48%] m-1 rounded'>
            <Image src={'/assets/placeholder-images/event-banner.jpeg'} height={200} width={200} alt='' className='w-full h-[200px] object-cover rounded-sm' />
            <p className='text-white-800 text-sm mt-2'>E-Commerce</p>
            <h2 className=''>The Indian E-Commerce Summit</h2>
            <div className='border-b border-dark-700 pb-4'>
                <div className='mt-3 bg-dark-700 rounded p-2'>
                    <h3>August 31, 2024</h3>
                    <p className='text-xs text-white-800 flex items-center mt-1'>
                        Location
                        <span className='h-[2px] w-[2px] bg-white-800 mx-1' />
                        Online
                    </p>
                    <p className='text-xs text-white-800'>image mapping</p>
                </div>
            </div>
            <button className='bg-brand-500 w-full rounded py-3 mt-4'>Register Now</button>
        </div>
    )
}
