'use client'

import { Event, User } from '@/types'
import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, getDocFromServer } from 'firebase/firestore'
import { db } from '@/firebase'
import EventCard from "@/components/ui-elements/EventCard";
import { useAppSelector } from '@/redux/hooks'

export default function Page() {
    const user: User = useAppSelector((state) => state.user)
    const [joinedEvents, setJoinedEvents] = useState<Event[]>([])
    const [isLoadingJoined, setIsLoadingJoined] = useState(true)

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

        fetchJoinedEvents();
    }, [user.userUID]);

    return (
        <div className="p-2">
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
        </div>
    )
}