import PostInput from "@/components/ui-elements/PostInput";

export default function Home() {
  return (
    <main className="flex h-screen">
      <div className="w-[75%] border-r border-white-900 py-4 px-6">
        <PostInput />
        <div className="flex items-center p-2 mt-4 min-w-fit">
          <span className="text-sm text-white-800">Sort By: </span>
          <p className="flex items-center text-sm ml-2">
            Following
            <img src="/assets/svgs/searchbar-dropdown.svg" alt="" className="w-[14px] h-[14px] ml-1" />
          </p>
          <div className="flex-grow ml-2 h-[1px] bg-white-800" />
        </div>
      </div>
      <div></div>
    </main>
  );
}