import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, checkgroupavailability} from '../../constants/endpoints';

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

export const GroupCodeAvailability = createAsyncThunk(
  'GroupCodeAvailability',
  async (availability, {rejectWithValue}) => {
    const dataToSend = availability.groupId
      ? {code: availability.groupcode, group_id: availability.groupId}
      : {code: availability.groupcode};

    try {
      const accessToken = await getAccessToken();
      const response = await axios({
        method: 'post',
        url: BASE_URL + checkgroupavailability,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        data: dataToSend,
      });
      return response?.data;
    } catch (error) {
      console.error('Group Code Error:', error.code);
      return rejectWithValue(error.code);
    }
  },
);

export const GroupCodeSlice = createSlice({
  name: 'GroupCodeSlice',
  initialState: {
    loading: false,
    error: null,
    user: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(GroupCodeAvailability.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GroupCodeAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.user = action.payload;
      })
      .addCase(GroupCodeAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = '';
      });
  },
});

export default GroupCodeSlice.reducer;
