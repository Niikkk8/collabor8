import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    userID: null,
    userFirstName: null,
    userLastName: null,
    userEmail: null,
    userUID: null,
}
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.userID = action.payload.userID
            state.userFirstName = action.payload.userFirstName
            state.userLastName = action.payload.userLastName
            state.userEmail = action.payload.userEmail
            state.userUID = action.payload.userUID
        },
        signOutUser: (state) => {
            state.userID = null,
                state.userFirstName = null,
                state.userLastName = null,
                state.userEmail = null,
                state.userUID = null
        }
    }
});

export const { setUser, signOutUser } = userSlice.actions

export default userSlice.reducer