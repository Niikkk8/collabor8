'use client'

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Post as PostType, User } from '@/types';
import Post from '@/components/ui-elements/Post';

export default function UserProfilePosts({ params }: { params: { id: string } }) {
    const [posts, setPosts] = useState<PostType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUserPosts() {
            try {
                const userDoc = await getDoc(doc(db, 'users', params.id));

                if (!userDoc.exists()) {
                    setError('User not found');
                    setLoading(false);
                    return;
                }

                const userData = userDoc.data() as User;
                const userPosts = userData.userPosts || [];

                const postsPromises = userPosts.map(postId =>
                    getDoc(doc(db, 'posts', postId))
                );

                const postsSnapshots = await Promise.all(postsPromises);

                const fetchedPosts = postsSnapshots
                    .filter(doc => doc.exists())
                    .map(doc => {
                        const data = doc.data();
                        return {
                            postUID: doc.id,
                            postContent: data.postContent,
                            postImageSrc: data.postImageSrc,
                            postCreatedAt: data.postCreatedAt.toDate(),
                            postAuthorId: data.postAuthorId,
                            postAuthorName: data.postAuthorName,
                            postCommunityId: data.postCommunityId,
                            postLikes: data.postLikes || [],
                            postComments: data.postComments || []
                        } as PostType;
                    });

                const sortedPosts = fetchedPosts.sort((a, b) =>
                    b.postCreatedAt.getTime() - a.postCreatedAt.getTime()
                );

                setPosts(sortedPosts);
            } catch (err) {
                console.error('Error fetching posts:', err);
                setError('Failed to load posts');
            } finally {
                setLoading(false);
            }
        }

        fetchUserPosts();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center p-8 text-red-500">
                {error}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="flex justify-center items-center p-8 text-white-800">
                No posts yet
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <Post
                    key={post.postUID}
                    post={post}
                />
            ))}
        </div>
    );
}