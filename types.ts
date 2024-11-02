export type User = {
    userUID: string,
    userID: string,
    userFirstName: string,
    userLastName: string,
    userEmail: string,
    userProfilePictureSrc: string,
    userProfileBannerSrc: string,
    userBio: string,
    userJoiningDate: Date,
    userFollowers: string[],
    userFollowing: string[],
    userPosts: string[],
    userCommunities: string[],
    userMeetups: string[],
    portfolio?: Portfolio,
}

export type Portfolio = {
    skills: PortfolioItem[],
    experience: PortfolioItem[],
    certifications: PortfolioItem[],
    education: PortfolioItem[],
    aboutMe: string,
}

export type PortfolioItem = {
    id: string,
    title: string,
    description: string,
    date?: string,
}

export type Community = {
    communityUID: string,
    communityName: string,
    communityDescription: string,
    communityCreatedAt: Date,
    communityMembers: string[],
    communityAdmin: string,
    communityProfileSrc: string,
    communityBannerSrc: string,
}

export type Post = {
    postUID: string,
    postContent: string,
    postImageSrc?: string,
    postCreatedAt: Date,
    postAuthorId: string,
    postAuthorName: string,
    postCommunityId?: string,
    postLikes: string[],
    postComments: CommentReference[],
}

export type Comment = {
    commentUID: string,
    commentContent: string,
    commentImageSrc?: string,
    commentCreatedAt: Date,
    commentAuthorId: string,
    commentAuthorName: string,
    commentThreads: Comment[],
    commentLikes: string[],
    postId: string,
    parentCommentId?: string,
    threadRefs: CommentReference[];
}

export type CommentReference = {
    id: string;
    createdAt: Date; // For sorting purposes
    parentId?: string; // Optional parent comment ID
}

export type Event = {
    eventUID: string,
    eventTitle: string,
    eventDescription: string,
    eventDate: Date,
    eventLocation: string,
    eventOrganizerId: string,
    eventMembers: string[],
    eventImageSrc: string,
}