import { NextResponse } from 'next/server';
import { db } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const userId = params.id;

    try {
        const userDoc = await getDoc(doc(db, 'users', userId));

        if (!userDoc.exists()) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const userData = userDoc.data();
        const portfolio = userData.portfolio || {
            skills: [],
            experience: [],
            certifications: [],
            education: [],
            aboutMe: ""
        };

        return NextResponse.json({ portfolio });
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// Add PATCH endpoint for updates
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;
        const updates = await request.json();

        await updateDoc(doc(db, 'users', userId), {
            'portfolio': updates
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating portfolio:', error);
        return NextResponse.json(
            { error: 'Failed to update portfolio' },
            { status: 500 }
        );
    }
}