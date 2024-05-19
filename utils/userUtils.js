import { FIREBASE_AUTH } from '../firebaseConfig'; // Import Firebase Authentication

// Utility function to get the current user's ID
export const getCurrentUserId = () => {
    // Get the current user from Firebase Authentication
    const currentUser = FIREBASE_AUTH.currentUser;

    // Check if there is a logged-in user
    if (currentUser) {
        console.log(currentUser.uid);
        // Return the user's ID (uid)
        return currentUser.uid;
    } else {
        // No user is currently logged in
        return null;
    }
};
