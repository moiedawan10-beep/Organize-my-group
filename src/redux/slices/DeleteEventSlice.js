import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, deleteEvent} from '../../constants/endpoints';

const getAccessToken = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) throw new Error('Access token is null or undefined');
    return accessToken;
  } catch (error) {
    throw error;
  }
};

export const DeleteEventAction = createAsyncThunk(
  'DeleteEventAction',
  async id => {
    try {
      const accessToken = await getAccessToken();

      const response = await axios({
        method: 'delete',
        url: `${BASE_URL}${deleteEvent}/${id}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        'API Error:',
        error.response ? error.response.data : error.message,
      );
    }
  },
);

export const DeleteEventSlice = createSlice({
  name: 'DeleteEventSlice',
  initialState: {
    loading: false,
    error: null,
    data: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(DeleteEventAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(DeleteEventAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(DeleteEventAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default DeleteEventSlice.reducer;
