import React, { useCallback, useState, useEffect, useRef } from "react";
import Image from 'next/image';
import Link from 'next/link';
import debounce from 'lodash/debounce';
import { collection, query, getDocs } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { User, Community } from "@/types";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { signOut } from "firebase/auth";
import { signOutUser } from "@/redux/userSlice";
import { openSignupModal } from "@/redux/modalSlice";

export default function SearchBar() {
  const user: User = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [userResults, setUserResults] = useState<User[]>([]);
  const [communityResults, setCommunityResults] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const isAuthenticated: boolean = user.userUID ? true : false;

  const searchRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.length < 2) {
        setUserResults([]);
        setCommunityResults([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const usersRef = collection(db, "users");
        const userSnapshot = await getDocs(query(usersRef));
        const users: User[] = [];
        const searchTermLower = term.toLowerCase();

        userSnapshot.forEach((doc) => {
          const userData = doc.data() as User;
          const userUID = doc.id;
          const matchesSearch =
            userData.userID?.toLowerCase().includes(searchTermLower) ||
            userData.userFirstName?.toLowerCase().includes(searchTermLower) ||
            userData.userLastName?.toLowerCase().includes(searchTermLower);

          if (matchesSearch) {
            users.push({ ...userData, userUID });
          }
        });

        setUserResults(users);

        const communitiesRef = collection(db, "communities");
        const communitySnapshot = await getDocs(query(communitiesRef));
        const communities: Community[] = [];

        communitySnapshot.forEach((doc) => {
          const communityData = doc.data() as Community;
          const communityUID = doc.id;
          const matchesCommunitySearch = communityData.communityName?.toLowerCase().includes(searchTermLower);

          if (matchesCommunitySearch) {
            communities.push({ ...communityData, communityUID });
          }
        });

        setCommunityResults(communities);

        if (users.length === 0 && communities.length === 0) {
          setError('No users or communities found');
        }
      } catch (error) {
        console.error("Error searching:", error);
        setError('An error occurred while searching');
        setUserResults([]);
        setCommunityResults([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setUserResults([]);
        setCommunityResults([]);
        setSearchTerm('');
        setError(null);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  async function handleSignOut() {
    try {
      await signOut(auth);
      dispatch(signOutUser());
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('An unexpected error occurred during sign out');
      }
    }
  };

  return (
    <div className='px-6 py-4 flex justify-between w-full border-b border-dark-700'>
      <div ref={searchRef} className='relative flex items-center bg-dark-800 py-3 px-4 rounded w-full lg:mr-20'>
        <Image
          src='/assets/svgs/searchbar-search.svg'
          alt="Search Icon"
          width={20}
          height={20}
          className='w-[20px] h-[20px]'
        />
        <input
          type="text"
          className='bg-transparent outline-none w-full ml-3 text-sm text-white placeholder-gray-400'
          placeholder='Search users or communities...'
          value={searchTerm}
          onChange={handleSearch}
        />
        {(userResults.length > 0 || communityResults.length > 0 || loading || error) && (
          <div className="absolute top-full left-0 w-full bg-dark-900 mt-2 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="mt-2 text-gray-300">Searching...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-gray-400">{error}</div>
            ) : (
              <>
                {userResults.length > 0 && (
                  <div>
                    <h4 className="text-gray-400 px-4 py-2 border-b border-dark-700">Users</h4>
                    {userResults.map((user) => (
                      <Link
                        href={`/profile/${user.userUID}`}
                        key={String(user.userUID)}
                        onClick={() => {
                          setUserResults([]);
                          setSearchTerm('');
                          setError(null);
                        }}
                      >
                        <div className="hover:bg-dark-800 transition-colors duration-200 flex items-center p-4">
                          <Image
                            src={String(user.userProfilePictureSrc) || "/assets/placeholder-images/profile-picture.jpg"}
                            alt={`${user.userFirstName} ${user.userLastName}`}
                            width={60}
                            height={60}
                            className="rounded-full aspect-square object-cover"
                          />
                          <div className="ml-4">
                            <h3 className="font-semibold text-white">
                              {user.userFirstName} {user.userLastName}
                            </h3>
                            <p className="text-sm text-gray-400">@{user.userID}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {communityResults.length > 0 && (
                  <div>
                    <h4 className="text-gray-400 px-4 py-2 border-b border-dark-700">Communities</h4>
                    {communityResults.map((community) => (
                      <Link
                        href={`/communities/${community.communityUID}`}
                        key={String(community.communityUID)}
                        onClick={() => {
                          setCommunityResults([]);
                          setSearchTerm('');
                          setError(null);
                        }}
                      >
                        <div className="hover:bg-dark-800 transition-colors duration-200 flex items-center p-4">
                          <Image
                            src={String(community.communityProfileSrc) || "/assets/placeholder-images/profile-picture.jpg"}
                            alt={`${community.communityName}`}
                            width={60}
                            height={60}
                            className="rounded-full aspect-square object-cover"
                          />
                          <div className="ml-4">
                            <h3 className="font-semibold text-white">
                              {community.communityName}
                            </h3>
                            <p className="text-sm text-gray-400">{community.communityDescription}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      <div className='flex items-center min-w-fit'>
        {isAuthenticated ? (
          <>
            <div className='p-3 rounded-lg mx-2 bg-dark-800 hidden md:block'>
              <Image
                src='/assets/svgs/searchbar-messages.svg'
                alt="Messages Icon"
                width={22}
                height={22}
                className='w-[22px] h-[22px]'
              />
            </div>
            <div className='p-3 rounded-lg mx-2 bg-dark-800 hidden md:block'>
              <Image
                src='/assets/svgs/searchbar-saved.svg'
                alt="Saved Icon"
                width={22}
                height={22}
                className='w-[22px] h-[22px]'
              />
            </div>
            <div ref={profileDropdownRef} className="relative">
              <div
                className='flex items-center ml-4 cursor-pointer'
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <Image
                  src={user.userProfilePictureSrc || '/assets/placeholder-images/profile-picture.jpg'}
                  alt="User Profile Picture"
                  width={48}
                  height={48}
                  className='object-cover rounded-full aspect-square mr-2 md:m-0'
                />
                <h3 className='hidden md:block text-sm ml-2 mr-1 text-white'>{user.userFirstName} {user.userLastName}</h3>
                <Image
                  src='/assets/svgs/searchbar-dropdown.svg'
                  alt="Dropdown Icon"
                  width={18}
                  height={18}
                  className={`w-[18px] h-[18px] transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                />
              </div>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-dark-900 shadow-lg py-1 z-[1000]">
                  <div className="px-4 py-2 text-sm text-red-500 hover:bg-dark-800 cursor-pointer flex items-center" onClick={handleSignOut}>
                    Sign Out
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={() => dispatch(openSignupModal())}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
}