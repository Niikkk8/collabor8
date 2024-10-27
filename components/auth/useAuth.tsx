"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useAppDispatch } from "@/redux/hooks";
import { setUser, signOutUser } from "@/redux/userSlice";
import { doc, getDoc } from "firebase/firestore";

export function useAuth() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDocRef = doc(db, "users", user.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();

                        dispatch(setUser({
                            userUID: user.uid,
                            userID: userData.userID,
                            userFirstName: userData.userFirstName,
                            userLastName: userData.userLastName,
                            userEmail: userData.userEmail,
                            userProfilePictureSrc: userData.userProfilePictureSrc,
                            userProfileBannerSrc: userData.userProfileBannerSrc,
                            userBio: userData.userBio,
                            userJoiningDate: userData.userJoiningDate.toDate(),
                            userFollowers: userData.userFollowers,
                            userFollowing: userData.userFollowing,
                            userPosts: userData.userPosts,
                            userCommunities: userData.userCommunities,
                            userMeetups: userData.userMeetups
                        }));
                    } else {
                        console.log("No user document found in Firestore.");
                    }

                    setCurrentUser(user);
                } catch (error) {
                    console.error("Error fetching user data from Firestore:", error);
                }
            } else {
                dispatch(signOutUser());
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [dispatch]);

    return { currentUser, loading };
}
