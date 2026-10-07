import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, changePassword} from '../../constants/endpoints';
import {Alert, Image, Platform} from 'react-native';

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

export const ChangePasswordAction = createAsyncThunk(
  'ChangePasswordAction',
  async ({oldpassword, newPassword}, {rejectWithValue}) => {
    try {
      const accessToken = await getAccessToken();

      const FormData = require('form-data');
      let data = new FormData();
      data.append('old_password', oldpassword);
      data.append('password', newPassword);
      const response = await axios(`${BASE_URL}${changePassword}`, {
        method: 'post',
        maxBodyLength: Infinity,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
        data,
      });
      return response.data;
    } catch (error) {
        Alert.alert('Message',`${String(error?.response?.data?.body?.message)}`)
    }
  },
);

export const ChangePasswordSlice = createSlice({
  name: 'ChangePasswordSlice',
  initialState: {
    loading: false,
    error: null,
    user: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(ChangePasswordAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ChangePasswordAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.user = action.payload;
      })
      .addCase(ChangePasswordAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default ChangePasswordSlice.reducer;
