import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';

const ChatInput = ({ onSendMessage }) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim()) {
            onSendMessage(text);
            setText('');
        }
    };

    return (
        <View style={{ flexDirection: 'row', padding: 10 }}>
            <TextInput
                style={{ flex: 1, borderWidth: 1, padding: 5 }}
                placeholder="Type a message..."
                value={text}
                onChangeText={setText}
            />
            <Button title="Send" onPress={handleSend} />
        </View>
    );
};

export default ChatInput;