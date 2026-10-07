import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, notificationsRead} from '../../constants/endpoints';

const getAccessToken = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) throw new Error('Access token is null or undefined');
    return accessToken;
  } catch (error) {
    console.error('Error retrieving access token from AsyncStorage:', error);
    throw error;
  }
};

export const ReadNotifcationsAction = createAsyncThunk(
  'ReadNotifcationsAction',
  async () => {
    try {
      const accessToken = await getAccessToken();
      const response = await axios({
        method: 'post',
        url: `${BASE_URL}${notificationsRead}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response?.data;
    } catch (error) {
      console.error(
        'Notifications Error:',
        error.response ? error.response.data : error.message,
      );
    }
  },
);

export const ReadNotificationsSlice = createSlice({
  name: 'ReadNotificationsSlice',
  initialState: {
    loading: false,
    error: null,
    notifications: [],
    message: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(ReadNotifcationsAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ReadNotifcationsAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.notifications = action.payload;
      })
      .addCase(ReadNotifcationsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default ReadNotificationsSlice.reducer;
