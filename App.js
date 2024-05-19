import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditProfile from './screens/EditProfile'; 
import Signup from './screens/Signup';
import Login from './screens/Login';
import Discover from './screens/Discover';
import ItemScreen from './screens/ItemScreen';
import ChatScreen from './screens/ChatScreen';
import ChatListScreen from './components/ChatListScreen';
import UploadScreen from './screens/UploadScreen';
import HomeScreen from './screens/HomeScreen';
import Toast from 'react-native-toast-message';
import TripsScreen from './screens/TripsScreen';
// Create Stack Navigator for Authentication
const AuthStack = createNativeStackNavigator();

// Create Stack Navigator for Main App
const MainStack = createNativeStackNavigator();


export default function App() {
    // State to track whether the user is authenticated
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    // Check the user's authentication status when the app loads
    // useEffect(() => {
    //     const checkAuthStatus = async () => {
    //         const uid = await AsyncStorage.getItem('uid');
    //         setIsAuthenticated(uid !== null);
    //     };

    //     checkAuthStatus();
    // }, []);

    // Navigation containers for authentication and main app
    return (
        <NavigationContainer>
            {/* {isAuthenticated ? ( */}
                <MainStack.Navigator initialRouteName='Login' screenOptions={{ headerShown: false }}>
                    {/* Add your main app screens here */}
                    <MainStack.Screen name="Discover" component={Discover} />
                    <MainStack.Screen name="ItemScreen" component={ItemScreen} />
                    <MainStack.Screen name="ChatScreen" component={ChatScreen} />
                    <MainStack.Screen name="ChatListScreen" component={ChatListScreen} />
                    <MainStack.Screen name="UploadScreen" component={UploadScreen} />
                    <MainStack.Screen name="HomeScreen" component={HomeScreen} />
                    <MainStack.Screen name="TripsScreen" component={TripsScreen} />
                    <MainStack.Screen name="Login" component={Login} />
                    <MainStack.Screen name="Signup" component={Signup} />
                    <MainStack.Screen name="EditProfile" component={EditProfile} />
                    
                </MainStack.Navigator>
            {/* ) : (
                <AuthStack.Navigator screenOptions={{ headerShown: false }}>
                    <AuthStack.Screen name="Login" component={Login} />
                    <AuthStack.Screen name="Signup" component={Signup} />
                </AuthStack.Navigator>
            )} */}
        </NavigationContainer>
    );
}
