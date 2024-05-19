import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome icons
import TripModal from './TripModal'; // Import the TripModal component
import { useNavigation } from '@react-navigation/native';

const ChatAndUploadButtons = ({ onUploadPress }) => {
    const navigation = useNavigation();
    const [isTripModalVisible, setTripModalVisible] = useState(false);

    const handleOpenTripModal = () => {
        setTripModalVisible(true);
    };

    const handleCloseTripModal = () => {
        setTripModalVisible(false);
    };

    const handleTripPress = () => {
        navigation.navigate('TripsScreen');
    };

    const handleSubmitTripDetails = (tripDetails) => {
        console.log('Trip Details:', tripDetails);
        handleCloseTripModal();
    };

    const handleChatPress = () => {
        navigation.navigate('ChatListScreen');
    };

    return (
        <View style={styles.container} className='w-full'>
            {/* Chat Button */}
            <TouchableOpacity style={styles.button} onPress={handleChatPress}>
                <FontAwesome name="comments" size={24} color="white" />
                <Text style={styles.buttonText}>Chat</Text>
            </TouchableOpacity>

            {/* Upload Button */}
            <TouchableOpacity style={styles.button} onPress={onUploadPress}>
                <FontAwesome name="cloud-upload" size={24} color="white" />
                <Text style={styles.buttonText}>Upload</Text>
            </TouchableOpacity>

            {/* Trip Button */}
            <TouchableOpacity style={styles.button} onPress={handleTripPress}>
                <FontAwesome name="plane" size={24} color="white" />
                <Text style={styles.buttonText}>Trip</Text>
            </TouchableOpacity>

            {/* TripModal for entering trip details */}
            <TripModal
                visible={isTripModalVisible}
                onClose={handleCloseTripModal}
                onSubmit={handleSubmitTripDetails}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f57c00',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 5,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 20,
        backgroundColor: '#f57c00',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 10,
    },
});

export default ChatAndUploadButtons;
