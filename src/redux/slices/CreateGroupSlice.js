import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, creategroup} from '../../constants/endpoints';
import {Alert, ToastAndroid} from 'react-native';

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

export const CreateGroup = createAsyncThunk(
  'CreateGroup',
  async (payload, {rejectWithValue}) => {
    try {
      const accessToken = await getAccessToken();
      const FormData = require('form-data');
      let data = new FormData();
      if (payload.imageUri) {
        data.append('photo', {
          uri: payload.imageUri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        });
      }
      data.append('title', payload.name);
      data.append('zip_code', payload.zipcode);
      data.append('description', payload.description);
      data.append('privacy', payload.groupType);
      data.append('keywords', payload.words);
      data.append('code', payload.groupcode);
      // console.log(data, 'data ');
      const response = await axios(`${BASE_URL}${creategroup}`, {
        method: 'post',
        maxBodyLength: Infinity,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
        data,
      });
      // console.log(response.data, 'response of group');
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Create Group Error Response:', error.response.data);
        if (error.response.data.status_code === 400) {
          ToastAndroid.show(
            `Group Code: ${payload.groupcode} \n Already Taken. Please choose another one`,
            ToastAndroid.SHORT,
          );
        }
      } else if (error.request) {
        console.error('Create Group Error Request:', error.request);
      } else {
        console.error('Create Group Error Message:', error.message);
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const CreateGroupSlice = createSlice({
  name: 'CreateGroupSlice',
  initialState: {
    loading: false,
    error: null,
    user: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(CreateGroup.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(CreateGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.user = action.payload;
      })
      .addCase(CreateGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default CreateGroupSlice.reducer;
