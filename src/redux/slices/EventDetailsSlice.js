import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, eventdetails} from '../../constants/endpoints';

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

export const EventDetailsAction = createAsyncThunk(
  'EventDetailsAction',
  async id => {
    try {
      const accessToken = await getAccessToken();
      const response = await axios({
        method: 'get',
        url: `${BASE_URL}${eventdetails}/${id}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response?.data?.body;
    } catch (error) {
      console.error('Manage Events Error:', error.code);
      return error.code;
    }
  },
);

export const EventDetailsSlice = createSlice({
  name: 'EventDetailsSlice',
  initialState: {
    loading: false,
    error: null,
    details: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(EventDetailsAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(EventDetailsAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.details = action.payload;
      })
      .addCase(EventDetailsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default EventDetailsSlice.reducer;
