import React, { createContext, useState, useEffect, useContext } from 'react';
import auth from '@react-native-firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged(user => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

// Authentication functions
export const signInWithEmailPassword = async (email, password) => {
    try {
        await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
        console.error('Error signing in:', error);
    }
};

export const signUpWithEmailPassword = async (email, password) => {
    try {
        await auth().createUserWithEmailAndPassword(email, password);
    } catch (error) {
        console.error('Error creating user:', error);
    }
};

export const signOut = async () => {
    try {
        await auth().signOut();
    } catch (error) {
        console.error('Error signing out:', error);
    }
};
