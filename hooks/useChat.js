import { useState, useEffect } from 'react';
import { listenToChatMessages, sendChatMessage } from '../api/chatAPI';

export const useChat = (chatId) => {
    const [messages, setMessages] = useState([]);

    // Listen to chat messages in real-time
    useEffect(() => {
        const unsubscribe = listenToChatMessages(chatId, setMessages);
        return () => unsubscribe();
    }, [chatId]);

    // Function to send a chat message
    const sendMessage = (messageData) => {
        sendChatMessage(chatId, messageData);
    };

    return { messages, sendMessage };
};
