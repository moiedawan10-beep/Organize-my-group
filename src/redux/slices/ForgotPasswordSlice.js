import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, forgotpassword} from '../../constants/endpoints';
import {Alert} from 'react-native';

export const ForgotPasswordAction = createAsyncThunk(
  'ForgotPasswordAction',
  async email => {
    try {
      const response = await axios({
        method: 'post',
        url: BASE_URL + forgotpassword,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {email: email},
      });
      return response?.data;
    } catch (error) {
      if (error?.response?.data?.body?.message?.email) {
        Alert.alert('Error', error?.response?.data?.body?.message?.email);
      } else {
        Alert.alert('Error', 'Unknown error occured');
      }
      return error;
    }
  },
);

export const ForgotPasswordSlice = createSlice({
  name: 'ForgotPasswordSlice',
  initialState: {
    loading: false,
    error: null,
    message: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(ForgotPasswordAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ForgotPasswordAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.message = action.payload;
      })
      .addCase(ForgotPasswordAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // state.message = '';
      });
  },
});

export default ForgotPasswordSlice.reducer;
