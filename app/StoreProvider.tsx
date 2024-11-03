"use client"

import React, { useEffect, useRef, useState } from "react";
import { Provider } from "react-redux";
import { AppStore, store } from "@/redux/store";
import Sidebar from "@/components/universal/Sidebar";
import SearchBar from "@/components/universal/SearchBar";
import LoginOptionInterface from "@/components/ui-elements/LoginOptionInterface";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignupModal";
import { useAuth } from "@/components/auth/useAuth";
import BottomBar from "@/components/universal/BottomBar";

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

const AppContent = ({ children }: { children: React.ReactNode }) => {
    const { currentUser, loading } = useAuth();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    if (loading) {
        return (
            <div className="flex h-[100svh] items-center justify-center bg-dark-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500" />
            </div>
        );
    }

    return (
        <div className="flex h-[100svh] relative bg-dark-900">
            <Sidebar />
            <main className="w-full md:w-4/5 flex flex-col pb-16 md:pb-0">
                <SearchBar />
                <div className="flex-grow overflow-y-auto no-scrollbar">
                    {children}
                </div>
            </main>
            <BottomBar />
            <SignupModal />
            <LoginModal />
            {!currentUser && (
                <LoginOptionInterface />
            )}
        </div>
    );
};