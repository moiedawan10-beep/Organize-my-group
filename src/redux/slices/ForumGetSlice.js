import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, getForum} from '../../constants/endpoints';

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

export const GetForum = createAsyncThunk(
  'GetForum',
  async ({resourceType, resourceId,forumId,currentPage}, {rejectWithValue}) => {
    // console.log(resourceId, resourceType, 'data to send to api ====>');
    try {
      const accessToken = await getAccessToken();

      const url = `${BASE_URL}${getForum}?resource_type=${resourceType}&resource_id=${resourceId}&post_id=${forumId}&page=${currentPage}`;

      const response = await axios({
        method: 'get',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // console.log('Forum Data',response?.data?.body)
      return response.data;
    } catch (error) {
      console.log('Error occurred while fetching Forum posts:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const GetForumSlice = createSlice({
  name: 'GetForumSlice',
  initialState: {
    loading: false,
    error: null,
    data: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(GetForum.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetForum.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(GetForum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default GetForumSlice.reducer;
