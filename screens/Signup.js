import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, StatusBar, Alert, Image } from "react-native";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, uploadBytes } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_AUTH, database } from "../firebaseConfig";
import { launchImageLibraryAsync } from 'expo-image-picker';

const backImage = require("../assets/backImage.png");

export default function Signup({ navigation }) {
  // State variables for user input, profile photo, and loading state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to handle selecting a profile photo using Expo ImagePicker
  // Function to handle selecting a profile photo using Expo ImagePicker
// Function to handle selecting a profile photo using Expo ImagePicker
const selectProfilePhoto = async () => {
  try {
    const result = await launchImageLibraryAsync({
      mediaTypes: 'Images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri; // Extracting the uri
      setImageUri(uri);
    }
    
  } catch (error) {
    console.error('Error selecting profile photo:', error);
  }
};



  // Function to handle sign-up
  // Function to handle sign-up
const onHandleSignup = async () => {
  setLoading(true);
  if (email !== '' && password !== '' && name !== '') {
    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;

      // Upload profile photo to Firebase Storage
      if (imageUri) {
        const response = await fetch(imageUri);
        const blob = await response.blob();

        const storageRef = ref(getStorage(), `profile_photos/${user.uid}`);
        await uploadBytes(storageRef, blob);
        const photoURL = await getDownloadURL(ref(getStorage(), `profile_photos/${user.uid}`));

        // Add user data to Firestore with profile photo URL
        await addDoc(collection(database, 'users'), {
          uid: user.uid,
          email: user.email,
          name: name,
          profilePhoto: photoURL,
        });
      } else {
        // Add user data to Firestore without profile photo
        await addDoc(collection(database, 'users'), {
          uid: user.uid,
          email: user.email,
          name: name,
        });
      }

      navigation.navigate('Discover');
    } catch (err) {
      Alert.alert("Signup error", err.message);
    } finally {
      setLoading(false);
    }
  } else {
    Alert.alert("Missing fields", "Please fill in all required fields.");
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <Image source={backImage} style={styles.backImage} />
      <View style={styles.whiteSheet} />
      <View style={styles.form}>
        <Text style={styles.title}>Sign Up</Text>

        {/* Profile photo selection */}
        <View className='flex justify-center items-center '>

        <TouchableOpacity className=' bg-gray-500 rounded-full border-4 border-black' style={styles.profilePhotoContainer} onPress={selectProfilePhoto}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.profilePhoto} />
          ) : (
            <Text style={styles.profilePhotoText}>Select Profile Photo</Text>
          )}
        </TouchableOpacity>
        </View>

        {/* Input field for user's name */}
        <TextInput
          style={styles.input}
          placeholder="Enter name"
          autoCapitalize="words"
          autoCorrect={false}
          value={name}
          onChangeText={setName}
          autoFocus={true}
        />

        {/* Input field for user's email */}
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
        />

        {/* Input field for user's password */}
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
          textContentType="password"
          value={password}
          onChangeText={setPassword}
        />

        {/* Sign-up button */}
        <TouchableOpacity style={styles.button} onPress={onHandleSignup}>
          <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}>Sign Up</Text>
        </TouchableOpacity>

        {/* Link to navigate to the login screen */}
        <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
          <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={{ color: '#f57c00', fontWeight: '600', fontSize: 14 }}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar barStyle="light-content" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: "orange",
    alignSelf: "center",
    paddingBottom: 24,
  },
  input: {
    backgroundColor: "#F6F7FB",
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
  },
  backImage: {
    width: "100%",
    height: 340,
    position: "absolute",
    top: 0,
    resizeMode: 'cover',
  },
  whiteSheet: {
    width: '100%',
    height: '75%',
    position: "absolute",
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 60,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  button: {
    backgroundColor: '#f57c00',
    height: 58,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  profilePhotoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePhotoText: {
    fontSize: 16,
    color: '#f57c00',
    fontWeight: 'bold',
  },
});
