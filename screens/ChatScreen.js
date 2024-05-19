import React, { useState, useEffect, useCallback } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { collection, addDoc, orderBy, query, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { FIREBASE_AUTH, database } from '../firebaseConfig';
import { useRoute } from '@react-navigation/native';
import { Image, Text, View, StyleSheet } from 'react-native';
import { useBackHandler } from '@react-native-community/hooks';

export default function ChatScreen({ navigation }) {
    const [backPressCount, setBackPressCount] = useState(1);
    useBackHandler(() => {
        if (backPressCount === 1) {
            navigation.navigate('ChatListScreen');
        }
    });
    const [messages, setMessages] = useState([]);
    const [otherUserAvatar, setOtherUserAvatar] = useState(null);
    const route = useRoute();

    const otherUserId = route.params?.userId;
    const otherUserName = route.params?.name;
    const currentUserId = FIREBASE_AUTH.currentUser?.uid;
    const profilePhoto = route.params?.profilePhoto

    const chatRoomId = currentUserId < otherUserId ? `${currentUserId}_${otherUserId}` : `${otherUserId}_${currentUserId}`;

    useEffect(() => {
        const fetchOtherUserProfile = async () => {
            try {
                const otherUserDoc = await getDoc(doc(database, 'users', otherUserId));
                if (otherUserDoc.exists()) {
                    setOtherUserAvatar(otherUserDoc.data().profileImage);
                }
            } catch (error) {
                console.error('Error fetching other user profile:', error);
            }
        };

        fetchOtherUserProfile();
    }, [otherUserId]);

    useEffect(() => {
        const collectionRef = collection(database, `chats/${chatRoomId}/messages`);
        const q = query(collectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, querySnapshot => {
            setMessages(
                querySnapshot.docs.map(doc => ({
                    _id: doc.data()._id,
                    createdAt: doc.data().createdAt.toDate(),
                    text: doc.data().text,
                    user: doc.data().user,
                }))
            );
        });

        return () => {
            unsubscribe();
        };
    }, [chatRoomId]);

    const onSend = useCallback((messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));

        const { _id, createdAt, text, user } = messages[0];
        addDoc(collection(database, `chats/${chatRoomId}/messages`), {
            _id,
            createdAt,
            text,
            user,
        });
    }, [chatRoomId]);

    return (
        <>
            <View style={styles.headerContainer}>
                <Image style={styles.userImage} source={{ uri: profilePhoto || 'https://imgs.search.brave.com/vOO7qV91FV-HWky8Me3E3_SgebusEx08NPtrBHwchcA/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2Y1L2E2/LzE5L2Y1YTYxOTMw/NTFiYmExZTFiMTIy/ODcxN2FhYmY2M2Jk/LmpwZw' }} />
                <Text style={styles.userName}>{otherUserName}</Text>
            </View>
            <GiftedChat
                messages={messages}
                onSend={onSend}
                user={{
                    _id: currentUserId,
                    avatar: 'https://i.pravatar.cc/300', // Replace with the current user's avatar URL if available
                }}
                renderAvatar={(props) => (
                    <Image
                        source={{ uri: props.currentMessage.user._id === currentUserId ? 'https://i.pravatar.cc/300' : otherUserAvatar || 'https://i.pravatar.cc/300' }}
                        style={styles.chatAvatar}
                    />
                )}
            />
        </>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#FFA500', // Orange background
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    userImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    userName: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 12,
    },
    chatAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
});
