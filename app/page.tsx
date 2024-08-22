import Image from 'next/image';
import Post from '@/components/ui-elements/Post';
import PostInput from '@/components/ui-elements/PostInput';
import Link from 'next/link';

export default async function Home() {
  const API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;
  const response = await fetch(
    `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=in&language=en&category=technology`
  );
  const data = await response.json();

  // Ensure that results is an array
  const newsArticles = Array.isArray(data.results)
    ? data.results.filter((article: any) => article.image_url && article.source_icon).slice(0, 2)
    : [];

  const posts = [
    {
      profileName: "Niket Shah",
      profileSrc: "/assets/placeholder-images/profile-picture.jpg",
      userId: "nik8",
      followers: "20k",
      time: "10 hrs ago",
      content: "Excited to share a new tutorial on React Hooks with the Tech Mentors community! Let's dive into custom hooks.",
      likes: 150,
      comments: 12,
    },
    {
      profileName: "Jane Doe",
      profileSrc: "/assets/placeholder-images/profile-picture.jpg",
      userId: "jane_doe",
      followers: "326",
      time: "12 hrs ago",
      content: "I've been following the morning routine suggested by the Self Improvement Arc, and it's been a game-changer!",
      likes: 120,
      comments: 10,
    },
    {
      profileName: "John Smith",
      profileSrc: "/assets/placeholder-images/profile-picture.jpg",
      userId: "john_smith",
      followers: "500",
      time: "15 hrs ago",
      content: "Any recommendations on the best resources for learning advanced TypeScript? #TechMentors",
      likes: 95,
      comments: 8,
    },
    {
      profileName: "Emma Brown",
      profileSrc: "/assets/placeholder-images/profile-picture.jpg",
      userId: "emma_brown",
      followers: "1.2k",
      time: "18 hrs ago",
      content: "Just completed a 30-day challenge from the Self Improvement Arc community. Feeling more productive and focused!",
      likes: 180,
      comments: 15,
    },
    {
      profileName: "Michael Lee",
      profileSrc: "/assets/placeholder-images/profile-picture.jpg",
      userId: "michael_lee",
      followers: "800",
      time: "20 hrs ago",
      content: "Started a new mentorship session today on Python for Data Science. Loving the enthusiasm in the Tech Mentors community!",
      likes: 210,
      comments: 18,
    },
  ];

  const upcomingEvents = [
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

  return (
    <main className="flex max-h-screen">
      <div className="w-[75%] border-r border-dark-700 py-4 px-6 overflow-scroll no-scrollbar h-screen">
        <PostInput />
        <div className="flex items-center p-2 mt-4 min-w-fit">
          <span className="text-sm text-white-800">Sort By: </span>
          <p className="flex items-center text-sm ml-2">
            Following
            <Image src="/assets/svgs/searchbar-dropdown.svg" alt="" width={14} height={14} className="ml-1" />
          </p>
          <div className="flex-grow ml-2 h-[1px] bg-dark-700" />
        </div>
        <div className="mt-4 pb-20">
          {posts.map((post, index) => (
            <Post post={post} key={index} />
          ))}
        </div>
      </div>
      <div className='w-1/4 overflow-scroll no-scrollbar'>
        <div>
          <h4 className="text-sm text-white-800 p-6 pb-0">What&apos;s happening today!</h4>
          <div className='mt-2 border-b border-dark-700 p-6 pt-0'>
            {newsArticles.map((article: any, index: number) => (
              <Link href={article.link} target='_blank' key={index}>
                <div className='my-3 relative'>
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
        </div>
        <div className='p-4 pb-24'>
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
