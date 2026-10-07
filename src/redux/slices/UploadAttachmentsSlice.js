import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import {BASE_URL} from '../../constants/endpoints';
import RNFetchBlob from 'rn-fetch-blob';

const getAccessToken = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) throw new Error('Access token is null or undefined');
    return accessToken;
  } catch (error) {
    console.error('Error retrieving access token:', error);
    throw error;
  }
};

export const uploadAttachments = createAsyncThunk(
    'media/uploadAttachments',
    async ({forumId, file}, {rejectWithValue}) => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) throw new Error('Access token missing');
  
        const uploadUrl = `${BASE_URL}forum/${forumId}/media`;
  
        // console.log('Uploading to:', uploadUrl);
        // console.log('Uploading file:', file);
  
        const res = await RNFetchBlob.fetch(
          'POST',
          uploadUrl,
          {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
          [
            {
              name: 'file',
              filename: file.name || 'upload.jpg',
              type: file.type || 'image/jpeg',
              data: RNFetchBlob.wrap(file.uri.replace('file://', '')),
            },
          ]
        );
  
        const responseJson = res.json();
        // console.log('Upload success:', responseJson);
  
        return responseJson;
      } catch (error) {
        console.error('Upload failed:', error.message);
        return rejectWithValue(error.message);
      }
    }
  );

const uploadMediaSlice = createSlice({
  name: 'uploadMedia',
  initialState: {
    loading: false,
    error: null,
    uploadedFile: null,
  },
  reducers: {
    resetUploadState: state => {
      state.loading = false;
      state.error = null;
      state.uploadedFile = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(uploadAttachments.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAttachments.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadedFile = action.payload;
      })
      .addCase(uploadAttachments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {resetUploadState} = uploadMediaSlice.actions;
export default uploadMediaSlice.reducer;
