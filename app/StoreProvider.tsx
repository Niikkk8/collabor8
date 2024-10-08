"use client"

import React, { useRef } from "react";
import { Provider } from "react-redux";
import { AppStore, store } from "@/redux/store";
import Sidebar from "@/components/universal/Sidebar";
import SearchBar from "@/components/universal/SearchBar";
import LoginOptionInterface from "@/components/ui-elements/LoginOptionInterface";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignupModal";
import { useAuth } from "@/components/auth/useAuth";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<AppStore>();

    if (!storeRef.current) {
        storeRef.current = store();
    }

    return (
        <Provider store={storeRef.current}>
            <AppContent>{children}</AppContent>
        </Provider>
    );
}

function AppContent({ children }: { children: React.ReactNode }) {
    const { currentUser, loading } = useAuth(); // Use the hook to get auth state

    if (loading) {
        return <div>Loading...</div>; // You can replace this with a loading spinner
    }

    return (
        <div className="flex h-screen relative">
            <Sidebar />
            <div className="w-4/5 flex flex-col">
                <SearchBar />
                <div className="flex-grow overflow-y-auto no-scrollbar">
                    {children}
                </div>
            </div>
            <SignupModal />
            <LoginModal />
            {!currentUser && (
                <div className="absolute top-0 left-0 w-full h-full bg-dark-900 bg-opacity-95">
                    <LoginOptionInterface />
                </div>
            )}
        </div>
    );
}