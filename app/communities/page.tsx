'use client';

import CommunitiesCard from '@/components/communities/CommunitiesCard';
import { db, storage } from '@/firebase';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { openSignupModal } from '@/redux/modalSlice';
import { setUser } from '@/redux/userSlice';
import { Community, User } from '@/types';
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const generateSimpleId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export default function CommunitiesPage() {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state) => state.user)
  const isAuthenticated = user?.userUID;

  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
  const [notJoinedCommunities, setNotJoinedCommunities] = useState<Community[]>([]);
  const [displayAllCommunities, setDisplayAllCommunities] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>('/assets/placeholder-images/developer.jpg');
  const [bannerPreview, setBannerPreview] = useState<string>('/assets/placeholder-images/community-banner.jpg');
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
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

    const fetchNotJoinedCommunities = async () => {
      setLoading(true);
      setError(null);

      try {
        let q;
        if (!user.userCommunities || user.userCommunities.length === 0) {
          q = query(collection(db, 'communities'));
        } else {
          q = query(
            collection(db, 'communities'),
            where('communityMembers', 'not-in', [user.userUID])
          );
        }

        const querySnapshot = await getDocs(q);
        const communitiesData: Community[] = [];

        querySnapshot.forEach((doc) => {
          if (!user.userCommunities?.includes(doc.id)) {
            communitiesData.push({
              ...doc.data(),
              communityUID: doc.id,
            } as Community);
          }
        });

        const sortedCommunities = communitiesData.sort((a, b) =>
          (b.communityMembers?.length || 0) - (a.communityMembers?.length || 0)
        );

        setNotJoinedCommunities(sortedCommunities);
      } catch (error) {
        console.error('Error fetching not joined communities:', error);
        setError('An error occurred while fetching communities');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
    fetchNotJoinedCommunities();
  }, [user.userCommunities, user.userUID]);

  const handleCreateCommunityClick = () => {
    if (!isAuthenticated) {
      dispatch(openSignupModal());
    } else {
      setIsModalOpen(true);
    }
  };
  const visibleCommunities = displayAllCommunities
    ? joinedCommunities
    : joinedCommunities.slice(0, 3);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const uploadImage = async (file: File, type: 'profile' | 'banner'): Promise<string> => {
    try {
      const imageFileName = `${generateSimpleId()}-${file.name}`;
      const imageRef = ref(storage, `communities/${type}/${imageFileName}`);
      const uploadResult = await uploadBytes(imageRef, file);
      return await getDownloadURL(uploadResult.ref);
    } catch (err) {
      console.error(`Error uploading ${type} image:`, err);
      throw new Error(`Failed to upload ${type} image`);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, imageType: 'profile' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
          throw new Error('Please select a valid image file (JPEG, PNG, or GIF)');
        }

        if (file.size > maxSize) {
          throw new Error('File size should be less than 5MB');
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const imageUrl = reader.result as string;
          if (imageType === 'profile') {
            setProfilePreview(imageUrl);
            setProfileFile(file);
          } else {
            setBannerPreview(imageUrl);
            setBannerFile(file);
          }
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error selecting image');
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let profileUrl = formData.communityProfileSrc;
      let bannerUrl = formData.communityBannerSrc;

      if (profileFile) {
        profileUrl = await uploadImage(profileFile, 'profile');
      }

      if (bannerFile) {
        bannerUrl = await uploadImage(bannerFile, 'banner');
      }

      const docRef = await addDoc(collection(db, 'communities'), {
        communityName: formData.communityName,
        communityDescription: formData.communityDescription,
        communityCreatedAt: new Date(),
        communityMembers: [user.userUID],
        communityAdmin: user.userUID,
        communityProfileSrc: profileUrl,
        communityBannerSrc: bannerUrl
      });

      const newCommunityID = docRef.id;

      await updateDoc(doc(db, 'users', user.userUID), {
        userCommunities: arrayUnion(newCommunityID),
      });

      dispatch(setUser({
        ...user,
        userCommunities: [...(user.userCommunities || []), newCommunityID],
      }));

      setIsModalOpen(false);
      setProfilePreview('/assets/placeholder-images/developer.jpg');
      setBannerPreview('/assets/placeholder-images/community-banner.jpg');
      setProfileFile(null);
      setBannerFile(null);
      setFormData({
        communityUID: '',
        communityName: '',
        communityDescription: '',
        communityCreatedAt: new Date(),
        communityMembers: [],
        communityAdmin: user.userUID,
        communityProfileSrc: '/assets/placeholder-images/developer.jpg',
        communityBannerSrc: '/assets/placeholder-images/community-banner.jpg'
      });

    } catch (error) {
      console.error('Error creating community: ', error);
      setError(error instanceof Error ? error.message : 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };



  return (
    <main className='min-h-screen p-6 overflow-auto !no-scrollbar'>
      <div className="flex items-center py-2 my-4 min-w-fit">
        <p className="text-sm text-white-800">Want to create your own community?</p>
        <div className="flex-grow ml-2 h-[1px] bg-dark-700" />
        <button
          className='bg-brand-500 px-6 py-2 rounded mx-2 min-w-fit'
          onClick={handleCreateCommunityClick}
        >
          Create Community
        </button>
      </div>

      <div className='border-b border-dark-700 pb-6'>
        <h2 className='text-lg font-medium'>
          {isAuthenticated ? "Communities you've joined" : "Join communities"}
        </h2>
        <p className='text-xs text-white-800 mb-2'>
          {isAuthenticated
            ? "View all the communities you've joined"
            : "Sign in to join and create communities"
          }
        </p>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : isAuthenticated && joinedCommunities.length === 0 ? (
          <p className="text-white-600 bg-dark-700 w-fit py-2 px-6 rounded mt-6">
            You have not joined any communities yet.
          </p>
        ) : (
          <div className='flex flex-wrap'>
            {visibleCommunities.map((community) => (
              <div key={community.communityUID} className='w-full md:w-[32%] mx-2'>
                <CommunitiesCard community={community} user={user} />
              </div>
            ))}
          </div>
        )}

        {isAuthenticated && joinedCommunities.length > 3 && (
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

      <div className='border-b border-dark-700 py-6'>
        <h2 className='text-lg font-medium'>Discover Communities</h2>
        <p className='text-xs text-white-800 mb-2'>Browse popular communities you haven&apos;t joined yet</p>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : notJoinedCommunities.length === 0 ? (
          <p className="text-white-600 bg-dark-700 w-fit py-2 px-6 rounded mt-6">
            No new communities to join at the moment.
          </p>
        ) : (
          <div className='flex flex-wrap'>
            {notJoinedCommunities.slice(0, 6).map((community) => (
              <div key={community.communityUID} className='w-full md:w-[32%] mx-2'>
                <CommunitiesCard community={community} user={user} />
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && isAuthenticated && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-dark-800 rounded-lg shadow-xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-dark-600 transition-colors"
            >
              <p className="cursor-pointer px-[10px] py-[3px] rounded-full bg-red-500">X</p>
            </button>
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-white-500 mb-6">Create Community</h2>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="communityName" className="block text-sm font-medium text-white-300">
                    Community Name
                  </label>
                  <input
                    type="text"
                    name="communityName"
                    value={formData.communityName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-md text-white-500 placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Enter community name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="communityDescription" className="block text-sm font-medium text-white-300">
                    Community Description
                  </label>
                  <textarea
                    name="communityDescription"
                    value={formData.communityDescription}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-md text-white-500 placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Describe your community..."
                  />
                </div>

                <div className="space-y-4">
                  {/* Community Profile Picture */}
                  <div>
                    <label className="block text-sm font-medium text-white-300 mb-2">
                      Community Profile Picture
                    </label>
                    <div className="flex items-center space-x-4">
                      <img
                        src={profilePreview}
                        alt="Profile preview"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <input
                        type="file"
                        id="profileImage"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'profile')}
                        className="hidden"
                      />
                      <label
                        htmlFor="profileImage"
                        className="inline-flex items-center cursor-pointer"
                      >
                        <div className="flex items-center bg-dark-700 px-4 py-2 rounded-lg hover:bg-dark-600 border border-dark-500">
                          <Image
                            src="/assets/svgs/input-camera.svg"
                            alt="Upload Profile Picture"
                            width={20}
                            height={20}
                            className="mr-2"
                          />
                          <span className="text-sm">
                            {profilePreview ? 'Change Image' : 'Upload Image'}
                          </span>
                        </div>
                      </label>
                    </div>
                    {profilePreview && (
                      <p className="text-sm text-green-500 mt-2">
                        ✓ Image selected
                      </p>
                    )}
                  </div>

                  {/* Community Banner */}
                  <div>
                    <label className="block text-sm font-medium text-white-300 mb-2">
                      Community Banner
                    </label>
                    <div className="flex items-center space-x-4">
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="w-32 h-16 rounded object-cover"
                      />
                      <input
                        type="file"
                        id="bannerImage"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'banner')}
                        className="hidden"
                      />
                      <label
                        htmlFor="bannerImage"
                        className="inline-flex items-center cursor-pointer"
                      >
                        <div className="flex items-center bg-dark-700 px-4 py-2 rounded-lg hover:bg-dark-600 border border-dark-500">
                          <Image
                            src="/assets/svgs/input-camera.svg"
                            alt="Upload Banner"
                            width={20}
                            height={20}
                            className="mr-2"
                          />
                          <span className="text-sm">
                            {bannerPreview ? 'Change Image' : 'Upload Image'}
                          </span>
                        </div>
                      </label>
                    </div>
                    {bannerPreview && (
                      <p className="text-sm text-green-500 mt-2">
                        ✓ Image selected
                      </p>
                    )}
                  </div>
                </div>


                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-brand-500 text-white-500 rounded-md font-medium hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-dark-800"
                  >
                    Create Community
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}