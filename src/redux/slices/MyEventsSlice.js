import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL, manageEvents } from '../../constants/endpoints';

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

export const MyEventsAction = createAsyncThunk(
  'MyEventsAction',
  async ({ currentPage, viewType }) => {
    try {
      const accessToken = await getAccessToken();

      let url = `${BASE_URL}${manageEvents}?page=${currentPage}&limit=10`;
      if (viewType === 'Past') {
        url += '&past=1';  
      }

      const response = await axios({
        method: 'get',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response?.data?.body?.response;
    } catch (error) {
      if (error.response?.data?.status_code === 404) {
        return error.response.data;
      } else {
        return error;
      }
    }
  },
);

export const MyEventsSlice = createSlice({
  name: 'MyEventsSlice',
  initialState: {
    loading: false,
    error: null,
    events: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(MyEventsAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(MyEventsAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.events = action.payload;
      })
      .addCase(MyEventsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default MyEventsSlice.reducer;