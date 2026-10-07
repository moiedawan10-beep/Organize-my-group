import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, deleteForum} from '../../constants/endpoints';

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

export const DeleteForum = createAsyncThunk(
  'DeleteForum',
  async (id, {rejectWithValue}) => {
    // console.log('Id in Redux Action=====>', id);
    try {
      const accessToken = await getAccessToken();

      const url = `${BASE_URL}${deleteForum}/${id}`;
      const response = await axios({
        method: 'delete',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log('Error occured while deleting Forum post', error);
    }
  },
);

export const DeleteForumSlice = createSlice({
  name: 'DeleteForumSlice',
  initialState: {
    loading: false,
    error: null,
    data: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(DeleteForum.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(DeleteForum.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(DeleteForum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default DeleteForumSlice.reducer;
