import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, transferGroupOwnership} from '../../constants/endpoints';

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

export const transferGroupOwnershipAction = createAsyncThunk(
  'transferGroupOwnershipAction',
  async (payload) => {
    // console.log(payload)
    try {
      const accessToken = await getAccessToken();

      const response = await axios({
        method: 'post',
        url: `${BASE_URL}${transferGroupOwnership}/${payload?.group_id}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          user_id: payload?.user_id,
        },
      });
      // console.log(response.data)
      return response.data.body;
    } catch (error) {
      console.error(
        'API Error:',
        error.response ? error.response.data : error.message,
      );
      return error.response.data;
    }
  },
);

export const transferGroupOwnershipSlice = createSlice({
  name: 'transferGroupOwnershipSlice',
  initialState: {
    loading: false,
    error: null,
    data: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(transferGroupOwnershipAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(transferGroupOwnershipAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(transferGroupOwnershipAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default transferGroupOwnershipSlice.reducer;
