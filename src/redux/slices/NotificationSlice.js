import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, notifications} from '../../constants/endpoints';

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

export const NotifcationsAction = createAsyncThunk(
  'NotifcationsAction',
  async (currentPage = 1) => {
    try {
      const accessToken = await getAccessToken();
      const response = await axios({
        method: 'get',
        url: `${BASE_URL}${notifications}?page=${currentPage}&limit=10`,
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

export const NotificationsSlice = createSlice({
  name: 'NotificationsSlice',
  initialState: {
    loading: false,
    error: null,
    notifications: [],
    message: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(NotifcationsAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(NotifcationsAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (action.payload.status_code == 404) {
          state.message = action.payload.body.message;
        } else {
          state.notifications = action.payload.body.response;
        }
      })
      .addCase(NotifcationsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default NotificationsSlice.reducer;
