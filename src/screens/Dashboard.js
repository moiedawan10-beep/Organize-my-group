import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
  BackHandler,
  SafeAreaView,
  Platform,
  TouchableWithoutFeedback,
  Alert,
  Linking,
  AppState,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

// Components
import DashboardHeader from '../components/DashboardHeader';
import DashboardCard from '../components/DashboardCard';
import CustomAlertModal from '../components/CustomAlertModal';

// Constants and Assets
import {card1Color, card2Color, card3Color} from '../resources/styling';
import calendar from '../assets/card/icon-events.png';
import upcoming from '../assets/card/icon-upcoming.png';
import mygroups from '../assets/card/mygroups.png';
import payments from '../assets/card/icon-payment.png';
import messaging, {getMessaging} from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import {SiteCommissionAction} from '../redux/slices/SiteComissionSlice';
import {useDispatch} from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import {isOlderVersion} from '../constants/utils';

const {width, height} = Dimensions.get('window');

const Dashboard = ({navigation}) => {
  const dispatch = useDispatch();
  // State management
  const [modalState, setModalState] = useState({
    isVisible: false,
    type: '',
  });
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isForceUpdate, setIsForceUpdate] = useState(false);
  const [latestVersion, setLatestVersion] = useState('');
  const [apiData, setApiData] = useState(null);

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
    handleAppForegroundUpdateCheck();
  }, []);

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
          await handleAppForegroundUpdateCheck();
        }
      },
    );
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    messaging()
      .requestPermission()
      .then(authStatus => {
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      });

    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'default-channel-id',
          channelName: 'Default Channel',
          channelDescription: 'A channel to categorize notifications',
          playSound: true,
          soundName: 'default',
          importance: PushNotification.Importance.HIGH,
          vibrate: true,
        },
        created => console.log(`Channel created: ${created}`),
      );
    }

    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      PushNotification.localNotification({
        channelId: 'default-channel-id',
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
      });
    });

    messaging().setBackgroundMessageHandler(async message => {
      console.log('Background Message in DashBoard Screen:', message);
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage?.data?.object_type === 'group') {
        navigation.navigate('Notifications');
      } else {
        navigation.navigate('DashboardHome');
      }
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          if (remoteMessage?.data?.object_type === 'group') {
            navigation.navigate('Notifications');
          } else {
            navigation.navigate('DashboardHome');
          }
        }
      });

    return () => {
      unsubscribeForeground();
    };
  }, []);

  // Back handler setup
  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        setModalState({isVisible: true, type: 'exit'});
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );
      return () => backHandler.remove();
    }, []),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setDropdownVisible(false);
    });
    return unsubscribe;
  }, [navigation]);

  // Handler functions
  const handleExitConfirm = () => {
    BackHandler.exitApp();
    setModalState({isVisible: false, type: ''});
  };

  const handleModalClose = () => {
    setModalState({isVisible: false, type: ''});
  };

  const navigateToScreen = screenName => {
    navigation.navigate(screenName);
  };

  // Card components
  const renderMainCards = () => (
    <>
      <DashboardCard
        backgroundColor={card1Color}
        name="My Events"
        imagesource={calendar}
        onPress={() => navigateToScreen('My Events')}
      />
      <DashboardCard
        backgroundColor={card2Color}
        name="Upcoming"
        imagesource={upcoming}
        onPress={() => navigateToScreen('Upcoming Events')}
      />
      <DashboardCard
        backgroundColor={card3Color}
        name="My Groups"
        imagesource={mygroups}
        onPress={() => navigateToScreen('My Groups')}
      />
    </>
  );

  const renderActionCards = () => (
    <>
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigateToScreen('Join Group')}>
        <View style={[styles.cardContent, {backgroundColor: card1Color}]}>
          <Image
            source={require('../assets/card/icon-joingroup.png')}
            style={styles.cardIcon}
          />
          <Image
            source={require('../assets/card/plus.png')}
            style={styles.plusIcon}
          />
        </View>
        <Text style={styles.cardText}>Join a Group</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigateToScreen('Create Group')}>
        <View style={[styles.cardContent, {backgroundColor: card2Color}]}>
          <Image
            source={require('../assets/card/Vector.png')}
            style={styles.createIcon}
          />
          <Image
            source={require('../assets/card/createplus.png')}
            style={styles.createPlusIcon}
          />
        </View>
        <Text style={styles.cardText}>Create Group</Text>
      </TouchableOpacity>
    </>
  );

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const closeDropdown = () => {
    if (dropdownVisible) {
      setDropdownVisible(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={closeDropdown}>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <DashboardHeader
            dropdownVisible={dropdownVisible}
            toggleDropdown={toggleDropdown}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {renderMainCards()}
          {renderActionCards()}

          <DashboardCard
            backgroundColor={card3Color}
            name="Payment Methods"
            imagesource={payments}
            onPress={() => navigateToScreen('Payments')}
          />
        </ScrollView>

        <CustomAlertModal
          visible={modalState.isVisible}
          onClose={handleModalClose}
          onOperation={handleExitConfirm}
          onCancel={handleModalClose}
          title="Organize My Group"
          subtitle="Are you sure you want to exit?"
          operationButtonLabel="Exit"
          cancelButtonLabel="Cancel"
          IconName="exit-to-app"
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    zIndex: 1,
  },
  scrollContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingTop: '5%',
    paddingBottom: 100,
    marginTop: 10,
  },
  actionCard: {
    width: width * 0.38,
    alignSelf: 'center',
    marginHorizontal: 10,
    marginBottom: 20,
  },
  cardContent: {
    height: height * 0.15,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    position: 'relative',
    padding: 10,
  },
  cardText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 5,
    color: 'black',
    fontWeight: '500',
  },
  cardIcon: {
    width: width * 0.15,
    height: width * 0.15,
    resizeMode: 'contain',
  },
  createIcon: {
    width: width * 0.13,
    height: width * 0.13,
    resizeMode: 'contain',
  },
  plusIcon: {
    position: 'absolute',
    width: width * 0.05,
    height: width * 0.05,
    right: width * 0.165,
    resizeMode: 'contain',
    top: height * 0.08,
  },
  createPlusIcon: {
    position: 'absolute',
    width: width * 0.045,
    height: width * 0.045,
    right: width * 0.14,
    resizeMode: 'contain',
    top: height * 0.09,
  },
});

export default Dashboard;
