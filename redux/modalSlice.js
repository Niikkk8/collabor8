import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    loginModal: false,
    signupModal: false
}

const modalSlice = createSlice({
    name: "loginModal",
    initialState,
    reducers: {
        openLoginModal: (state) => {
            state.loginModal = true
        },
        closeLoginModal: (state) => {
            state.loginModal = false
        },
        openSignupModal: (state) => {
            state.signupModal = true
        },
        closeSignupModal: (state) => {
            state.signupModal = false
        }
    }
});

export const { openLoginModal, closeLoginModal, openSignupModal, closeSignupModal } = modalSlice.actions

export default modalSlice.reducer