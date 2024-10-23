'use client'

import { useAppSelector } from '@/redux/hooks'
import { User } from '@/types'
import React from 'react'

export default function CommunityActionButton({ communityId, communityAdmin }: { communityId: string, communityAdmin: string }) {
    const user: User = useAppSelector(state => state.user)
    const hasJoined: boolean = user.userCommunities.includes(communityId)
    const isAdmin: boolean = user.userUID === communityAdmin
    return (
        <>
            {
                hasJoined ?
                    <button className='bg-brand-500 px-6 py-2 rounded text-sm w-1/2'>Join Community</button>
                    :
                    <>
                        {isAdmin ?
                            <button className='bg-red-500 px-4 py-2 rounded text-sm w-1/2'>Delete Community</button>
                            :
                            <button className='border px-4 py-2 rounded text-sm w-1/2'>Leave Community</button>
                        }
                    </>
            }
        </>
    )
}
