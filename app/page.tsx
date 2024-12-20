'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Post from '@/components/ui-elements/Post';
import PostInput from '@/components/ui-elements/PostInput';
import Link from 'next/link';
import { useAppSelector } from '@/redux/hooks';
import { Post as PostType, User } from '@/types';

interface NewsArticle {
  link: string;
  image_url: string;
  title: string;
  source_icon: string;
  source_name: string;
  pubDate: string;
}

interface Event {
  imageSrc: string;
  title: string;
  date: string;
  location: string;
}

export default function Home() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser: User = useAppSelector((state) => state.user);

  const upcomingEvents: Event[] = [
    {
      imageSrc: "/assets/placeholder-images/individual-event.jpeg",
      title: "Strategies for Revenue Boost: E-commerce Excellence",
      date: "Tuesday, 24th August",
      location: "Online",
    },
    {
      imageSrc: "/assets/placeholder-images/individual-event.jpeg",
      title: "Strategies for Revenue Boost: E-commerce Excellence",
      date: "Tuesday, 24th August",
      location: "Online",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!currentUser?.userUID) {
          console.error('No user found');
          return;
        }

        const params = new URLSearchParams({
          userUID: currentUser.userUID,
          userFollowing: JSON.stringify(currentUser.userFollowing || []),
          userCommunities: JSON.stringify(currentUser.userCommunities || [])
        });

        const response = await fetch(`/api/home?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch data');
        }

        setPosts(data.posts);
        setNewsArticles(data.newsArticles);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setPosts([]);
    setIsLoading(true);
    fetchData();
  }, [currentUser]);

  const handlePostCreated = (newPost: PostType) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  return (
    <main className="flex h-screen overflow-hidden">
      <div className="w-full lg:w-3/4 border-r border-dark-700 py-4 px-6 overflow-y-scroll no-scrollbar">
        <PostInput
          inputPlaceholder={"What's on your mind?"}
          onPostCreated={handlePostCreated}
        />
        <div className="flex items-center p-2 mt-4 min-w-fit">
          <span className="text-sm text-white-800">Sort By: </span>
          <p className="flex items-center text-sm ml-2">
            Following
            <Image src="/assets/svgs/searchbar-dropdown.svg" alt="" width={14} height={14} className="ml-1" />
          </p>
          <div className="flex-grow ml-2 h-[1px] bg-dark-700" />
        </div>
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <Post key={post.postUID} post={post} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              No posts to show. Start following people or join communities to see posts!
            </div>
          )}
        </div>
      </div>
      <div className="hidden lg:block w-1/4 max-h-screen overflow-y-scroll no-scrollbar p-6">
        <h4 className="text-sm text-white-800">What&apos;s happening today!</h4>
        <div className="border-b border-dark-700 pb-4">
          {newsArticles.map((article, index) => (
            <Link href={article.link} target='_blank' key={index}>
              <div className="my-3 relative">
                <Image
                  src={article.image_url}
                  alt={article.title}
                  width={300}
                  height={200}
                  className="object-cover w-full h-48 rounded"
                />
                <div
                  className="absolute bottom-0 w-full h-full rounded"
                  style={{
                    background: "linear-gradient(360deg, rgba(0, 0, 0, 0.87) 0%, rgba(0, 0, 0, 0.57) 52.54%, rgba(0, 0, 0, 0.17) 78.05%, rgba(0, 0, 0, 0) 100%)",
                  }}
                />
                <div className="absolute bottom-0 w-full">
                  <div className="relative p-4">
                    <h3
                      className="font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis"
                      style={{ width: 'calc(100% - 16px)' }}
                    >
                      {article.title}
                    </h3>
                    <div className="flex items-center mt-1">
                      <Image
                        src={article.source_icon}
                        alt="Source Icon"
                        width={32}
                        height={32}
                        className="mr-1 rounded-full"
                      />
                      <div className="ml-1">
                        <p className="text-sm font-medium text-white">{article.source_name}</p>
                        <p className="text-xs text-gray-300">{article.pubDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="pt-4">
          <h4 className="text-sm text-white-800">Upcoming Events</h4>
          {upcomingEvents.map((event, index) => (
            <div key={index} className="flex items-center p-4 mt-4 bg-dark-800 rounded-md">
              <Image
                src={event.imageSrc}
                alt={event.title}
                width={100}
                height={100}
                className="object-cover w-20 h-20 rounded-md"
              />
              <div className="ml-4">
                <h5 className="text-white-500 font-semibold">{event.title}</h5>
                <p className="text-gray-400 text-sm mt-2">{event.date} • {event.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}