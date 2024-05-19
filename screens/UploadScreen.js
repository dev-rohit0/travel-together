import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Image, TouchableOpacity, TextInput, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FIREBASE_APP } from '../firebaseConfig';
import FullScreenImageView from '../components/FullScreenImageView';
import { SafeAreaView } from 'react-native-safe-area-context';

const UploadScreen = () => {
    const [mediaItems, setMediaItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [tripName, setTripName] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const storage = getStorage(FIREBASE_APP);
    const db = getFirestore(FIREBASE_APP);
    const auth = getAuth(FIREBASE_APP);
    const user = auth.currentUser;
    const mediaCollectionRef = collection(db, 'media');

    const fetchMediaItems = async () => {
        if (!user) return;

        try {
            const q = query(mediaCollectionRef, where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const mediaList = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setMediaItems(mediaList);
        } catch (error) {
            console.error('Error fetching media items:', error);
        }
    };

    const handleNewMediaUpload = async () => {
        if (!user) return;

        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access media library denied');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: false,
                aspect: [4, 3],
                quality: 1,
                selectionLimit: 5,
            });

            if (result.canceled) {
                console.log('User canceled media selection');
                return;
            }

            setIsLoading(true);
            setIsModalVisible(true);

            const uploadMedia = async (tripName) => {
                for (const asset of result.assets) {
                    const { uri } = asset;
                    console.log('Selected media URI:', uri);

                    const response = await fetch(uri);
                    const blob = await response.blob();
                    const storageRef = ref(storage, `uploads/${user.uid}/${Date.now()}`);

                    await uploadBytes(storageRef, blob);
                    const downloadURL = await getDownloadURL(storageRef);

                    await addDoc(mediaCollectionRef, {
                        downloadURL,
                        timestamp: Date.now(),
                        userId: user.uid,
                        tripName,
                    });
                }

                fetchMediaItems();
            };

            uploadMedia(tripName);
        } catch (error) {
            console.error('Error uploading new media:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMediaItems();
    }, [user]);

    const handleModalSubmit = () => {
        setIsModalVisible(false);
        handleNewMediaUpload();
    };

    const renderTrip = ({ item }) => (
        <View style={styles.tripContainer}>
            <Text style={styles.tripName}>{item.tripName}</Text>
            
            <FullScreenImageView tripName={item.tripName} mediaItems={mediaItems} />

            
        </View>
    );

    const groupedMediaItems = mediaItems.reduce((groups, item) => {
        const trip = groups[item.tripName] || { tripName: item.tripName, media: [] };
        trip.media.push(item);
        groups[item.tripName] = trip;
        return groups;
    }, {});

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Uploaded Media</Text>

            <FlatList
                data={Object.values(groupedMediaItems)}
                keyExtractor={(item) => item.tripName}
                renderItem={renderTrip}
            />

            <TouchableOpacity className='bg-orange-400 rounded-xl shadow-md shadow-black' onPress={() => setIsModalVisible(true)} disabled={isLoading} ><Text className='text-white text-base font-bold text-center py-4 '>Upload New Media</Text></TouchableOpacity>
            {isLoading && <Text>Uploading...</Text>}

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter Trip Name</Text>
                        <TextInput
                            style={styles.textInput}
                            value={tripName}
                            onChangeText={setTripName}
                            placeholder="Trip Name"
                        />
                        <Button title='Submit' onPress={handleModalSubmit} />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    tripContainer: {
        marginBottom: 20,
    },
    tripName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    mediaImage: {
        width: 100,
        height: 100,
        resizeMode: 'cover',
        borderRadius: 8,
        marginRight: 10,
    },
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
        marginBottom: 10,
    },
    textInput: {
        width: '100%',
        padding: 10,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
    },
});

export default UploadScreen;
