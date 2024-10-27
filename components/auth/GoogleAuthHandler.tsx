import { auth, db, provider } from '@/firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface UserData {
    userFirstName: string;
    userLastName: string;
    userID: string;
    userEmail: string;
    userProfilePictureSrc: string;
    userProfileBannerSrc: string;
    userBio: string;
    userJoiningDate: Date;
    userFollowers: string[];
    userFollowing: string[];
    userPosts: string[];
    userCommunities: string[];
    userMeetups: string[];
}

async function handleGoogleAuth(isSignup: boolean = false): Promise<UserData & { userUID: string }> {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        if (!user.email) {
            throw new Error("No email associated with the Google account");
        }

        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
            const userData = userDoc.data() as UserData;
            return {
                ...userData,
                userUID: user.uid,
            };
        } else if (!isSignup) {
            throw new Error("No account found. Please sign up first.");
        }

        const userData = await createNewGoogleUser(user);
        return {
            ...userData,
            userUID: user.uid,
        };
    } catch (error) {
        throw error;
    }
}

async function createNewGoogleUser(user: User): Promise<UserData> {
    let username = user.email!.split('@')[0].toLowerCase().replace(/[^a-z0-9_\.]/g, '');
    let isUnique = false;
    let counter = 0;

    while (!isUnique) {
        const testUsername = counter === 0 ? username : `${username}${counter}`;
        const usernameDoc = await getDoc(doc(db, "usernames", testUsername));
        isUnique = !usernameDoc.exists();
        if (isUnique) {
            username = testUsername;
        } else {
            counter++;
        }
    }

    const defaultUserProfilePicture = '/assets/placeholder-images/profile-picture.jpg';
    const defaultUserBanner = '/assets/placeholder-images/profile-banner.jpeg';

    const userData: UserData = {
        userFirstName: user.displayName?.split(' ')[0] || '',
        userLastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        userID: username,
        userEmail: user.email!,
        userProfilePictureSrc: user.photoURL || defaultUserProfilePicture,
        userProfileBannerSrc: defaultUserBanner,
        userBio: "",
        userJoiningDate: new Date(),
        userFollowers: [],
        userFollowing: [],
        userPosts: [],
        userCommunities: [],
        userMeetups: [],
    };

    await setDoc(doc(db, "users", user.uid), userData);

    await setDoc(doc(db, "usernames", username), {
        uid: user.uid
    });

    return userData;
}

export { handleGoogleAuth };