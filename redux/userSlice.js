import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userUID: "",
    userID: "",
    userFirstName: "",
    userLastName: "",
    userEmail: "",
    userProfilePictureSrc: "",
    userProfileBannerSrc: "",
    userBio: "",
    userJoiningDate: new Date(),
    userFollowers: [],
    userFollowing: [],
    userPosts: [],
    userCommunities: [],
    userMeetups: []
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.userUID = action.payload.userUID;
            state.userID = action.payload.userID;
            state.userFirstName = action.payload.userFirstName;
            state.userLastName = action.payload.userLastName;
            state.userEmail = action.payload.userEmail;
            state.userProfilePictureSrc = action.payload.userProfilePictureSrc;
            state.userProfileBannerSrc = action.payload.userProfileBannerSrc;
            state.userBio = action.payload.userBio;
            state.userJoiningDate = action.payload.userJoiningDate;
            state.userFollowers = action.payload.userFollowers;
            state.userFollowing = action.payload.userFollowing;
            state.userPosts = action.payload.userPosts;
            state.userCommunities = action.payload.userCommunities;
            state.userMeetups = action.payload.userMeetups;
        },
        signOutUser: (state) => {
            Object.assign(state, initialState);
        }
    }
});

export const { setUser, signOutUser } = userSlice.actions;

export default userSlice.reducer;
