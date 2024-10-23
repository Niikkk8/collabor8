import { Community } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export default function CommunitiesCard({ community }: { community: Community }) {
    return (
        <div className='bg-dark-800 p-3 my-2 w-full rounded-lg'>
            <Image src={community.communityBannerSrc} height={120} width={120} alt='' className='w-full h-[120px] rounded object-cover' />
            <Image src={community.communityProfileSrc} height={80} width={80} alt='' className='h-[80px] w-[80px] mt-[-36px] rounded-full ml-2' />
            <div className="flex justify-between items-center my-4">
                <div className='w-1/2'>
                    <h3 className='font-semibold truncate'>{community.communityName}</h3>
                    <p className='text-xs'>{community.communityMembers.length} members</p>
                </div>
                <Link href={`/communities/${community.communityUID}`} className='text-sm px-6 py-2 h-fit bg-brand-500 rounded'>View Community</Link>
            </div>
        </div>
    );
}
