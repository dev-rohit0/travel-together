// DrawerContent.js
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

const DrawerContent = ({ navigation }) => {
    return (
        <View style={{ flex: 1, paddingTop: 50 }}>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                <Text>Edit Profile</Text>
            </TouchableOpacity>
            {/* Add other options here */}
        </View>
    );
};

export default DrawerContent;
