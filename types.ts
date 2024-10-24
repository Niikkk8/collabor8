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
    postComments: Comment[],
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
}