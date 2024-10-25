import { db } from "@/firebase";
import { User } from "@/types";
import { doc, getDoc } from "firebase/firestore";

export default async function getUserData(id: string): Promise<User | null> {
    const userDocRef = doc(db, 'users', id);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists) {
        return null;
    }
    return userDoc.data() as User;
}