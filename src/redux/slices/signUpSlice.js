import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, signUp} from '../../constants/endpoints';
import {Alert} from 'react-native';

const initialState = {
  loading: false,
  error: null,
  user: null,
  message: '',
};

export const signUpUser = createAsyncThunk('signUpUser', async payload => {
  try {
    const FormData = require('form-data');
    let data = new FormData();
    if (payload.imageUri) {
      data.append('photo', {
        uri: payload.imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });
    }

    if (payload?.first_name) data.append('first_name', payload.first_name);
    if (payload?.last_name) data.append('last_name', payload.last_name);
    if (payload?.grant_type) data.append('grant_type', payload.grant_type);
    if (payload?.client_id) data.append('client_id', payload.client_id);
    if (payload?.client_secret)
      data.append('client_secret', payload.client_secret);
    if (payload?.email) data.append('email', payload.email);
    if (payload?.phone) data.append('phone', payload.phone);
    if (payload?.password) data.append('password', payload.password);
    if (payload?.email) data.append('username', payload.email);
    if (payload?.terms) data.append('terms', payload.terms);
    if (payload?.scope) data.append('scope', payload.scope);
    if (payload?.zip_code) data.append('zip_code', payload.zip_code);
    if (payload?.timezone) data.append('timezone', payload?.timezone);
    if (payload?.pushId) data.append('pushId', payload?.pushId);
    if (payload?.pushType) data.append('pushType', payload.pushType);

    const response = await axios({
      method: 'post',
      url: BASE_URL + signUp,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: data,
    });
    return response?.data;
  } catch (error) {
    if (error?.response?.data?.body?.errors?.email) {
      Alert.alert('Error:', error?.response?.data?.body?.errors?.email[0]);
      return error?.response?.data?.body;
    } else if (error?.response?.data?.body?.errors?.phone) {
      Alert.alert('Error:', error?.response?.data?.body?.errors?.phone[0]);
      return error?.response?.data?.body;
    } else {
      Alert.alert('Error:', 'Unknown error occured');
      return error?.response?.data?.body;
    }
  }
});

export const signUpSlice = createSlice({
  name: 'signUpSlice',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(signUpUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.status === 400) {
          state.error = action.payload.data.body.errors.email[0];
          state.message = action.payload.data.body.errors.email[0];
        } else {
          state.error = action.payload;
          state.message = '';
        }
      });
  },
});

export default signUpSlice.reducer;
