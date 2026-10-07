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

export const AllMembersAction = createAsyncThunk(
  'AllMembersAction',
  async ({id, nextPage}) => {
    try {
      const accessToken = await getAccessToken();
      let url =
        nextPage > 0
          ? `${BASE_URL}${allmembers}/${id}?page=${nextPage}`
          : `${BASE_URL}${allmembers}/${id}?limit=500`;

      const response = await axios({
        method: 'get',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.body;
    } catch (error) {
      console.error(
        'API Error:',
        error.response ? error.response.data : error.message,
      );
    }
  },
);

export const AllMembersSlice = createSlice({
  name: 'AllMembersSlice',
  initialState: {
    loading2: false,
    error: null,
    allmembers: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(AllMembersAction.pending, state => {
        state.loading2 = true;
        state.error = null;
      })
      .addCase(AllMembersAction.fulfilled, (state, action) => {
        state.loading2 = false;
        state.error = null;
        state.allmembers = action.payload;
      })
      .addCase(AllMembersAction.rejected, (state, action) => {
        state.loading2 = false;
        state.error = action.payload;
      });
  },
});

export default AllMembersSlice.reducer;
