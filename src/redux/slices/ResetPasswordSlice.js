import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, resetpassword} from '../../constants/endpoints';
import {Alert} from 'react-native';

export const ResetPasswordAction = createAsyncThunk(
  'ResetPasswordAction',
  async payload => {
    try {
      const response = await axios({
        method: 'post',
        url: BASE_URL + resetpassword,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          email: payload?.email,
          code: payload?.code,
          password: payload?.password,
        },
      });
      return response?.data;
    } catch (error) {
      if (error?.response?.data?.body?.message?.password) {
        Alert.alert('Error', error?.response?.data?.body?.message?.password);
      } else if (error?.response?.data?.body?.message?.email) {
        Alert.alert('Error', error?.response?.data?.body?.message?.email);
      } else {
        Alert.alert('Error', 'Unknown error occured');
      }
      return error?.response?.data?.body?.message;
    }
  },
);

export const ResetPasswordSlice = createSlice({
  name: 'ResetPasswordSlice',
  initialState: {
    loading: false,
    error: null,
    message: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(ResetPasswordAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ResetPasswordAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.message = action.payload;
      })
      .addCase(ResetPasswordAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default ResetPasswordSlice.reducer;
