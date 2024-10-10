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
  }
  