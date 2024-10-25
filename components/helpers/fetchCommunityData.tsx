import { db } from "@/firebase";
import { Community } from "@/types";
import { doc, getDoc } from "firebase/firestore";

export default async function getCommunitiesData(id: string): Promise<Community | null> {
    const communityDocRef = doc(db, 'communities', id);
    const communityDoc = await getDoc(communityDocRef);
    if (!communityDoc.exists) {
        return null;
    }
    return communityDoc.data() as Community;
}