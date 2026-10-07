import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, deleteUser} from '../../constants/endpoints';
import {Alert} from 'react-native';

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

export const DeleteUserAction = createAsyncThunk(
  'DeleteUserAction',
  async id => {
    try {
      const accessToken = await getAccessToken();

      const response = await axios({
        method: 'delete',
        url: `${BASE_URL}${deleteUser}/${id}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response?.data;
    } catch (error) {
      console.error(
        'API Error:',
        error.response ? error.response.data : error.message,
      );
      return error.response ? error.response.data : error.message
    } 
  },
);

export const DeleteUserSlice = createSlice({
  name: 'DeleteUserSlice',
  initialState: {
    loading: false,
    error: null,
    data: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(DeleteUserAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(DeleteUserAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(DeleteUserAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default DeleteUserSlice.reducer;
