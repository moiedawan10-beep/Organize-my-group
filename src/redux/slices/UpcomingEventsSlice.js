import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, upcomingEvents} from '../../constants/endpoints';

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

export const UpcomingEventsAction = createAsyncThunk(
  'UpcomingEventsAction',
  async ({groupId = null, nextPage}) => {
    try {
      const accessToken = await getAccessToken();

      const url = groupId
        ? `${BASE_URL}${upcomingEvents}?limit=10&page=${nextPage}&group_id=${groupId}`
        : `${BASE_URL}${upcomingEvents}?limit=10&page=${nextPage}`;

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
      if (error.response && error.response.data.status_code === 404) {
        return error.response.data;
      } else {
        return error;
      }
    }
  },
);

export const UpcomingEventsSlice = createSlice({
  name: 'UpcomingEventsSlice',
  initialState: {
    loading: false,
    error: null,
    events: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(UpcomingEventsAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UpcomingEventsAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.events = action.payload;
      })
      .addCase(UpcomingEventsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default UpcomingEventsSlice.reducer;
