import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, joingroup} from '../../constants/endpoints';

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

export const JoinPrivateGroupAction = createAsyncThunk(
  'JoinPrivateGroupAction',
  async payload => {
    try {
      const accessToken = await getAccessToken();
      const response = await axios({
        method: 'post',
        url: `${BASE_URL}${joingroup}/${payload?.id}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          code: payload?.code,
        },
      });
      return response?.data?.body?.message;
    } catch (error) {
      console.error('Join Group Error:', error);
      return error;
    }
  },
);

export const JoinPrivateGroupSlice = createSlice({
  name: 'JoinPrivateGroupSlice',
  initialState: {
    loading: false,
    error: null,
    data: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(JoinPrivateGroupAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(JoinPrivateGroupAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(JoinPrivateGroupAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default JoinPrivateGroupSlice.reducer;
