// ChatMessages.js
import React from 'react';
import { FlatList, Text, View } from 'react-native';

const ChatMessages = ({ messages }) => {
    return (
        <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View>
                    <Text>{item.text}</Text>
                </View>
            )}
        />
    );
};

export default ChatMessages;

// ChatInput.js

