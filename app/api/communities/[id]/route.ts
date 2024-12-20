import { NextResponse } from 'next/server';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Community, User, Post } from '@/types';
import { db } from '@/firebase';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const communityId = params.id;

    async function fetchCommunityData() {
        const communityRef = doc(db, 'communities', communityId);
        const communityDoc = await getDoc(communityRef);

        if (!communityDoc.exists()) {
            return null;
        }

        return {
            ...communityDoc.data(),
            communityUID: communityDoc.id,
        } as Community;
    }

    async function fetchAdminData(adminId: string) {
        const userRef = doc(db, 'users', adminId);
        const userDoc = await getDoc(userRef);

        return userDoc.exists() ? {
            ...userDoc.data(),
            userUID: userDoc.id,
        } as User : null;
    }

    async function fetchCommunityPosts() {
        const postsRef = collection(db, 'posts');
        const q = query(
            postsRef,
            where('postCommunityId', '==', communityId),
            orderBy('postCreatedAt', 'desc')
        );

        const postsSnapshot = await getDocs(q);
        return postsSnapshot.docs.map(doc => ({
            ...doc.data(),
            postUID: doc.id,
            postCreatedAt: doc.data().postCreatedAt.toDate(),
        } as Post));
    }

    try {
        // First fetch community data
        const communityData = await fetchCommunityData();

        if (!communityData) {
            return NextResponse.json(
                { error: 'Community not found' },
                { status: 404 }
            );
        }

        // Then fetch admin data and posts in parallel
        const [adminData, posts] = await Promise.all([
            fetchAdminData(communityData.communityAdmin),
            fetchCommunityPosts()
        ]);

        return NextResponse.json({
            community: communityData,
            admin: adminData,
            posts
        });
    } catch (error) {
        console.error('Error fetching community data:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}