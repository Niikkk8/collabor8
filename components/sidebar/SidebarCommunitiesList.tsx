import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Community, User } from '@/types';
import { useAppSelector } from '@/redux/hooks';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import Link from 'next/link';

export default function SidebarCommunitiesList() {
    const user: User = useAppSelector((state) => state.user)
    const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCommunities = async () => {
            if (!user.userCommunities || user.userCommunities.length === 0) {
                setJoinedCommunities([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const communitiesData: Community[] = [];

                for (const communityID of user.userCommunities) {
                    const communityRef = doc(db, 'communities', communityID);
                    const communitySnap = await getDoc(communityRef);

                    if (communitySnap.exists()) {
                        communitiesData.push({
                            ...communitySnap.data(),
                            communityUID: communityID,
                        } as Community);
                    }
                }

                setJoinedCommunities(communitiesData);
            } catch (error) {
                console.error('Error fetching joined communities:', error);
                setError('An error occurred while fetching communities');
            } finally {
                setLoading(false);
            }
        };

        fetchCommunities();
    }, [user.userCommunities, user.userUID]);

    return (
        <div className="p-6">
            <h3 className="text-sm text-white-800">Communities you&apos;ve joined</h3>
            <div className="border-b border-dark-700 pb-2 mt-2">
                {joinedCommunities.slice(0, 2).map((community, index) => (
                    <div
                        className="flex items-center px-4 py-2 hover:bg-gray-500 hover:bg-opacity-20 hover:duration-300 rounded cursor-pointer"
                        key={index}
                    >
                        <Image
                            src={community.communityProfileSrc}
                            alt=""
                            width={48}
                            height={48}
                            className='object-cover rounded-full aspect-square'
                        />
                        <h3 className="text-sm font-medium ml-2">{community.communityName}</h3>
                    </div>
                ))}
            </div>
            <div className="flex justify-end">
                <Link href={'/communities'} className="text-[11px] cursor-pointer mt-2 mr-2 py-1 px-3 hover:bg-gray-700 hover:bg-opacity-40 hover:duration-300 w-fit rounded">
                    View All
                </Link>
            </div>
        </div>
    );
}
