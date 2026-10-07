/* global jest */
import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock'),
);
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

const mockMessaging = () => ({
  getToken: jest.fn(() => Promise.resolve('test-token')),
  requestPermission: jest.fn(() => Promise.resolve(1)),
  onMessage: jest.fn(() => jest.fn()),
  onTokenRefresh: jest.fn(() => jest.fn()),
  setBackgroundMessageHandler: jest.fn(),
  onNotificationOpenedApp: jest.fn(() => jest.fn()),
  getInitialNotification: jest.fn(() => Promise.resolve(null)),
});
jest.mock('@react-native-firebase/messaging', () => {
  const messaging = jest.fn(mockMessaging);
  messaging.AuthorizationStatus = {AUTHORIZED: 1, PROVISIONAL: 2};
  return {
    __esModule: true,
    default: messaging,
    getMessaging: jest.fn(mockMessaging),
  };
});
jest.mock('@react-native-firebase/analytics', () => ({
  __esModule: true,
  default: () => ({
    logScreenView: jest.fn(),
    logEvent: jest.fn(),
    setUserId: jest.fn(),
  }),
}));
jest.mock('@react-native-firebase/crashlytics', () => ({
  __esModule: true,
  default: () => ({log: jest.fn(), recordError: jest.fn()}),
}));
jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: () => ({signInWithCredential: jest.fn()}),
}));

jest.mock('react-native-image-crop-picker', () => ({
  openPicker: jest.fn(),
  openCamera: jest.fn(),
  clean: jest.fn(),
}));
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
}));
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  createChannel: jest.fn(),
  localNotification: jest.fn(),
  Importance: {HIGH: 4},
}));
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn(),
    displayNotification: jest.fn(),
    onForegroundEvent: jest.fn(() => jest.fn()),
    onBackgroundEvent: jest.fn(),
  },
  AndroidImportance: {HIGH: 4},
  EventType: {},
}));
jest.mock('react-native-device-info', () => ({
  getVersion: jest.fn(() => '1.1.3'),
  getBuildNumber: jest.fn(() => '15'),
  getUniqueId: jest.fn(() => Promise.resolve('test-device')),
}));
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
  statusCodes: {},
}));
jest.mock('react-native-permissions', () =>
  require('react-native-permissions/mock'),
);
jest.mock('react-native-blob-util', () => ({
  fs: {dirs: {}},
  config: jest.fn(),
}));
jest.mock('rn-fetch-blob', () => ({fs: {dirs: {}}, config: jest.fn()}));
jest.mock('react-native-splash-screen', () => ({
  hide: jest.fn(),
  show: jest.fn(),
}));
jest.mock('react-native-webview', () => ({WebView: 'WebView'}));
jest.mock('@invertase/react-native-apple-authentication', () => ({
  appleAuth: {performRequest: jest.fn(), Operation: {}, Scope: {}},
  appleAuthAndroid: {configure: jest.fn(), signIn: jest.fn()},
}));
jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
  getString: jest.fn(() => Promise.resolve('')),
}));
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
