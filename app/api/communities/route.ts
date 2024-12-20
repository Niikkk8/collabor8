import { NextResponse } from 'next/server';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { Community } from '@/types';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userUID = searchParams.get('userUID');
    const userCommunities = JSON.parse(searchParams.get('userCommunities') || '[]');

    async function fetchJoinedCommunities(): Promise<Community[]> {
        if (!userCommunities || userCommunities.length === 0) {
            return [];
        }

        const communitiesPromises = userCommunities.map(async (communityID: string) => {
            const communityRef = doc(db, 'communities', communityID);
            const communitySnap = await getDoc(communityRef);

            if (communitySnap.exists()) {
                return {
                    ...(communitySnap.data() as Omit<Community, 'communityUID'>),
                    communityUID: communityID,
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

    async function fetchNotJoinedCommunities(): Promise<Community[]> {
        let q;
        if (!userCommunities || userCommunities.length === 0) {
            q = query(collection(db, 'communities'));
        } else {
            q = query(
                collection(db, 'communities'),
                where('communityMembers', 'not-in', [userUID])
            );
        }

        const querySnapshot = await getDocs(q);
        const communitiesData: Community[] = [];

        for (const doc of querySnapshot.docs) {
            if (!userCommunities?.includes(doc.id)) {
                communitiesData.push({
                    ...(doc.data() as Omit<Community, 'communityUID'>),
                    communityUID: doc.id,
                } as Community);
            }
        }

        return communitiesData.sort((a, b) =>
            (b.communityMembers?.length || 0) - (a.communityMembers?.length || 0)
        );
    }

    try {
        const [joinedCommunities, notJoinedCommunities] = await Promise.all([
            fetchJoinedCommunities(),
            fetchNotJoinedCommunities()
        ]);

        return NextResponse.json({
            joinedCommunities,
            notJoinedCommunities
        });
    } catch (error) {
        console.error('Error fetching communities:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}