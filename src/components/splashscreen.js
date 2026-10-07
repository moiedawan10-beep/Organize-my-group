import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const {width,height} = Dimensions.get('window')

const SplashScreen = ({ navigation }) => {
    useEffect(() => {
        const checkAccessToken = async () => {
            try {
                const accessToken = await AsyncStorage.getItem('accessToken');
                if (accessToken) {
                    navigation.replace('Dashboard');
                } else {
                    navigation.replace('Starting');
                }
            } catch (error) {
                console.error('Error reading access token from AsyncStorage:', error);
                navigation.replace('Login');
            }
        };
        const timer = setTimeout(() => {
            checkAccessToken();
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            {/* <Image
                source={require('../assets/logo.png')}
                style={styles.splashicon}
                resizeMode='contain'
            /> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    splashicon: {
        width: width * 0.8, 
        height: height * 0.4, 
    },
});

export default SplashScreen;
