import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { database, FIREBASE_AUTH } from '../firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChatListScreen = ({ navigation }) => {
    const [currentUserTripPlan, setCurrentUserTripPlan] = useState(null);
    const [filteredTripPlans, setFilteredTripPlans] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = FIREBASE_AUTH.onAuthStateChanged((user) => {
            if (user) {
                setCurrentUserId(user.uid);
            } else {
                setCurrentUserId(null);
                setCurrentUserTripPlan(null);
                setFilteredTripPlans([]);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!currentUserId) {
            setIsLoading(false);
            return; // No user logged in
        }

        const fetchCurrentUserTripPlan = async () => {
            try {
                const tripPlanQuery = query(
                    collection(database, 'trip_plans'),
                    where('user_id', '==', currentUserId)
                );

                const querySnapshot = await getDocs(tripPlanQuery);

                if (!querySnapshot.empty) {
                    const tripPlan = querySnapshot.docs[0].data();
                    setCurrentUserTripPlan(tripPlan);
                } else {
                    setCurrentUserTripPlan(null);
                }
            } catch (error) {
                console.error('Error fetching current user trip plan:', error);
                setCurrentUserTripPlan(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCurrentUserTripPlan();
    }, [currentUserId]);

    useEffect(() => {
        if (!currentUserTripPlan || !currentUserId) {
            return; // No trip plan or no user logged in
        }

        const filterAndFetchUsers = async () => {
            setIsLoading(true);
            const { destination, startDate, endDate } = currentUserTripPlan;

            try {
                const tripPlansCollection = collection(database, 'trip_plans');
                const querySnapshot = await getDocs(tripPlansCollection);

                const filteredTrips = await Promise.all(
                    querySnapshot.docs.map(async (doc) => {
                        const tripPlanData = doc.data();
                        tripPlanData.id = doc.id;

                        if (tripPlanData.user_id === currentUserId || tripPlanData.status !== 'pending') return null;

                        const tripDestination = tripPlanData.destination.trim().toLowerCase();
                        const normalizedDestination = destination.trim().toLowerCase();

                        const destinationMatches = tripDestination === normalizedDestination;
                        const dateOverlap = (
                            tripPlanData.startDate <= endDate &&
                            tripPlanData.endDate >= startDate
                        );

                        if (destinationMatches && dateOverlap) {
                            const userDoc = await getDocs(query(collection(database, 'users'), where('uid', '==', tripPlanData.user_id)));
                            if (!userDoc.empty) {
                                const userData = userDoc.docs[0].data();
                                tripPlanData.userName = userData.name;
                                tripPlanData.profileImage = userData.profilePhoto; // Assuming the field is profileImage
                            } else {
                                tripPlanData.userName = 'Unknown';
                                tripPlanData.profileImage = null; // Handle case where profile image is not available
                            }
                            return tripPlanData;
                        }

                        return null;
                    })
                );

                setFilteredTripPlans(filteredTrips.filter(trip => trip !== null));
            } catch (error) {
                console.error('Error filtering trip plans:', error);
            } finally {
                setIsLoading(false);
            }
        };

        filterAndFetchUsers();
    }, [currentUserTripPlan, currentUserId]);

    return (
        <SafeAreaView style={styles.container}>
            {currentUserId ? (
                <>
                    <Text style={styles.header}>Matched Trip Plans</Text>

                    {isLoading ? (
                        <ActivityIndicator size="large" color="#0000ff" style={styles.activityIndicator} />
                    ) : (
                        filteredTripPlans.length > 0 ? (
                            <FlatList
                                data={filteredTripPlans}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('ChatScreen', { userId: item.user_id, name: item.userName, profilePhoto: item.profileImage })}
                                        style={styles.tripPlanContainer}
                                    >
                                        <View className='flex-row items-center'>
                                            <Image
                                                source={item.profileImage ? { uri: item.profileImage } : require('../assets/icons.png')}
                                                className='w-20 h-20 rounded-full'
                                            />
                                            <View className='flex justify-between items-center gap-x-4 gap-y-2'>
                                                <View className='flex-row items-center justify-between gap-x-4'>

                                                    <Text className='text-lg'>
                                                        {item.userName}
                                                    </Text>
                                                    <Text className='bg-orange-400 px-2 py-1 rounded-2xl shadow-xl shadow-black'>{item.destination.trim()}</Text>
                                                </View>
                                                <View className='flex-row justify-center items-center'>

                                                    <Text>{item.startDate}</Text>
                                                    <Text className='font-bold text-base'>{' ---> '}</Text>
                                                    <Text>{item.endDate}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        ) : (
                            <Text style={styles.noTripsMessage}>No matching trips found.</Text>
                        )
                    )}
                </>
            ) : (
                <Text style={styles.loginMessage}>Please log in to view your trips.</Text>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    header: {
        fontSize: 24,
        marginBottom: 10,
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tripPlanContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    tripPlanContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    tripPlanText: {
        fontSize: 18,
    },
    noTripsMessage: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
    loginMessage: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
});

export default ChatListScreen;
