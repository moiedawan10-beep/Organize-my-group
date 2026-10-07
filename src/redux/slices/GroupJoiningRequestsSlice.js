import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, groupjoinrequest} from '../../constants/endpoints';

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

export const GroupJoiningRequestsAction = createAsyncThunk(
  'GroupJoiningRequestsAction',
  async id => {
    try {
      const accessToken = await getAccessToken();
      const response = await axios({
        method: 'get',
        url: `${BASE_URL}${groupjoinrequest}?group_id=${id}&limit=500`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data.body;
    } catch (error) {
      if (error.response.data.status_code == 404) {
        return error.response.data;
      } else {
        console.error(
          'API Error:',
          error.response ? error.response.data : error.message,
        );
        return error;
      }
    }
  },
);

export const GroupJoiningRequestsSlice = createSlice({
  name: 'GroupJoiningRequestsSlice',
  initialState: {
    loading: false,
    error: null,
    requests: [],
    message: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(GroupJoiningRequestsAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GroupJoiningRequestsAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (action.payload.status_code === 404) {
          state.message = action.payload.body.message;
        } else {
          state.requests = action.payload;
        }
      })
      .addCase(GroupJoiningRequestsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default GroupJoiningRequestsSlice.reducer;
