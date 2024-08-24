'use client';

import CommunitiesCard from '@/components/communities/CommunitiesCard';
import { useState } from 'react';

export default function CommunitiesPage() {
  const [displayAllCommunities, setDisplayAllCommunities] = useState<boolean>(false);

  const communities = [
    { title: 'Tech Mentors', profileURL: '/assets/placeholder-images/developer.jpg', banner: '/assets/placeholder-images/community-banner.jpg', members: '18k' },
    { title: 'The Self Improvement Arc', profileURL: '/assets/placeholder-images/self-improvement.jpeg', banner: '/assets/placeholder-images/community-banner.jpg', members: '20k' },
    { title: 'Code Wizards', profileURL: '/assets/placeholder-images/developer.jpg', banner: '/assets/placeholder-images/community-banner.jpg', members: '30k' },
    { title: 'Wellness Warriors', profileURL: '/assets/placeholder-images/self-improvement.jpeg', banner: '/assets/placeholder-images/community-banner.jpg', members: '27k' },
    { title: 'AI Pioneers', profileURL: '/assets/placeholder-images/developer.jpg', banner: '/assets/placeholder-images/community-banner.jpg', members: '15k' },
    { title: 'Mindful Growth', profileURL: '/assets/placeholder-images/self-improvement.jpeg', banner: '/assets/placeholder-images/community-banner.jpg', members: '22k' },
    { title: 'Future Coders', profileURL: '/assets/placeholder-images/developer.jpg', banner: '/assets/placeholder-images/community-banner.jpg', members: '28k' },
  ];

  // Show either the first 3 communities or all, based on the state
  const visibleCommunities = displayAllCommunities ? communities : communities.slice(0, 3);

  return (
    <main className='min-h-screen p-6 overflow-auto !no-scrollbar'>
      <div className='border-b border-dark-700 pb-6'>
        <h2 className='text-lg font-medium'>Communities you&apos;ve joined</h2>
        <p className='text-xs text-white-800 mb-2'>View all the communities you&apos;ve joined</p>
        <div className='flex flex-wrap justify-between'>
          {visibleCommunities.map((community: any, index: number) => (
            <div key={index} className='w-[32%] mx-2'>
              <CommunitiesCard community={community} />
            </div>
          ))}
        </div>
        <div className='text-center'>
          {!displayAllCommunities && (
            <button
              className='mt-4 text-xs rounded hover:bg-gray-700 px-2 py-1'
              onClick={() => setDisplayAllCommunities(true)}
            >
              View All
            </button>
          )}
        </div>
      </div>
      <div className='border-b border-dark-700 py-6'>
        <h2 className='text-lg font-medium'>Communities</h2>
        <p className='text-xs text-white-800 mb-2'>Browse most popular communities</p>
        <div className='flex flex-wrap justify-between'>
          {communities.map((community: any, index: number) => (
            <div key={index} className='w-[32%] mx-2'>
              <CommunitiesCard community={community} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
