import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL} from '../../constants/endpoints';
const getAccessToken = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) throw new Error('Access token is null or undefined');
    return accessToken;
  } catch (error) {
    console.error('Error retrieving access token:', error);
    throw error;
  }
};
export const DeleteForumMedia = createAsyncThunk(
  'DeleteForumMedia',
  async ({forumID, mediaId}) => {
    try {
      const accessToken = await getAccessToken();
      const url = `${BASE_URL}forum/${forumID}/media/${mediaId}`;
      const response = await axios({
        method: 'delete',
        url: url,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        'Delete Forum Media Error:',
        error.response ? error.response.data : error.message,
      );
    }
  },
);

// Slice
export const DeleteForumMediaSlice = createSlice({
  name: 'DeleteForumMediaSlice',
  initialState: {
    loading: false,
    error: null,
    result: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(DeleteForumMedia.pending, state => {
        state.loading = true;
        state.error = null;
        state.result = null;
      })
      .addCase(DeleteForumMedia.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(DeleteForumMedia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});
export default DeleteForumMediaSlice.reducer;
