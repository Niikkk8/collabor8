import EventCard from "@/components/ui-elements/EventCard";
import Link from "next/link";

export default function page() {
    return (
        <div className="p-2 flex flex-wrap">
            {
                new Array(3).fill(0).map((_, index) => (
                    <EventCard key={index} />
                ))
            }
        </div>
    )
}