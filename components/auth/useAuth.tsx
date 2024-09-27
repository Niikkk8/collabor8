"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase"; // Ensure Firebase Firestore is initialized
import { onAuthStateChanged, User } from "firebase/auth";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setUser, signOutUser } from "@/redux/userSlice";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions

export function useAuth() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Fetch the user document from Firestore
                    const userDocRef = doc(db, "users", user.uid); // Adjust the collection name if needed
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();

                        // Dispatch to Redux the user data from Firestore
                        dispatch(setUser({
                            userID: userData.userID,
                            userFirstName: userData.userFirstName,
                            userLastName: userData.userLastName,
                            userEmail: userData.userEmail,
                            userUID: user.uid
                        }));
                        
                    } else {
                        console.log("No user document found in Firestore.");
                    }

                    setCurrentUser(user);
                } catch (error) {
                    console.error("Error fetching user data from Firestore:", error);
                }
            } else {
                // If user is logged out, clear the global state
                dispatch(signOutUser());
                setCurrentUser(null);
            }
            setLoading(false);
        });

        // Clean up the listener on unmount
        return () => unsubscribe();
    }, [dispatch]);

    return { currentUser, loading };
}
