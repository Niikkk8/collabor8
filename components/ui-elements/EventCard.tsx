import Image from 'next/image'
import React from 'react'
import { Event, User } from '@/types'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useRouter } from 'next/navigation'
import { setUser } from '@/redux/userSlice'
import { openSignupModal } from '@/redux/modalSlice'

interface EventCardProps {
    event: Event
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
    const dispatch = useAppDispatch()
    const user: User = useAppSelector((state) => state.user)
    const router = useRouter()
    const hasJoined: boolean = event.eventMembers.includes(user.userUID)

    const formattedEventDate = event.eventDate
        ? new Date(
            (event.eventDate as any).toDate
                ? (event.eventDate as any).toDate()
                : event.eventDate
        ).toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Unknown Date';

    async function handleRegister() {
        if (!user.userUID) {
            dispatch(openSignupModal())
            return
        }
        try {
            await Promise.all([
                updateDoc(doc(db, 'users', String(user.userUID)), {
                    userMeetups: arrayUnion(event.eventUID),
                }),
                updateDoc(doc(db, 'events', event.eventUID), {
                    eventMembers: arrayUnion(user.userUID),
                }),
            ]);

            dispatch(setUser({
                ...user,
                userMeetups: [...user.userMeetups, event.eventUID],
            }));

            router.refresh();
        } catch (error) {
            console.error("Error registering for meetup:", error);
        }
    }

    async function handleUnregister() {
        try {
            await Promise.all([
                updateDoc(doc(db, 'users', String(user.userUID)), {
                    userMeetups: arrayRemove(event.eventUID),
                }),
                updateDoc(doc(db, 'events', event.eventUID), {
                    eventMembers: arrayRemove(user.userUID),
                }),
            ]);

            dispatch(setUser({
                ...user,
                userMeetups: user.userMeetups.filter(meetup => meetup !== event.eventUID),
            }));

            router.refresh();
        } catch (error) {
            console.error("Error unregistering for meetup:", error);
        }
    }

    return (
        <div className='bg-dark-800 p-3 w-[32%] m-1 rounded'>
            <Image src={event.eventImageSrc} height={200} width={200} alt='' className='w-full h-[200px] object-cover rounded-sm' />
            <h2 className='font-medium mt-2'>{event.eventTitle}</h2>
            <p className='text-white-800 text-sm truncate'>{event.eventDescription}</p>
            <div className='border-b border-dark-700 pb-4'>
                <div className='mt-3 bg-dark-700 rounded p-2'>
                    <h3>{formattedEventDate}</h3>
                    <p className='text-xs text-white-800 flex items-center mt-1'>
                        Location
                        <span className='h-[2px] w-[2px] bg-white-800 mx-1' />
                        {event.eventLocation}
                    </p>
                    {/* <p className='text-xs text-white-800'>image mapping</p> */}
                    {/* MAGIC UI */}
                </div>
            </div>
            {hasJoined ?
                <button className='border border-dark-400 w-full text-sm rounded py-2 mt-4' onClick={handleUnregister}>Unregister Now</button>
                :
                <button className='bg-brand-500 w-full text-sm rounded py-2 mt-4' onClick={handleRegister}>Register Now</button>
            }
        </div>
    )
}

export default EventCard;