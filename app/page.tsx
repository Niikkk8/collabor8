import Image from "next/image";
import Post from "@/components/ui-elements/Post";
import PostInput from "@/components/ui-elements/PostInput";

export default function Home() {
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

  return (
    <main className="flex max-h-screen">
      <div className="w-[75%] border-r border-dark-700 py-4 px-6 overflow-scroll no-scrollbar">
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
      <div></div>
    </main>
  );
}
