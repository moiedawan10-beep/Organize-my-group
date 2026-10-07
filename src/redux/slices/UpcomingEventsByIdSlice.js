import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, allmembers} from '../../constants/endpoints';

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

export const UpcomingEventByIDData = createAsyncThunk(
  'UpcomingEventByIDData',
  async groupID => {
    try {
      const accessToken = await getAccessToken();

      const response = await axios({
        method: 'get',
        url: `${BASE_URL}${allmembers}/${groupID}?limit=500`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data.body;
    } catch (error) {
      console.log(
        'API Error:',
        error.response ? error.response.data : error.message,
      );
    }
  },
);

export const UpcomingEventsByIdSlice = createSlice({
  name: 'UpcomingEventsByIdSlice',
  initialState: {
    loading2: false,
    error: null,
    allmembers: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(UpcomingEventByIDData.pending, state => {
        state.loading2 = true;
        state.error = null;
      })
      .addCase(UpcomingEventByIDData.fulfilled, (state, action) => {
        state.loading2 = false;
        state.error = null;
        state.allmembers = action.payload;
      })
      .addCase(UpcomingEventByIDData.rejected, (state, action) => {
        state.loading2 = false;
        state.error = action.payload;
      });
  },
});

export default UpcomingEventsByIdSlice.reducer;
