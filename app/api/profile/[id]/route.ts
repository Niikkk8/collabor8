import { NextResponse } from 'next/server';
import { db } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { User, Post, Community } from '@/types';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const userId = params.id;

    async function fetchUserData() {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return null;
        }

        return {
            ...userDoc.data(),
            userUID: userDoc.id,
        } as User;
    }

    async function fetchUserPosts() {
        const postsRef = collection(db, 'posts');
        const q = query(
            postsRef,
            where('postAuthorId', '==', userId),
            orderBy('postCreatedAt', 'desc')
        );

        const postsSnapshot = await getDocs(q);
        return postsSnapshot.docs.map(doc => ({
            ...doc.data(),
            postUID: doc.id,
            postCreatedAt: doc.data().postCreatedAt.toDate(),
        } as Post));
    }

    async function fetchUserCommunities(communityIds: string[]) {
        if (!communityIds?.length) return [];

        const communitiesPromises = communityIds.map(async (communityId) => {
            const communityRef = doc(db, 'communities', communityId);
            const communitySnap = await getDoc(communityRef);

            if (communitySnap.exists()) {
                return {
                    ...communitySnap.data(),
                    communityUID: communitySnap.id,
                } as Community;
            }
            return null;
        });

        const results = await Promise.allSettled(communitiesPromises);
        return results
            .filter((result): result is PromiseFulfilledResult<Community> =>
                result.status === 'fulfilled' && result.value !== null
            )
            .map(result => result.value);
    }

    try {
        // First fetch user data
        const userData = await fetchUserData();

        if (!userData) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Then fetch posts and communities in parallel
        const [posts, communities] = await Promise.all([
            fetchUserPosts(),
            fetchUserCommunities(userData.userCommunities || [])
        ]);

        return NextResponse.json({
            user: userData,
            posts,
            communities
        });
    } catch (error) {
        console.error('Error fetching profile data:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}