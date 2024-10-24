'use client';

import CommunitiesCard from '@/components/communities/CommunitiesCard';
import { db } from '@/firebase';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setUser } from '@/redux/userSlice';
import { Community, User } from '@/types';
import { addDoc, arrayUnion, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function CommunitiesPage() {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state) => state.user)

  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
  const [displayAllCommunities, setDisplayAllCommunities] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Community>({
    communityUID: '',
    communityName: '',
    communityDescription: '',
    communityCreatedAt: new Date(),
    communityMembers: [],
    communityAdmin: user.userUID,
    communityProfileSrc: '/assets/placeholder-images/developer.jpg',
    communityBannerSrc: '/assets/placeholder-images/community-banner.jpg'
  });

  const communities = [
    { title: 'Tech Mentors', profileURL: '/assets/placeholder-images/developer.jpg', banner: '/assets/placeholder-images/community-banner.jpg', members: '18k' },
    { title: 'The Self Improvement Arc', profileURL: '/assets/placeholder-images/self-improvement.jpeg', banner: '/assets/placeholder-images/community-banner.jpg', members: '20k' },
    { title: 'Code Wizards', profileURL: '/assets/placeholder-images/developer.jpg', banner: '/assets/placeholder-images/community-banner.jpg', members: '30k' },
  ];

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
  }, [user.userCommunities]);

  console.log(joinedCommunities)

  const visibleCommunities = displayAllCommunities
    ? joinedCommunities
    : joinedCommunities.slice(0, 3);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const docRef = await addDoc(collection(db, 'communities'), {
        communityName: formData.communityName,
        communityDescription: formData.communityDescription,
        communityCreatedAt: new Date(),
        communityMembers: formData.communityMembers,
        communityAdmin: formData.communityAdmin,
        communityProfileSrc: formData.communityProfileSrc,
        communityBannerSrc: formData.communityBannerSrc
      });

      const newCommunityID = docRef.id;

      await updateDoc(doc(db, 'users', user.userUID), {
        userCommunities: arrayUnion(newCommunityID),
      });

      await updateDoc(doc(db, 'communities', newCommunityID), {
        communityMembers: arrayUnion(user.userUID)
      })

      dispatch(setUser({
        ...user,
        userCommunities: [...user.userCommunities, newCommunityID],
      }));

      setIsModalOpen(false);

      setFormData({
        communityUID: '',
        communityName: '',
        communityDescription: '',
        communityCreatedAt: new Date(),
        communityMembers: [],
        communityAdmin: user.userUID,
        communityProfileSrc: '',
        communityBannerSrc: ''
      });

    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };


  return (
    <main className='min-h-screen p-6 overflow-auto !no-scrollbar'>
      <div className="flex items-center py-2 my-4 min-w-fit">
        <p className="text-sm text-white-800">Want to create your own community?</p>
        <div className="flex-grow ml-2 h-[1px] bg-dark-700" />
        <button className='bg-brand-500 px-6 py-2 rounded mx-2' onClick={() => setIsModalOpen(true)}>
          Create Community
        </button>
      </div>

      <div className='border-b border-dark-700 pb-6'>
        <h2 className='text-lg font-medium'>Communities you&apos;ve joined</h2>
        <p className='text-xs text-white-800 mb-2'>View all the communities you&apos;ve joined</p>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : joinedCommunities.length === 0 ? (
          <p className="text-white-6  00 bg-dark-700 w-fit py-2 px-6 rounded mt-6">You have not joined any communities yet.</p>
        ) : (
          <div className='flex flex-wrap justify-between'>
            {visibleCommunities.map((community) => (
              <div key={community.communityUID} className='w-[32%] mx-2'>
                <CommunitiesCard community={community} />
              </div>
            ))}
          </div>
        )}

        {joinedCommunities.length > 3 && (
          <div className='text-center'>
            {!displayAllCommunities && (
              <button
                className='mt-4 text-sm rounded hover:bg-gray-800 px-3 py-1'
                onClick={() => setDisplayAllCommunities(true)}
              >
                View All Communities
              </button>
            )}
          </div>
        )}
      </div>

      {/* <div className='border-b border-dark-700 py-6'>
        <h2 className='text-lg font-medium'>Communities</h2>
        <p className='text-xs text-white-800 mb-2'>Browse most popular communities</p>
        <div className='flex flex-wrap justify-between'>
          {communities.map((community: any, index: number) => (
            <div key={index} className='w-[32%] mx-2'>
              <CommunitiesCard community={community} />
            </div>
          ))}
        </div>
      </div> */}

      {isModalOpen && (
        <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full">
          <div
            className="fixed top-0 left-0 w-full h-full bg-black opacity-50"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-[50%] min-w-[280px] max-w-[520px] px-6 py-12 bg-white-500 flex flex-col items-center justify-center rounded-lg overflow-hidden">
            <span
              onClick={() => setIsModalOpen(false)}
              className="absolute cursor-pointer top-5 right-5 px-[10px] py-[3px] rounded-full bg-red-500"
            >
              X
            </span>

            <form className="flex flex-col w-full text-dark-800 mb-6" onSubmit={handleSubmit}>
              <label className="text-sm mb-2">Community Name</label>
              <input
                type="text"
                name="communityName"
                value={formData.communityName}
                onChange={handleInputChange}
                required
                className="mb-4 p-2 border border-gray-400 rounded"
              />

              <label className="text-sm mb-2">Community Description</label>
              <textarea
                name="communityDescription"
                value={formData.communityDescription}
                onChange={handleInputChange}
                required
                className="mb-4 p-2 border border-gray-400 rounded"
              />

              <button type="submit" className="bg-brand-500 px-6 py-2 rounded text-white-500">
                Create Community
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
