import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Constants from 'expo-constants';
import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library'; //for saving image to phone
import Button from './src/components/Button';

import axios from 'axios';

import * as Speech from 'expo-speech';

export default function App() {
    //var setup
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [image, setImage] = useState(null);
    const [base64Image, setBase64Image] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
    const cameraRef = useRef(null);
    const [material, setMaterial] = useState(null);

    const [jsonData, setJsonData] = useState(null);

    async function postImage() {
        const dataToSend = {
            base64Image: base64Image
        };
        
        try {
           let res = await axios.post("https://ad65-90-251-175-217.ngrok-free.app", dataToSend);
            if(res.status == 201){
                // test for status you want, etc
                console.log(res.status)
                speakText(res.data["material"])
            }    
            // Don't forget to return something   
            return res.data
        }
        catch (err) {
            console.error(err);
        }
    };

    const speakText = async (textToSpeak) => {
        try {
          await Speech.speak(textToSpeak, { rate: 0.75 }); // You can adjust the speech rate as needed.
        } catch (error) {
          console.error("An error occurred while speaking:", error);
        }
    };
    //asking for permission to use camera
    useEffect(() => {
        (async () => {
            MediaLibrary.requestPermissionsAsync();
            const cameraStatus = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(cameraStatus.status === 'granted');
        })();
    }, []);

    //takes picture, saves to data as uri
    const takePicture = async () => {
        if (cameraRef) {
            try {
                const options = { quality: 0.7, base64: true };
                const data = await cameraRef.current.takePictureAsync(options);
                console.log(data.uri);
                setImage(data.uri);
                setBase64Image(data.base64);
            } catch (error) {
                console.log(error);
            }
        }
    };

    //saves picture to client device
    const savePicture = async () => {
        if (image) {
            try {
                postImage()
                .then(res => alert(res["material"]));
                setImage(null);
                console.log('saved successfully');
            } catch (error) {
                console.log(error);
            }
        }
    };

    if (hasCameraPermission === false) {
        return <Text>No access to camera</Text>;
    }

    //frontend
    return (
        <View style={styles.container}>
            {!image ? (
                <Camera
                    style={styles.camera}
                    type={type}
                    ref={cameraRef}
                    flashMode={flash}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            paddingHorizontal: 30,
                        }}
                    >
                        <Button
                            onPress={() =>
                                setFlash(
                                    flash === Camera.Constants.FlashMode.off
                                        ? Camera.Constants.FlashMode.on
                                        : Camera.Constants.FlashMode.off
                                )
                            }
                            icon="flash"
                            color={flash === Camera.Constants.FlashMode.off ? 'gray' : '#fff'}
                        />
                    </View>
                </Camera>
            ) : (
                <Image source={{ uri: image }} style={styles.camera} />
            )}

            <View style={styles.controls}>
                {image ? (
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            paddingHorizontal: 50,
                        }}
                    >
                        <Button
                            title="Re-take"
                            onPress={() => setImage(null)}
                            icon="retweet"
                        />
                        <Button title="Save" onPress={savePicture} icon="check" />
                    </View>
                ) : (
                    <Button title="" onPress={takePicture} icon="camera" />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingTop: Constants.statusBarHeight,
        backgroundColor: '#000',
        padding: 8,
    },
    controls: {
        flex: 0.5,
    },
    button: {
        height: 40,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#E9730F',
        marginLeft: 10,
    },
    camera: {
        flex: 5,
        borderRadius: 20,
    },
    topControls: {
        flex: 1,
    },
});