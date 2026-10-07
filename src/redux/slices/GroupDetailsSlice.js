import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, groupdetails} from '../../constants/endpoints';

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

export const GroupDetailsAction = createAsyncThunk(
  'GroupDetailsAction',
  async (id, {rejectWithValue}) => {
    try {
      const accessToken = await getAccessToken();
      const response = await axios({
        method: 'get',
        url: `${BASE_URL}${groupdetails}/${id}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log(
        'API Error:',
        error.response ? error.response.data : error.message,
      );
    }
  },
);

export const GroupDetailSlice = createSlice({
  name: 'GroupDetailSlice',
  initialState: {
    loading: false,
    error: null,
    details: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(GroupDetailsAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GroupDetailsAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.details = action.payload;
      })
      .addCase(GroupDetailsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default GroupDetailSlice.reducer;
