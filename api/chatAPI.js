import { db } from '../firebaseConfig'; // Import your Firestore database

// Function to send a chat message
export const sendChatMessage = async (chatId, messageData) => {
    try {
        await db.collection('chats').doc(chatId).collection('messages').add(messageData);
    } catch (error) {
        console.error('Error sending message:', error);
    }
};

// Function to listen to chat messages in real-time
export const listenToChatMessages = (chatId, callback) => {
    db.collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot((snapshot) => {
            const messages = [];
            snapshot.forEach((doc) => {
                messages.push({ id: doc.id, ...doc.data() });
            });
            callback(messages);
        });
};
