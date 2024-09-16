import { configureStore } from "@reduxjs/toolkit";
import modalSlice from "./modalSlice";

export const store = () =>
  configureStore({
    reducer: {
      modals: modalSlice
    },
  });

export type AppStore = ReturnType<typeof store>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];