import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, editProfile} from '../../constants/endpoints';
import {Alert} from 'react-native';
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

const initialState = {
  loading: false,
  error: null,
  user: null,
  message: '',
};

export const UpdateProfileAction = createAsyncThunk(
  'UpdateProfileAction',
  async payload => {
    try {
      const accessToken = await getAccessToken();
      const FormData = require('form-data');
      let data = new FormData();
      if (payload.imageUri.startsWith('file://')) {
        data.append('photo', {
          uri: payload.imageUri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        });
      }
      data.append('first_name', payload?.first_name);
      data.append('last_name', payload?.last_name);
      data.append('email', payload?.email);
      data.append('phone', payload?.phone);
      data.append('zip_code', payload?.zip_code);
      data.append('password', payload?.newpassword);
      data.append('old_password', payload?.old_password);

      const response = await axios({
        method: 'post',
        url: BASE_URL + editProfile,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
        data,
      });
      return response?.data;
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400 || error.response.status === 401) {
          Alert.alert(
            'Updation Error:',
            error?.response?.data?.body?.errors?.email[0],
          );
          throw error.response.data;
        } else {
          console.error('Updation Error:', error);
          throw error;
        }
      } else {
        throw error;
      }
    }
  },
);

export const UpdateProfileSlice = createSlice({
  name: 'UpdateProfileSlice',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(UpdateProfileAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UpdateProfileAction.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(UpdateProfileAction.rejected, (state, action) => {
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

export default UpdateProfileSlice.reducer;
