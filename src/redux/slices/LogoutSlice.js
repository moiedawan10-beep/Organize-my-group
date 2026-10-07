import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, logout} from '../../constants/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const getpushId = async () => {
  try {
    const fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) throw new Error('Fcm token is null or undefined');
    return fcmToken;
  } catch (error) {
    console.error('Error retrieving Fcm token from AsyncStorage:', error);
    throw error;
  }
};

export const logoutUser = createAsyncThunk(
  'logoutUser',
  async (payload, {rejectWithValue}) => {
    try {
      const accessToken = await getAccessToken();
      const pushId = await getpushId();

      const data = {
        pushId: pushId,
        pushType: 'android',
      };

      const url = `${BASE_URL}${logout}`;

      const response = await axios({
        method: 'post',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        data,
      });

      return response.data;
    } catch (error) {
      console.error('Logout Error:', error);
      return rejectWithValue(
        error.response ? error.response.data : error.message,
      );
    }
  },
);

export const logoutSlice = createSlice({
  name: 'logoutSlice',
  initialState: {
    loading: false,
    error: null,
    message: '',
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(logoutUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload?.message || 'Logout successful';
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message || 'Logout failed';
      });
  },
});

export default logoutSlice.reducer;
