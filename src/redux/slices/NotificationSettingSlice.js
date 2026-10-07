import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL} from '../../constants/endpoints';
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
export const NotificationSettingAction = createAsyncThunk(
  'NotificationSettingAction',
  async (
    {groupId, allow_notification, allow_user_notification},
    {rejectWithValue},
  ) => {
    // console.log(groupId,allow_notification, allow_user_notification, 'payload')
    try {
      const accessToken = await getAccessToken();
      const response = await axios({
        method: 'post',
        url: `${BASE_URL}groups/notification/settings/${groupId}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          allow_notification,
          allow_user_notification,
        },
      });
    //   console.log(response?.data, 'response data of settings');
      return response?.data?.body;
    } catch (error) {
      console.error(
        'Notification Settings Error:',
        error?.response?.data || error.message,
      );
      return rejectWithValue(error?.response?.data || error.message);
    }
  },
);
export const NotificationSettingSlice = createSlice({
  name: 'NotificationSettingSlice',
  initialState: {
    loading: false,
    error: null,
    data: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(NotificationSettingAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(NotificationSettingAction.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(NotificationSettingAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export default NotificationSettingSlice.reducer;
