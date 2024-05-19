import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Image } from 'react-native';
import ImageView from 'react-native-image-viewing';

const FullScreenImageView = ({ mediaItems, tripName }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isImageViewVisible, setImageViewVisible] = useState(false);

    // Filter media items based on tripName
    const filteredMediaItems = mediaItems.filter(item => item.tripName === tripName);

    const openImageView = (index) => {
        setCurrentImageIndex(index);
        setImageViewVisible(true);
    };

    return (
        <View>
            {/* Display media items */}
            <FlatList
                data={filteredMediaItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <TouchableOpacity onPress={() => openImageView(index)}>
                        <Image source={{ uri: item.downloadURL }} style={{ width: 100, height: 100 }} />
                    </TouchableOpacity>
                )}
                horizontal
            />

            {/* Image viewing modal */}
            <ImageView
                images={filteredMediaItems.map((item) => ({ uri: item.downloadURL }))}
                imageIndex={currentImageIndex}
                visible={isImageViewVisible}
                onRequestClose={() => setImageViewVisible(false)}
            />
        </View>
    );
};

export default FullScreenImageView;
