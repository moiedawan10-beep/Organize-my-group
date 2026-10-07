import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, createForum} from '../../constants/endpoints';

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

export const CreateForum = createAsyncThunk(
  'CreateForum',
  async (payload, {rejectWithValue}) => {
    // console.log('data send to create post Slice ====>', payload);
    try {
      const accessToken = await getAccessToken();

      const url = `${BASE_URL}forum/${payload?.id}/posts/create`;
      // console.log(url, 'url===>');
      const response = await axios({
        method: 'post',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          parent_id: payload.parent_id,
          body: payload.body,
          type: payload.type,
          mentions: payload.mentions,
          attachments: payload.attachments || [],
        },
      });
      // console.log('response after creating post', response.data);
      return response.data;
    } catch (error) {
      console.log('Error occurred while creating Forum post', error);
      return rejectWithValue(error.message);
    }
  },
);

export const CreateForumSlice = createSlice({
  name: 'CreateForumSlice',
  initialState: {
    loading: false,
    error: null,
    data: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(CreateForum.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(CreateForum.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(CreateForum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default CreateForumSlice.reducer;
