import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Button, TextInput, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, doc, addDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { database, FIREBASE_AUTH } from '../firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';

const TripsScreen = () => {
    const [trips, setTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isCreateTripModalVisible, setCreateTripModalVisible] = useState(false);
    const [isStatusModalVisible, setStatusModalVisible] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [startDatePickerVisible, setStartDatePickerVisible] = useState(false);
    const [endDatePickerVisible, setEndDatePickerVisible] = useState(false);

    useEffect(() => {
        const unsubscribe = FIREBASE_AUTH.onAuthStateChanged((user) => {
            if (user) {
                setCurrentUserId(user.uid);
            } else {
                setCurrentUserId(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchTrips = async () => {
        try {
            if (currentUserId) {
                const tripsCollection = query(
                    collection(database, 'trip_plans'), // Ensure this matches your Firestore collection name
                    where('user_id', '==', currentUserId)
                );
                const querySnapshot = await getDocs(tripsCollection);

                const tripsData = querySnapshot.docs.map(doc => {
                    const tripData = doc.data();
                    tripData.id = doc.id; // Adding the document ID
                    return tripData;
                });

                setTrips(tripsData);
            }
        } catch (error) {
            console.error('Error fetching trips:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, [currentUserId]);

    const handleCreateTrip = async () => {
        try {
            const newTrip = {
                user_id: currentUserId,
                destination,
                startDate,
                endDate,
                status: 'pending',
            };
            const docRef = await addDoc(collection(database, 'trip_plans'), newTrip); // Ensure this matches your Firestore collection name

            setTrips(prevTrips => [...prevTrips, { id: docRef.id, ...newTrip }]);
            setCreateTripModalVisible(false);

            setDestination('');
            setStartDate('');
            setEndDate('');
        } catch (error) {
            console.error('Error creating new trip:', error);
        }
    };

    const handleUpdateTripStatus = async () => {
        try {
            if (selectedTrip && newStatus) {
                const tripDocRef = doc(database, 'trip_plans', selectedTrip.id); // Ensure this matches your Firestore collection name
                await updateDoc(tripDocRef, { status: newStatus });

                setTrips(prevTrips => prevTrips.map(trip => {
                    if (trip.id === selectedTrip.id) {
                        return { ...trip, status: newStatus };
                    }
                    return trip;
                }));

                setStatusModalVisible(false);
                setSelectedTrip(null);
                setNewStatus('');
            }
        } catch (error) {
            console.error('Error updating trip status:', error);
        }
    };

    const handleTripItemClick = (trip) => {
        setSelectedTrip(trip);
        setNewStatus(trip.status);
        setStatusModalVisible(true);
    };

    const renderTripItem = ({ item }) => (
        <TouchableOpacity style={styles.tripContainer} onPress={() => handleTripItemClick(item)}>
            <Text style={styles.tripText}>Destination: {item.destination}</Text>
            <Text style={styles.tripText}>Status: {item.status}</Text>
            <Text style={styles.tripText}>Start Date: {item.startDate}</Text>
            <Text style={styles.tripText}>End Date: {item.endDate}</Text>
        </TouchableOpacity>
    );

    const handleStartDateChange = (event, selectedDate) => {
        setStartDatePickerVisible(false);
        if (event.type === 'set') {
            const currentDate = selectedDate || new Date();
            const offset = currentDate.getTimezoneOffset();
            const correctedDate = new Date(currentDate.getTime() - (offset * 60 * 1000));
            setStartDate(correctedDate.toISOString().split('T')[0]);
        }
    };

    const handleEndDateChange = (event, selectedDate) => {
        setEndDatePickerVisible(false);
        if (event.type === 'set') {
            const currentDate = selectedDate || new Date();
            const offset = currentDate.getTimezoneOffset();
            const correctedDate = new Date(currentDate.getTime() - (offset * 60 * 1000));
            setEndDate(correctedDate.toISOString().split('T')[0]);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" style={styles.activityIndicator} />
            ) : (
                <>
                    <FlatList
                        data={trips}
                        keyExtractor={item => item.id}
                        renderItem={renderTripItem}
                    />
                    <TouchableOpacity className='bg-orange-400' style={styles.button} onPress={() => setCreateTripModalVisible(true)}>
                        <Text style={styles.buttonText}>Create New Trip</Text>
                    </TouchableOpacity>

                    <Modal
                        visible={isCreateTripModalVisible}
                        onRequestClose={() => setCreateTripModalVisible(false)}
                        transparent={true}
                        animationType="slide"
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Create New Trip</Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Destination"
                                    value={destination}
                                    onChangeText={setDestination}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Start Date (YYYY-MM-DD)"
                                    value={startDate}
                                    onFocus={() => setStartDatePickerVisible(true)}
                                    readOnly={false}
                                />
                                {startDatePickerVisible && (
                                    <DateTimePicker
                                        value={startDate ? new Date(startDate) : new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={handleStartDateChange}
                                    />
                                )}

                                <TextInput
                                    style={styles.input}
                                    placeholder="End Date (YYYY-MM-DD)"
                                    value={endDate}
                                    onFocus={() => setEndDatePickerVisible(true)}
                                    readOnly={false}
                                />
                                {endDatePickerVisible && (
                                    <DateTimePicker
                                        value={endDate ? new Date(endDate) : new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={handleEndDateChange}
                                    />
                                )}

                                <View style={styles.modalButtons}>
                                    <Button
                                        title="Cancel"
                                        onPress={() => setCreateTripModalVisible(false)}
                                    />
                                    <Button
                                        title="Create"
                                        onPress={handleCreateTrip}
                                    />
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal
                        visible={isStatusModalVisible}
                        onRequestClose={() => {
                            setStatusModalVisible(false);
                            setSelectedTrip(null);
                            setNewStatus('');
                        }}
                        transparent={true}
                        animationType="slide"
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Change Trip Status</Text>

                                <Text style={styles.tripText}>Destination: {selectedTrip?.destination}</Text>
                                <Text style={styles.tripText}>Start Date: {selectedTrip?.startDate}</Text>
                                <Text style={styles.tripText}>End Date: {selectedTrip?.endDate}</Text>

                                <Text style={styles.inputLabel}>New Status:</Text>
                                <View style={styles.statusContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.statusOption,
                                            newStatus === 'pending' && styles.selectedStatusOption,
                                        ]}
                                        onPress={() => setNewStatus('pending')}
                                    >
                                        <Text style={styles.statusOptionText}>Pending</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.statusOption,
                                            newStatus === 'Ongoing' && styles.selectedStatusOption,
                                        ]}
                                        onPress={() => setNewStatus('Ongoing')}
                                    >
                                        <Text style={styles.statusOptionText}>Ongoing</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.statusOption,
                                            newStatus === 'completed' && styles.selectedStatusOption,
                                        ]}
                                        onPress={() => setNewStatus('completed')}
                                    >
                                        <Text style={styles.statusOptionText}>Completed</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.modalButtons}>
                                    <Button
                                        title="Cancel"
                                        onPress={() => {
                                            setStatusModalVisible(false);
                                            setSelectedTrip(null);
                                            setNewStatus('');
                                        }}
                                    />
                                    <Button
                                        title="Update"
                                        onPress={handleUpdateTripStatus}
                                    />
                                </View>
                            </View>
                        </View>
                    </Modal>
                </>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    tripContainer: {
        padding: 16,
        marginBottom: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
    },
    tripText: {
        fontSize: 16,
        color: '#333',
    },
    button: {
        marginTop: 16,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
        marginBottom: 16,
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    statusOption: {
        padding: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    selectedStatusOption: {
        backgroundColor: '#007BFF',
        borderColor: '#007BFF',
    },
    statusOptionText: {
        color: '#333',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputLabel: {
        fontSize: 16,
        marginBottom: 8,
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default TripsScreen;
