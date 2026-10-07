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

export const SearchGroupAction = createAsyncThunk(
  'SearchGroupAction',
  async ({search, page}, {rejectWithValue}) => {
    try {
      const accessToken = await getAccessToken();
      const response = await axios({
        method: 'get',
        url: `${BASE_URL}${searchgroup}?search=${search}&limit=10&page=${page}`,
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

export const SearchGroupSlice = createSlice({
  name: 'SearchGroupSlice',
  initialState: {
    loading: false,
    error: null,
    data: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(SearchGroupAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(SearchGroupAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(SearchGroupAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default SearchGroupSlice.reducer;
