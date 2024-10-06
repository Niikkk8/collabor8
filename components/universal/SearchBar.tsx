import React, { useCallback, useState, useEffect } from "react";
import Image from 'next/image';
import Link from 'next/link';
import debounce from 'lodash/debounce';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { User } from "@/types";


export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);

      try {
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          where("userID", ">=", term),
          where("userID", "<=", term + "\uf8ff")
        );

        const querySnapshot = await getDocs(q);
        const users: User[] = [];

        querySnapshot.forEach((doc) => {
          const userData = doc.data() as User;
          users.push({ ...userData, userUID: doc.id });
        });
        setSearchResults(users);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 750),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className='px-6 py-4 flex justify-between w-full border-b border-dark-700'>
      <div className='relative flex items-center bg-dark-800 py-3 px-4 rounded w-full mr-20'>
        <Image
          src='/assets/svgs/searchbar-search.svg'
          alt=""
          width={20}
          height={20}
          className='w-[20px] h-[20px]'
        />
        <input
          type="text"
          className='bg-transparent outline-none w-full ml-3 text-sm'
          placeholder='Search...'
          value={searchTerm}
          onChange={handleSearch}
        />
        {(searchResults.length > 0 || loading) && (
          <div className="absolute top-full left-0 w-full bg-dark-900 mt-2 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : (
              searchResults.map((user) => (
                <Link href={`/profile/${user.userUID}`} key={String(user.userUID)} className="block hover:bg-dark-800 transition-colors duration-200">
                  <div className="flex items-center p-4">
                    <Image
                      src={String(user.userProfilePictureSrc) || "/assets/placeholder-images/profile-picture.jpg"}
                      alt={`${user.userFirstName} ${user.userLastName}`}
                      width={60}
                      height={60}
                      className="rounded-full aspect-square object-cover"
                    />
                    <div className="ml-4">
                      <h3 className="font-semibold">{user.userFirstName} {user.userLastName}</h3>
                      <p className="text-sm text-gray-400">{user.userID}</p>
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
            alt=""
            width={22}
            height={22}
            className='w-[22px] h-[22px]'
          />
        </div>
        <div className='p-3 rounded-lg mx-2 bg-dark-800'>
          <Image
            src='/assets/svgs/searchbar-saved.svg'
            alt=""
            width={22}
            height={22}
            className='w-[22px] h-[22px]'
          />
        </div>
        <div className='flex items-center ml-4'>
          <Image
            src="/assets/placeholder-images/profile-picture.jpg"
            alt=""
            width={48}
            height={48}
            className='object-cover rounded-full aspect-square'
          />
          <h3 className='text-sm mx-2'>Niket Shah</h3>
          <Image
            src='/assets/svgs/searchbar-dropdown.svg'
            alt=""
            width={18}
            height={18}
            className='w-[18px] h-[18px]'
          />
        </div>
      </div>
    </div>
  );
}