import Link from "next/link";

export default function page() {
    return (
        <div>
            <div className='mt-6 flex justify-evenly py-2 border-b border-dark-700'>
                <Link href="/profile" className={`relative text-white-800`}>
                    Posts
                </Link>
                <Link href="/profile/scheduled-events" className={`relative after:content-[""] after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-[2px] after:bg-white-500 after:rounded-full' : 'text-white-800'`}>
                    Scheduled Events
                </Link>
                <Link href="/profile/saved" className={`relative text-white-800`}>
                    Saved
                </Link>
            </div>
            <h2>Scheduled Events</h2>
        </div>
    )
}