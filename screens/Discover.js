import React, { useState, useLayoutEffect, useEffect } from 'react';
import { ToastAndroid, View, Text, SafeAreaView, Image, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, TextInput, BackHandler } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Attractions, Avatar, Hotels, NotFound, Restaurants } from '../assets';
import MenuContainer from '../components/MenuContainer';
import ItemCarDontainer from '../components/ItemCarDontainer';
import { getPlacesData } from '../api';
import ChatAndUploadButtons from '../components/ChatAndUploadButtons';
import axios from 'axios';
import { useBackHandler } from '@react-native-community/hooks';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { useFocusEffect } from '@react-navigation/native';


const Discover = ({ navigation }) => {
    const [backPressCount, setBackPressCount] = useState(0);
    const [type, setType] = useState('restaurants');
    const [isLoading, setIsLoading] = useState(false);
    const [mainData, setMainData] = useState([]);
    const [bl_lat, setBl_lat] = useState(14.7529315);
    const [bl_lng, setBl_lng] = useState(74.3379234);
    const [tr_lat, setTr_lat] = useState(15.8007631);
    const [tr_lng, setTr_lng] = useState(73.6756012);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (backPressCount === 1) {
                    // If the back button is pressed twice, exit the app
                    BackHandler.exitApp();
                    return true;
                } else {
                    // Increment the back press count
                    setBackPressCount(1);

                    // Show a toast message to the user
                    ToastAndroid.showWithGravity(
                        'Press Again to Exit',
                        ToastAndroid.SHORT,
                        ToastAndroid.BOTTOM
                    )

                    // Reset the back press count after a short delay (e.g., 2 seconds)
                    setTimeout(() => {
                        setBackPressCount(0);
                    }, 2000);

                    // Return true to prevent the default back button behavior
                    return true;
                }
            };

            // Add event listener for hardware back press
            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            // Return a cleanup function to remove the event listener
            return () => {
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            };
        }, [backPressCount])
    );


    useEffect(() => {
        if (bl_lat && bl_lng && tr_lat && tr_lng) {
            setIsLoading(true);
            getPlacesData(bl_lat, bl_lng, tr_lat, tr_lng, type).then((data) => {
                setMainData(data);
                setIsLoading(false);
            });
        }
    }, [bl_lat, bl_lng, tr_lat, tr_lng, type]);

    // Function to fetch suggestions from Photon API
    const fetchSuggestions = async (query) => {
        try {
            const response = await axios.get(`https://photon.komoot.io/api/?q=${query}&limit=5`);
            const data = response.data;
            if (data.features && data.features.length > 0) {
                const suggestions = data.features.map((feature) => ({
                    name: feature.properties.name,
                    coordinates: feature.properties.extent,
                }));
                setSuggestions(suggestions);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        }
    };

    const handleQueryChange = (text) => {
        setQuery(text);
        if (text.trim().length > 0) {
            fetchSuggestions(text);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionPress = (suggestion) => {
        console.log('Selected suggestion:', suggestion);
        setQuery(suggestion.name);
        setTr_lat(suggestion.coordinates[1]);
        setTr_lng(suggestion.coordinates[0]);
        setBl_lat(suggestion.coordinates[3]);
        setBl_lng(suggestion.coordinates[2]);
        setSuggestions([]);
    };

    useEffect(() => {
        if (bl_lat && bl_lng && tr_lat && tr_lng) {
            setIsLoading(true);
            getPlacesData(bl_lat, bl_lng, tr_lat, tr_lng, type).then((data) => {
                console.log('Received data from API:', data);
                setMainData(data);
                setIsLoading(false);
            });
        }
    }, [bl_lat, bl_lng, tr_lat, tr_lng, type]);


    return (
        <SafeAreaView className="flex items-center justify-center bg-white relative pt-8 z-50 h-full">
            <ScrollView>
                <View className="flex-row items-center justify-between px-6">
                    <View>
                        <Text className="text-[40px] text-[#0B646B] font-bold">Discover</Text>
                        <Text className="text-[#527283] text-[36px]">the beauty today</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.openDrawer()}>
                        <Image source={Avatar} style={{ width: 50, height: 50 }} />
                    </TouchableOpacity>

                </View>

                {/* Search input */}
                <View className="flex-row items-center bg-white mx-4 rounded-xl py-3 px-4 focus:shadow-2xl  shadow-lg shadow-gray-400 focus:shadow-black mt-4">
                    <TextInput
                        value={query}
                        placeholder="Search"
                        onChangeText={handleQueryChange}
                        style={{ flex: 1 }}
                    />
                </View>
                {/* Display suggestions */}
                {suggestions.length > 0 && (
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleSuggestionPress(item)}>
                                <View style={{ padding: 10 }}>
                                    <Text>{item.name}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        style={{ width: '90%', marginLeft: '5%' }}
                    />
                )}
                {/* Menu Containers */}
                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#0B646B" />
                    </View>
                ) : (
                    <ScrollView>
                        <View className="flex-row items-center justify-between px-8 mt-8">
                            <MenuContainer
                                key="hotels"
                                title="Hotels"
                                imageSrc={Hotels}
                                type={type}
                                setType={setType}
                            />

                            <MenuContainer
                                key="attractions"
                                title="Attractions"
                                imageSrc={Attractions}
                                type={type}
                                setType={setType}
                            />

                            <MenuContainer
                                key="restaurants"
                                title="Restaurants"
                                imageSrc={Restaurants}
                                type={type}
                                setType={setType}
                            />
                        </View>

                        {/* Top Tips Section */}
                        <View>
                            <View className="flex-row items-center justify-between px-4 mt-8">
                                <Text className="text-[#2C7379] text-[28px] font-bold">Top Tips</Text>
                                <TouchableOpacity className="flex-row items-center justify-center space-x-2">
                                    <Text className="text-[#A0C4C7] text-[20px] font-bold">Explore</Text>
                                    <FontAwesome name="long-arrow-right" size={24} color="#A0C4C7" />
                                </TouchableOpacity>
                            </View>

                            <View className="px-4 mt-8 flex-row items-center justify-evenly flex-wrap">
                                {mainData?.length > 0 ? (
                                    <>
                                        {mainData?.map((data, i) => (
                                            <ItemCarDontainer
                                                key={i}
                                                imageSrc={
                                                    data?.photo?.images?.medium?.url
                                                        ? data?.photo?.images?.medium?.url
                                                        : "https://cdn.pixabay.com/photo/2015/10/30/12/22/eat-1014025_1280.jpg"
                                                }
                                                title={data?.name}
                                                location={data?.location_string}
                                                data={data}
                                            />
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        <View className="w-full h-[400px] items-center space-y-8 justify-center">
                                            <Image
                                                source={NotFound}
                                                className="w-32 h-32 object-cover"
                                            />
                                            <Text className="text-2xl text-[#428288] font-semibold">
                                                Opps...No Data Found
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                )}
            </ScrollView>
            <ChatAndUploadButtons onChatPress={() => navigation.navigate('ChatScreen')} onUploadPress={() => navigation.navigate('UploadScreen')} />
        </SafeAreaView>
    );
};

export default Discover;