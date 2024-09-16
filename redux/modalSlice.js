import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    loginModal: false
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
        }
    }
});

export const { openLoginModal, closeLoginModal } = modalSlice.actions

export default modalSlice.reducer