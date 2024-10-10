import React, { useCallback, useState, useEffect, useRef } from "react";
import Image from 'next/image';
import Link from 'next/link';
import debounce from 'lodash/debounce';
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { User } from "@/types";

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.length < 2) {
        setSearchResults([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(query(usersRef));
        const users: User[] = [];
        const searchTermLower = term.toLowerCase();

        snapshot.forEach((doc) => {
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

        if (users.length === 0) {
          setError('No users found');
        }

        setSearchResults(users);
      } catch (error) {
        console.error("Error searching users:", error);
        setError('An error occurred while searching');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm)
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
        setSearchResults([]);
        setSearchTerm('');
        setError(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='px-6 py-4 flex justify-between w-full border-b border-dark-700'>
      <div ref={searchRef} className='relative flex items-center bg-dark-800 py-3 px-4 rounded w-full mr-20'>
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
          placeholder='Search users...'
          value={searchTerm}
          onChange={handleSearch}
        />
        {(searchResults.length > 0 || loading || error) && (
          <div className="absolute top-full left-0 w-full bg-dark-900 mt-2 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="mt-2 text-gray-300">Searching...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-gray-400">{error}</div>
            ) : (
              searchResults.map((user) => (
                <Link
                  href={`/profile/${user.userUID}`}
                  key={String(user.userUID)}
                  onClick={() => {
                    setSearchResults([]);
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
              ))
            )}
          </div>
        )}
      </div>
      <div className='flex items-center min-w-fit'>
        <div className='p-3 rounded-lg mx-2 bg-dark-800'>
          <Image
            src='/assets/svgs/searchbar-messages.svg'
            alt="Messages Icon"
            width={22}
            height={22}
            className='w-[22px] h-[22px]'
          />
        </div>
        <div className='p-3 rounded-lg mx-2 bg-dark-800'>
          <Image
            src='/assets/svgs/searchbar-saved.svg'
            alt="Saved Icon"
            width={22}
            height={22}
            className='w-[22px] h-[22px]'
          />
        </div>
        <div className='flex items-center ml-4'>
          <Image
            src="/assets/placeholder-images/profile-picture.jpg"
            alt="User Profile Picture"
            width={48}
            height={48}
            className='object-cover rounded-full aspect-square'
          />
          <h3 className='text-sm mx-2 text-white'>Niket Shah</h3>
          <Image
            src='/assets/svgs/searchbar-dropdown.svg'
            alt="Dropdown Icon"
            width={18}
            height={18}
            className='w-[18px] h-[18px]'
          />
        </div>
      </div>
    </div>
  );
}