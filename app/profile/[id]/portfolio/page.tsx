import { useAppSelector } from "@/redux/hooks"
import { User } from "@/types"

export default function page() {
    const user: User = useAppSelector((state) => state.user)
    return (
        <div>
            <h2>{user.userFirstName}&apos;s Portfolio</h2>
            (functionality to be implemented later)
        </div>
    )
}