'use client'

import EventCard from '@/components/ui-elements/EventCard'
import { useAppSelector } from '@/redux/hooks'
import { Event, User } from '@/types'
import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, getDocFromServer } from 'firebase/firestore'
import { db } from '@/firebase'

export default function Page() {
    const user: User = useAppSelector((state) => state.user)
    const [joinedEvents, setJoinedEvents] = useState<Event[]>([])
    const [unjoinedEvents, setUnjoinedEvents] = useState<Event[]>([])
    const [isLoadingJoined, setIsLoadingJoined] = useState(true)
    const [isLoadingUnjoined, setIsLoadingUnjoined] = useState(true)

    useEffect(() => {
        const fetchJoinedEvents = async () => {
            setIsLoadingJoined(true);
            const joinedEventsData: Event[] = [];
            const eventsRef = collection(db, 'events');
            const q = query(eventsRef, where('eventMembers', 'array-contains', user.userUID));
            const querySnapshot = await getDocs(q);

            const currentDate = new Date();

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const eventDate = new Date(data.eventDate.toDate());

                if (eventDate >= currentDate) {
                    const event: Event = {
                        eventUID: doc.id,
                        eventTitle: data.eventTitle,
                        eventDescription: data.eventDescription,
                        eventDate: data.eventDate.toDate(),
                        eventLocation: data.eventLocation,
                        eventOrganizerId: data.eventOrganizerId,
                        eventMembers: data.eventMembers,
                        eventImageSrc: data.eventImageSrc,
                    };
                    joinedEventsData.push(event);
                }
            });
            setJoinedEvents(joinedEventsData);
            setIsLoadingJoined(false);
        };

        const fetchUnjoinedEvents = async () => {
            setIsLoadingUnjoined(true);
            const unjoinedEventsData: Event[] = [];
            const eventsRef = collection(db, 'events');
            const querySnapshot = await getDocs(eventsRef);

            const currentDate = new Date();

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const eventDate = new Date(data.eventDate.toDate());

                if (eventDate >= currentDate && !data.eventMembers.includes(user.userUID)) {
                    const event: Event = {
                        eventUID: doc.id,
                        eventTitle: data.eventTitle,
                        eventDescription: data.eventDescription,
                        eventDate: data.eventDate.toDate(),
                        eventLocation: data.eventLocation,
                        eventOrganizerId: data.eventOrganizerId,
                        eventMembers: data.eventMembers,
                        eventImageSrc: data.eventImageSrc,
                    };
                    unjoinedEventsData.push(event);
                }
            });

            setUnjoinedEvents(unjoinedEventsData);
            setIsLoadingUnjoined(false);
        };

        fetchJoinedEvents();
        fetchUnjoinedEvents();
    }, [user.userUID]);


    return (
        <div className='flex h-screen overflow-hidden'>
            <div className='p-4 w-full lg:w-3/4 border-r border-dark-700 py-4 px-6 overflow-y-scroll no-scrollbar'>
                <h1 className='font-medium text-lg ml-2 mb-1'>Events</h1>
                <div className='flex flex-wrap border-b border-dark-700 pb-6'>
                    {isLoadingJoined ? (
                        <p className='ml-2 text-white-800 text-sm mt-2'>Loading events...</p>
                    ) : joinedEvents.length > 0 ? (
                        joinedEvents.map(event => (
                            <EventCard key={event.eventUID} event={event} />
                        ))
                    ) : (
                        <h2 className='ml-2 text-white-800 text-sm mt-2'>No events to display</h2>
                    )}
                </div>
                <h2 className='font-medium text-lg ml-2 mb-1 mt-4'>Upcoming Events You May Like</h2>
                <div className='flex flex-wrap border-b border-dark-700 pb-6'>
                    {isLoadingUnjoined ? (
                        <p className='ml-2 text-white-800 text-sm mt-2'>Loading upcoming events...</p>
                    ) : unjoinedEvents.length > 0 ? (
                        unjoinedEvents.map(event => (
                            <EventCard key={event.eventUID} event={event} />
                        ))
                    ) : (
                        <h2 className='ml-2 text-white-800 text-sm mt-2'>No events to display</h2>
                    )}
                </div>
            </div>
            <div className="hidden lg:block w-1/4 p-2">
                <p className='text-sm text-white-800'>Suggested People</p>
                {/* Placeholder for suggested people section */}
                {/* MAGIC UI */}
            </div>
        </div>
    )
}
