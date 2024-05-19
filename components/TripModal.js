import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { TextInput } from 'react-native';
import { addDoc, collection } from 'firebase/firestore';
import { database, FIREBASE_AUTH } from '../firebaseConfig';

const TripModal = ({ visible, onClose, onSubmit }) => {
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = async () => {
        try {
            // Save the trip details to Firestore collection `trip_plans`
            await addDoc(collection(database, 'trip_plans'), {
                destination,
                startDate: startDate, // Save date as string
                endDate: endDate, // Save date as string
                user_id: FIREBASE_AUTH.currentUser.uid, // User ID
            });
            // Close the modal after successful submission
            onClose();
        } catch (error) {
            console.error('Error saving trip details:', error);
        }
    };
    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Enter Trip Details</Text>

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
                        onChangeText={setStartDate}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="End Date (YYYY-MM-DD)"
                        value={endDate}
                        onChangeText={setEndDate}
                    />

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        padding: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    submitButton: {
        backgroundColor: '#0066cc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 5,
    },
    cancelButtonText: {
        fontWeight: 'bold',
    },
});

export default TripModal;
