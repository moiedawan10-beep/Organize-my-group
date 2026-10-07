import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, editgroup} from '../../constants/endpoints';
import {ToastAndroid} from 'react-native';

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

export const EditGroupAction = createAsyncThunk(
  'EditGroupAction',
  async (payload, {rejectWithValue}) => {
    try {
      const accessToken = await getAccessToken();
      const FormData = require('form-data');
      let data = new FormData();
      if (payload?.imageUri) {
        if (payload.imageUri.startsWith('file://')) {
          data.append('photo', {
            uri: payload.imageUri,
            type: 'image/jpeg',
            name: 'photo.jpg',
          });
        }
      }
      data.append('title', payload.name);
      data.append('zip_code', payload.zipcode);
      data.append('description', payload.description);
      data.append('privacy', payload.groupType);
      data.append('keywords', payload.words);
      data.append('code', payload.groupcode);

      const response = await axios(`${BASE_URL}${editgroup}/${payload.id}`, {
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
      if (error.response) {
        if (error.response.data.status_code === 400) {
          ToastAndroid.show(
            `Group Code: ${payload.groupcode} \n Already Taken. Please choose another one`,
            ToastAndroid.SHORT,
          );
        }
      } else if (error.request) {
        console.error('Edit Group Error Request:', error.request);
      } else {
        console.error('Edit Group Error Message:', error.message);
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const EditGroupSlice = createSlice({
  name: 'EditGroupSlice',
  initialState: {
    loading: false,
    error: null,
    user: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(EditGroupAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(EditGroupAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.user = action.payload;
      })
      .addCase(EditGroupAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default EditGroupSlice.reducer;
