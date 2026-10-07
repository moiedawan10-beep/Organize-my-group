import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, searchgroup} from '../../constants/endpoints';

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

export const SearchPrivateGroupAction = createAsyncThunk(
  'SearchPrivateGroupAction',
  async (search, {rejectWithValue}) => {
    try {
      const accessToken = await getAccessToken();
      const response = await axios({
        method: 'get',
        url: `${BASE_URL}${searchgroup}?search=${search}&type=code`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data.body;
    } catch (error) {
      console.error('Search Group Error:', error);
      return error;
    }
  },
);

export const SearchPrivateGroupSlice = createSlice({
  name: 'SearchPrivateGroupSlice',
  initialState: {
    loading: false,
    error: null,
    data: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(SearchPrivateGroupAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(SearchPrivateGroupAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(SearchPrivateGroupAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default SearchPrivateGroupSlice.reducer;
