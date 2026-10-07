// // services/TokenService.js
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {getMessaging} from '@react-native-firebase/messaging';
// import {client_id, client_secret} from './configs';
// import {BASE_URL} from './endpoints';

// /**
//  * Refresh the access token using the refresh token and Firebase push token.
//  * @param {string} firebaseToken - FCM token for push notifications
//  * @returns {string|null} The new access token, or null if refresh failed
//  */

// const getAccessToken = async () => {
//   try {
//     const accessToken = await AsyncStorage.getItem('accessToken');
//     if (!accessToken) {
//       console.log('Access token is null or undefined');
//     }
//     return accessToken;
//   } catch (error) {
//     console.log('Error retrieving access token from AsyncStorage:', error);
//     throw error;
//   }
// };

// export const refreshAccessToken = async firebaseToken => {
//   try {
//     const refreshToken = await AsyncStorage.getItem('refreshToken');
//     const accessToken = await getAccessToken();
//     if (!refreshToken || !accessToken) {
//       console.log('Refresh token & Access Token missing');
//     }

//     const payload = {
//       grant_type: 'refresh_token',
//       refresh_token: refreshToken,
//       client_id: client_id,
//       client_secret: client_secret,
//       scope: '',
//       pushId: firebaseToken,
//       pushType: 'android',
//     };

//     const response = await fetch(`${BASE_URL}token/refresh`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${accessToken}`,
//       },
//       body: JSON.stringify(payload),
//     });

//     const responseText = await response.text();

//     if (!response.ok) {
//       console.log(`❌ Token refresh failed with status: ${response.status}`);
//     }

//     const parsed = JSON.parse(responseText);
//     const data = parsed.body;

//     console.log('✅ Token refreshed successfully');

//     if (!data.access_token || !data.expires_in || !data.refresh_token) {
//       console.log('Invalid token response');
//     }

//     await AsyncStorage.setItem('accessToken', data.access_token);
//     await AsyncStorage.setItem('refreshToken', data.refresh_token);

//     const expiryDate = new Date(Date.now() + data.expires_in * 1000);
//     await AsyncStorage.setItem('accessTokenExpiry', expiryDate.toString());

//     return data.access_token;
//   } catch (error) {
//     console.log('❌ Error refreshing token:', error.message);
//     return null;
//   }
// };

// export const startTokenAutoRefreshService = () => {
//   console.log('🚀 Token auto-refresh service started');

//   const checkAndRefreshToken = async () => {
//     try {
//       const expiryString = await AsyncStorage.getItem('accessTokenExpiry');
//       if (!expiryString) return;
//       const expiryDate = new Date(expiryString);
//       const now = new Date();
//       const timeLeft = expiryDate.getTime() - now.getTime();
//       const fiveMinutes = 5 * 60 * 1000;
//       if (timeLeft <= fiveMinutes) {
//         const token = await getMessaging().getToken();
//         console.log('🔁 Refreshing token — less than 5 minutes remaining');
//         await refreshAccessToken(token);
//       } else {
//         // console.log(
//         //   `🕒 Token valid for ${(timeLeft / 1000 / 60).toFixed(
//         //     1,
//         //   )} more minutes`,
//         // );
//       }
//     } catch (error) {
//       console.log('❌ Token service error:', error);
//     }
//   };

//   setInterval(checkAndRefreshToken, 60 * 1000);
// };




// services/TokenService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getMessaging} from '@react-native-firebase/messaging';
import BackgroundFetch from 'react-native-background-fetch';
import {client_id, client_secret} from './configs';
import {BASE_URL} from './endpoints';
import { AppRegistry } from 'react-native';

/**
 * Get the stored access token from AsyncStorage.
 */
const getAccessToken = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
      console.log('Access token is null or undefined');
    }
    return accessToken;
  } catch (error) {
    console.log('Error retrieving access token from AsyncStorage:', error);
    throw error;
  }
};

/**
 * Refresh the access token using the refresh token and Firebase push token.
 */
export const refreshAccessToken = async firebaseToken => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const accessToken = await getAccessToken();

    if (!refreshToken || !accessToken) {
      console.log('Refresh token & Access Token missing');
      return null;
    }

    const payload = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: client_id,
      client_secret: client_secret,
      scope: '',
      pushId: firebaseToken,
      pushType: 'android',
    };

    const response = await fetch(`${BASE_URL}token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.log(`❌ Token refresh failed with status: ${response.status}`);
      return null;
    }

    const parsed = JSON.parse(responseText);
    const data = parsed.body;

    if (!data.access_token || !data.expires_in || !data.refresh_token) {
      console.log('❌ Invalid token response');
      return null;
    }

    await AsyncStorage.setItem('accessToken', data.access_token);
    await AsyncStorage.setItem('refreshToken', data.refresh_token);

    const expiryDate = new Date(Date.now() + data.expires_in * 1000);
    await AsyncStorage.setItem('accessTokenExpiry', expiryDate.toString());

    console.log('✅ Token refreshed successfully');
    return data.access_token;
  } catch (error) {
    console.log('❌ Error refreshing token:', error.message);
    return null;
  }
};

/**
 * Starts periodic foreground token refresh every 60 seconds.
 */
export const startTokenAutoRefreshService = () => {
  console.log('🚀 Token auto-refresh service started');

  const checkAndRefreshToken = async () => {
    try {
      const expiryString = await AsyncStorage.getItem('accessTokenExpiry');
      if (!expiryString) return;
      const expiryDate = new Date(expiryString);
      const now = new Date();
      const timeLeft = expiryDate.getTime() - now.getTime();
      const fiveMinutes = 5 * 60 * 1000;

      if (timeLeft <= fiveMinutes) {
        const token = await getMessaging().getToken();
        console.log('🔁 Refreshing token — less than 5 minutes remaining');
        await refreshAccessToken(token);
      }
    } catch (error) {
      console.log('❌ Token service error:', error);
    }
  };

  setInterval(checkAndRefreshToken, 60 * 1000);
};

/**
 * Starts background fetch service to auto-refresh token even when app is backgrounded or killed.
 */
export const startBackgroundFetchService = () => {
  console.log('📦 Starting BackgroundFetch service...');

  BackgroundFetch.configure(
    {
      minimumFetchInterval: 15, // minutes
      stopOnTerminate: false,
      startOnBoot: true,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
     enableHeadless: true,
    },
    async taskId => {
      console.log('[BackgroundFetch] task start: ', taskId);
      try {
        const token = await getMessaging().getToken();
        console.log(token, 'token in background')
        await refreshAccessToken(token);
      } catch (error) {
        console.log('❌ BackgroundFetch error:', error.message);
      }
      BackgroundFetch.finish(taskId);
    },
    error => {
      console.log('❌ BackgroundFetch failed to start:', error);
    },
  );

  BackgroundFetch.status(status => {
    console.log('BackgroundFetch status:', status);
    switch (status) {
      case BackgroundFetch.STATUS_RESTRICTED:
        console.log('⚠️ BackgroundFetch restricted');
        break;
      case BackgroundFetch.STATUS_DENIED:
        console.log('🚫 BackgroundFetch denied');
        break;
      case BackgroundFetch.STATUS_AVAILABLE:
        console.log('✅ BackgroundFetch is enabled');
        break;
      default:
        console.log('ℹ️ BackgroundFetch status unknown:', status);
    }
  });

  console.log('📦 BackgroundFetch.configure() called');
};



