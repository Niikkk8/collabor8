import EventCard from '@/components/ui-elements/EventCard'
import React from 'react'

export default function page() {
    return (
        <div className='flex'>
            <div className='p-4 w-3/4 border-r border-dark-700 py-4 px-6 overflow-y-scroll no-scrollbar'>
                <h1 className='font-medium text-lg ml-2 mb-1'>Events</h1>
                <div className='flex flex-wrap'>
                    {
                        new Array(5).fill(0).map((_, index) => (
                            <EventCard key={index} />
                        ))
                    }
                </div>
            </div>
            <div className="w-1/4 p-2">
                <p className='text-sm text-white-800'>Suggested People</p>
            </div>
        </div>
    )
}
