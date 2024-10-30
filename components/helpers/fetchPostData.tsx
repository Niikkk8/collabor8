import { db } from "@/firebase";
import { Post } from "@/types";
import { doc, getDoc } from "firebase/firestore";

export default async function getPostsData(id: string): Promise<Post | null> {
    const postDocRef = doc(db, 'posts', id);
    const postDoc = await getDoc(postDocRef);
    if (!postDoc.exists) {
        return null;
    }
    const postData = postDoc.data();

    return {
        postUID: id,
        postContent: postData?.postContent || '',
        postImageSrc: postData?.postImageSrc || null,
        postCreatedAt: postData?.postCreatedAt.toDate(),
        postAuthorId: postData?.postAuthorId || '',
        postAuthorName: postData?.postAuthorName || '',
        postCommunityId: postData?.postCommunityId || '',
        postLikes: postData?.postLikes || [],
        postComments: postData?.postComments || []
    };
}
