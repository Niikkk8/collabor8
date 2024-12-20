interface NewsArticle {
    link: string;
    image_url: string;
    title: string;
    source_icon: string;
    source_name: string;
    pubDate: string;
}

interface Post {
    postUID: string;
    postContent: string;
    postImageSrc?: string;
    postCreatedAt: Date;
    postAuthorId: string;
    postAuthorName: string;
    postCommunityId?: string;
    postLikes: string[];
    postComments: Comment[];
}

interface Comment {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: Date;
}

interface NewsApiResponse {
    status: string;
    totalResults: number;
    results: Array<{
        link: string;
        image_url?: string;
        title: string;
        source_icon?: string;
        source_name: string;
        pubDate: string;
        [key: string]: any;
    }>;
}

interface HomeApiResponse {
    newsArticles: NewsArticle[];
    posts: Post[];
}

interface HomeApiError {
    error: string;
}

import { NextResponse } from 'next/server';
import { query, where, orderBy, limit, getDocs, collection, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/firebase';

const NEWS_API_KEY = process.env.NEWS_API_KEY;

function chunk<T>(array: T[], size: number): T[][] {
    return array.reduce((acc: T[][], item: T, i: number) => {
        const chunkIndex = Math.floor(i / size);
        if (!acc[chunkIndex]) {
            acc[chunkIndex] = [];
        }
        acc[chunkIndex].push(item);
        return acc;
    }, []);
}

export async function GET(request: Request): Promise<NextResponse<HomeApiResponse | HomeApiError>> {
    const { searchParams } = new URL(request.url);
    const userUID = searchParams.get('userUID');
    const userFollowing = JSON.parse(searchParams.get('userFollowing') || '[]') as string[];
    const userCommunities = JSON.parse(searchParams.get('userCommunities') || '[]') as string[];

    async function fetchNews(): Promise<NewsArticle[]> {
        try {
            const response = await fetch(
                `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&country=in&language=en&category=technology`
            );
            const data = await response.json() as NewsApiResponse;

            return Array.isArray(data.results)
                ? data.results
                    .filter((article) => article.image_url && article.source_icon)
                    .slice(0, 2)
                    .map(({ link, image_url, title, source_icon, source_name, pubDate }) => ({
                        link,
                        image_url: image_url!,
                        title,
                        source_icon: source_icon!,
                        source_name,
                        pubDate
                    }))
                : [];
        } catch (error) {
            console.error('Error fetching news:', error);
            return [];
        }
    }

    async function fetchUserPosts(): Promise<Post[]> {
        const POSTS_PER_QUERY = 20;
        const postsRef = collection(db, 'posts');
        const allPosts: Post[] = [];

        const queries: Promise<QuerySnapshot<DocumentData>>[] = [];

        // Add following queries
        if (userFollowing.length > 0) {
            for (const followingChunk of chunk(userFollowing, 10)) {
                queries.push(
                    getDocs(
                        query(
                            postsRef,
                            where('postAuthorId', 'in', followingChunk),
                            orderBy('postCreatedAt', 'desc'),
                            limit(POSTS_PER_QUERY)
                        )
                    )
                );
            }
        }

        // Add community queries
        if (userCommunities.length > 0) {
            for (const communityChunk of chunk(userCommunities, 10)) {
                queries.push(
                    getDocs(
                        query(
                            postsRef,
                            where('postCommunityId', 'in', communityChunk),
                            orderBy('postCreatedAt', 'desc'),
                            limit(POSTS_PER_QUERY)
                        )
                    )
                );
            }
        }

        // Add user's own posts query
        if (userUID) {
            queries.push(
                getDocs(
                    query(
                        postsRef,
                        where('postAuthorId', '==', userUID),
                        orderBy('postCreatedAt', 'desc'),
                        limit(POSTS_PER_QUERY)
                    )
                )
            );
        }

        // Use Promise.allSettled to handle potential failures gracefully
        const results = await Promise.allSettled(queries);

        results.forEach((result) => {
            if (result.status === 'fulfilled') {
                result.value.forEach((doc) => {
                    const postData = doc.data();
                    allPosts.push({
                        postUID: doc.id,
                        postContent: postData.postContent,
                        postImageSrc: postData.postImageSrc,
                        postCreatedAt: postData.postCreatedAt.toDate(),
                        postAuthorId: postData.postAuthorId,
                        postAuthorName: postData.postAuthorName,
                        postCommunityId: postData.postCommunityId,
                        postLikes: postData.postLikes || [],
                        postComments: postData.postComments || [],
                    });
                });
            }
        });

        return allPosts;
    }

    try {
        const [newsArticles, posts] = await Promise.all([
            fetchNews(),
            fetchUserPosts()
        ]);

        // Process posts to remove duplicates and sort
        const uniquePosts = Array.from(
            new Map(posts.map(post => [post.postUID, post])).values()
        );
        const sortedPosts = uniquePosts.sort(
            (a, b) => b.postCreatedAt.getTime() - a.postCreatedAt.getTime()
        );

        return NextResponse.json({
            newsArticles,
            posts: sortedPosts
        });
    } catch (error) {
        console.error('Error in API route:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}