import React, {useEffect, useState} from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Alert,
  Linking,
  AppState,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {
  button2TextColor,
  button2backgroundColor,
  MainbackgroundColor,
  buttonTextSize,
} from '../resources/styling';
import {SafeAreaView} from 'react-native';
import {SiteCommissionAction} from '../redux/slices/SiteComissionSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {isOlderVersion} from '../constants/utils';
import {useDispatch} from 'react-redux';
import DeviceInfo from 'react-native-device-info';

const {width, height} = Dimensions.get('window');

const StartingScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [isForceUpdate, setIsForceUpdate] = useState(false);
  const [latestVersion, setLatestVersion] = useState('');
  const [hasSeenUpdateAlert, setHasSeenUpdateAlert] = useState(false);
  const [apiData, setApiData] = useState(null);
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(0, {duration: 1500});
    opacity.value = withTiming(1, {duration: 1500});
  }, []);

  const textStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
    opacity: opacity.value,
  }));

  const siteCommission = async () => {
    const response = await dispatch(SiteCommissionAction());
    if (response?.payload) {
      setApiData(response?.payload);
      setLatestVersion(response?.payload?.siteAndroidVersion);
    } else if (response?.payload?.siteAndroidForceupdate === 'true') {
      setIsForceUpdate(true);
    }
  };

  const getSiteCommissionData = async () => {
    const response = await dispatch(SiteCommissionAction());
    return response?.payload || null;
  };

  useEffect(() => {
    siteCommission();
  }, []);

  useEffect(() => {
    const checkForUpdate = async () => {
      if (apiData) {
        const currentVersion = DeviceInfo.getVersion();
        const {siteAndroidForceupdate, siteAndroidVersion} = apiData;
        const hasSeenAlert = await AsyncStorage.getItem('hasSeenUpdateAlert');
        if (
          siteAndroidForceupdate === 'true' &&
          isOlderVersion(currentVersion, siteAndroidVersion)
        ) {
          setIsForceUpdate(true);
        } else {
          console.log('App is up-to-date');
        }
      }
    };

    checkForUpdate();
  }, [apiData]);

  useEffect(() => {
    const showUpdateAlert = async () => {
      if (isForceUpdate && !hasSeenUpdateAlert) {
        setTimeout(async () => {
          if (isForceUpdate) {
            Alert.alert(
              'Update Required',
              `A new version (${latestVersion}) of the app is available. Please update to continue.`,
              [
                {
                  text: 'Update',
                  onPress: async () => {
                    Linking.openURL(
                      'https://play.google.com/store/apps/details?id=com.organizemygroup.app',
                    );
                    await AsyncStorage.setItem('hasSeenUpdateAlert', 'true');
                    setHasSeenUpdateAlert(true);
                  },
                },
              ],
              {cancelable: false},
            );
          }
        }, 2000);
      } else if (
        !isForceUpdate &&
        isOlderVersion(DeviceInfo.getVersion(), latestVersion) &&
        !hasSeenUpdateAlert
      ) {
        setTimeout(async () => {
          Alert.alert(
            'Update Available',
            `A new version (${latestVersion}) of the app is available.`,
            [
              {
                text: 'Update',
                onPress: async () => {
                  Linking.openURL(
                    'https://play.google.com/store/apps/details?id=com.organizemygroup.app',
                  );
                  await AsyncStorage.setItem('hasSeenUpdateAlert', 'true');
                  setHasSeenUpdateAlert(true);
                },
              },
              {
                text: 'Cancel',
                onPress: () => {},
              },
            ],
            {cancelable: true},
          );
        }, 2000);
      }
    };

    showUpdateAlert();
  }, [isForceUpdate, latestVersion, hasSeenUpdateAlert]);

  const handleAppForegroundUpdateCheck = async () => {
    const payload = await getSiteCommissionData();
    if (!payload) return;

    const currentVersion = DeviceInfo.getVersion();
    const siteAndroidVersion = payload.siteAndroidVersion;
    const isForceUpdate =
      payload?.siteAndroidForceupdate?.toLowerCase() === 'true';

    if (isOlderVersion(currentVersion, siteAndroidVersion)) {
      setLatestVersion(siteAndroidVersion);
      setIsForceUpdate(isForceUpdate);

      Alert.alert(
        isForceUpdate ? 'Update Required' : 'Update Available',
        `A new version (${siteAndroidVersion}) of the app is available.${
          isForceUpdate ? ' Please update to continue.' : ''
        }`,
        [
          {
            text: 'Update',
            onPress: () => {
              Linking.openURL(
                'https://play.google.com/store/apps/details?id=com.organizemygroup.app',
              );
            },
          },
          !isForceUpdate && {
            text: 'Cancel',
            onPress: () => {},
          },
        ].filter(Boolean),
        {cancelable: !isForceUpdate},
      );
    } else {
      console.log('App is up-to-date');
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async nextAppState => {
        if (nextAppState === 'active') {
          console.log('App has come to the foreground=====');
          await handleAppForegroundUpdateCheck();
        }
      },
    );
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <View style={styles.splashScreen}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={MainbackgroundColor}
          />
          <Image
            source={require('../assets/splashicon.png')}
            style={styles.splashicon}
            resizeMode="contain"
          />
          <View style={styles.textcontainer}>
            <Animated.Text style={[styles.text, textStyle]}>
              Let's get to your group!
            </Animated.Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Selection')}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {flex: 1, backgroundColor: 'white'},
  container: {
    flex: 1,
  },
  splashicon: {
    width: width * 0.8,
    height: height * 0.4,
  },
  splashScreen: {
    backgroundColor: MainbackgroundColor,
    flex: 1,
    alignItems: 'center',
    paddingTop: height * 0.17,
  },
  text: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  textcontainer: {
    marginTop: height * 0.15,
  },
  button: {
    borderRadius: 10,
    width: width * 0.9,
    marginTop: 30,
    position: 'absolute',
    bottom: 40,
    backgroundColor: button2backgroundColor,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: buttonTextSize,
    padding: 10,
    color: button2TextColor,
    fontWeight: 'bold',
  },
});

export default StartingScreen;
