import React, {useEffect, useState} from 'react';
import {
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Alert,
  PermissionsAndroid,
  Linking,
  Platform,
} from 'react-native';
import {
  NavigationContainer,
  useNavigationState,
} from '@react-navigation/native';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import SplashScreen from './src/components/splashscreen';
import SignUpScreen from './src/screens/SignUpScreen';
import Login from './src/screens/LoginScreen';
import Dashboard from './src/screens/Dashboard';
import {Provider, useDispatch} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import store from './src/redux/store';
import Selection from './src/screens/Selection';
import OtpVerify from './src/screens/OtpVerify';
import {ThemeProvider} from './src/context/themeContext';
import ForgotPassword from './src/screens/ForgotPassword';
import VerifyNow from './src/screens/VerifyNow';
import MyEvents from './src/screens/MyEvents';
import UpcomingEvents from './src/screens/UpcomingEvents';
import MyGroups from './src/screens/MyGroups';
import EventDetails from './src/screens/EventDetails';
import GroupDetails from './src/screens/GroupDetails';
import JoinGroup from './src/screens/JoinGroup';
import SearchGroup from './src/screens/SearchGroup';
import CreateGroup1 from './src/screens/CreateGroup';
import Payments from './src/screens/Payments';
import Profile from './src/screens/Profile';
import UserProfile from './src/screens/UserProfile';
import Notifcations from './src/screens/Notifcations';

import StartingScreen from './src/screens/StartingScreen';
import CreateEvent from './src/screens/CreateEvent';
import CustomDrawerContent from './src/components/DrawerItems';
import ResetPassword from './src/screens/ResetPassword';
import NetInfo from '@react-native-community/netinfo';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Forums from './src/screens/Forums';
import {PaperProvider} from 'react-native-paper';
import DeviceInfo from 'react-native-device-info';
import analytics from '@react-native-firebase/analytics';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const MyEventsStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="My Events"
      screenOptions={{headerShown: false, lazy: true}}>
      <Stack.Screen name="My Events" component={MyEvents} />
      <Stack.Screen name="Event Details" component={EventDetails} />
      <Stack.Screen name="User Profile" component={UserProfile} />
      <Stack.Screen name="Group Details" component={GroupDetails} />
      <Stack.Screen name="Message Board" component={Forums} />
      <Stack.Screen name="Create Event" component={CreateEvent} />
      <Stack.Screen name="Upcoming Events" component={UpcomingEvents} />
      <Stack.Screen name="CreateGroup" component={CreateGroup1} />
    </Stack.Navigator>
  );
};

const UpcomingEventsStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Upcoming Events"
      screenOptions={{headerShown: false, lazy: true}}>
      <Stack.Screen name="Upcoming Events" component={UpcomingEvents} />
      <Stack.Screen name="Event Details" component={EventDetails} />
      <Stack.Screen name="User Profile" component={UserProfile} />
      <Stack.Screen name="My Events" component={MyEvents} />
      <Stack.Screen name="Create Event" component={CreateEvent} />
      <Stack.Screen name="Group Details" component={GroupDetails} />
      <Stack.Screen name="Message Board" component={Forums} />
      <Stack.Screen name="CreateGroup" component={CreateGroup1} />
    </Stack.Navigator>
  );
};

const MyGroupsStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="MyGroups"
      screenOptions={{headerShown: false, lazy: true}}>
      <Stack.Screen name="MyGroups" component={MyGroups} />
      <Stack.Screen name="Group Details" component={GroupDetails} />
      <Stack.Screen name="Message Board" component={Forums} />
      <Stack.Screen name="Create Event" component={CreateEvent} />
      <Stack.Screen name="Upcoming Events" component={UpcomingEvents} />
      <Stack.Screen name="Event Details" component={EventDetails} />
      <Stack.Screen name="User Profile" component={UserProfile} />
      <Stack.Screen name="MyEvents" component={MyEvents} />
      <Stack.Screen name="Payments" component={Payments} />
      <Stack.Screen name="CreateGroup" component={CreateGroup1} />
    </Stack.Navigator>
  );
};

const JoinGroupStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="JoinGroup"
      screenOptions={{headerShown: false, lazy: true}}>
      <Stack.Screen name="JoinGroup" component={JoinGroup} />
      <Stack.Screen name="Group Details" component={GroupDetails} />
      <Stack.Screen name="Message Board" component={Forums} />
      <Stack.Screen name="Search Group" component={SearchGroup} />
      <Stack.Screen name="Create Event" component={CreateEvent} />
      <Stack.Screen name="Upcoming Events" component={UpcomingEvents} />
      <Stack.Screen name="Event Details" component={EventDetails} />
      <Stack.Screen name="User Profile" component={UserProfile} />
      <Stack.Screen name="Payments" component={Payments} />
      <Stack.Screen name="CreateGroup" component={CreateGroup1} />
    </Stack.Navigator>
  );
};

const CreateGroupStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="CreateGroup"
      screenOptions={{headerShown: false, lazy: true}}>
      <Stack.Screen name="CreateGroup" component={CreateGroup1} />
      <Stack.Screen name="MyGroups" component={MyGroups} />
      <Stack.Screen name="Group Details" component={GroupDetails} />
      <Stack.Screen name="Message Board" component={Forums} />
      <Stack.Screen name="Upcoming Events" component={UpcomingEvents} />
      <Stack.Screen name="User Profile" component={UserProfile} />
      <Stack.Screen name="Event Details" component={EventDetails} />
      <Stack.Screen name="Create Event" component={CreateEvent} />
      <Stack.Screen name="Payments" component={Payments} />
    </Stack.Navigator>
  );
};

const NotifcationsStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Notificationss"
      screenOptions={{headerShown: false, lazy: true}}>
      <Stack.Screen name="Notificationss" component={Notifcations} />
      <Stack.Screen name="Group Details" component={GroupDetails} />
      <Stack.Screen name="Message Board" component={Forums} />
      <Stack.Screen name="Upcoming Events" component={UpcomingEvents} />
      <Stack.Screen name="Event Details" component={EventDetails} />
      <Stack.Screen name="Create Event" component={CreateEvent} />
      <Stack.Screen name="CreateGroup" component={CreateGroup1} />
      <Stack.Screen name="Payments" component={Payments} />
      <Stack.Screen name="User Profile" component={UserProfile} />
    </Stack.Navigator>
  );
};

const DrawerNavigator = () => {
  const currentScreen = useNavigationState(state => {
    const route = state.routes[state.index];
    return route.name;
  });

  return (
    <Drawer.Navigator
      initialRouteName="DashboardHome"
      drawerContent={({navigation, state}) => (
        <CustomDrawerContent
          navigation={navigation}
          currentScreen={state.routes[state.index].name}
        />
      )}
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        swipeEnabled: false,
        gestureEnabled: true,
        drawerStyle: {
          width: '75%',
        },
        drawerType: 'slide',
        drawerAnimation: 'slide',
        lazy: true,
      }}>
      <Drawer.Screen name="DashboardHome" component={Dashboard} />
      <Drawer.Screen
        name="My Events"
        component={MyEventsStack}
        options={{unmountOnBlur: true}}
      />
      <Drawer.Screen
        name="Upcoming Events"
        component={UpcomingEventsStack}
        options={{unmountOnBlur: true}}
      />
      <Drawer.Screen
        name="My Groups"
        component={MyGroupsStack}
        options={{unmountOnBlur: true}}
      />
      <Drawer.Screen
        name="Join Group"
        component={JoinGroupStack}
        options={{unmountOnBlur: true}}
      />
      <Drawer.Screen
        name="Create Group"
        component={CreateGroupStack}
        options={{unmountOnBlur: true}}
      />
      <Drawer.Screen name="Payments" component={Payments} />
      <Drawer.Screen name="Search Group" component={SearchGroup} />
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen
        name="Notifications"
        component={NotifcationsStack}
        options={{unmountOnBlur: true}}
      />
      <Drawer.Screen
        name="Message Board"
        component={Forums}
        options={{unmountOnBlur: true}}
      />
    </Drawer.Navigator>
  );
};

const App = () => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const [isConnected, setIsConnected] = useState(true);
  const routeNameRef = React.useRef();
  const navigationRef = React.useRef();

  const transitionConfig = {
    animation: 'timing',
    config: {duration: 300},
  };

  const screenOptions = {
    headerShown: false,
    gestureDirection: 'horizontal',
    ...TransitionPresets.SlideFromRightIOS,
    transitionSpec: {
      open: transitionConfig,
      close: transitionConfig,
    },
    cardStyleInterpolator: ({current: {progress}}) => {
      return {
        cardStyle: {
          transform: [{scale: Animated.multiply(progress, scaleValue)}],
        },
      };
    },
  };

  const getToken = async () => {
    const token = await messaging().getToken();
    if (token) {
      await AsyncStorage.setItem('fcmToken', token);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }
    getToken();
  }, []);

  const showNoConnectionAlert = () => {
    Alert.alert(
      'No Internet Connection',
      'Please check your internet connection and try again.',
      [
        {
          text: 'Retry',
          onPress: checkConnection,
        },
      ],
      {cancelable: false},
    );
  };

  const checkConnection = async () => {
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected);

    if (!state.isConnected) {
      showNoConnectionAlert();
    }
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);

      if (!state.isConnected) {
        showNoConnectionAlert();
      }
    });

    checkConnection();

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ThemeProvider>
      <PaperProvider>
        <Provider store={store.store}>
          <PersistGate loading={null} persistor={store.persistor}>
            <NavigationContainer
              ref={navigationRef}
              onReady={() => {
                routeNameRef.current =
                  navigationRef.current.getCurrentRoute().name;
              }}
              onStateChange={async () => {
                const previousRouteName = routeNameRef.current;
                const currentRouteName =
                  navigationRef.current.getCurrentRoute().name;
                if (previousRouteName !== currentRouteName) {
                  await analytics().logScreenView({
                    screen_name: currentRouteName,
                    screen_class: currentRouteName,
                  });
                }
                routeNameRef.current = currentRouteName;
              }}>
              <StatusBar barStyle="dark-content" backgroundColor="white" />
              <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={screenOptions}>
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Starting" component={StartingScreen} />
                <Stack.Screen name="Selection" component={Selection} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Signup" component={SignUpScreen} />
                <Stack.Screen name="Dashboard" component={DrawerNavigator} />
                <Stack.Screen
                  name="ForgotPassword"
                  component={ForgotPassword}
                  options={{headerShown: false}}
                />
                <Stack.Screen
                  name="Verify Now"
                  component={VerifyNow}
                  options={{headerShown: false}}
                />
                <Stack.Screen
                  name="ResetPassword"
                  component={ResetPassword}
                  options={{headerShown: false}}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </PersistGate>
        </Provider>
      </PaperProvider>
    </ThemeProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  drawerItemsContainer: {
    flex: 1,
    paddingTop: 5,
    paddingHorizontal: 10,
  },
  drawerLabel: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
