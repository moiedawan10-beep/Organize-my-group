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
    console.error('Error retrieving access token from AsyncStorage:', error);
    throw error;
  }
};
export const AddFunds = createAsyncThunk(
  'AddFunds',
  async (payload, {rejectWithValue}) => {
    // console.log(payload, 'paload data to send')
    try {
      const accessToken = await getAccessToken();
      const response = await axios({
        method: 'post',
        url: `${BASE_URL}wallet/funds`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          payment_method: payload.payment_method,
          amount: payload.amount,
          resource_id: payload.resource_id,
          resource_type: payload.resource_type
        },
      });
      return response.data.body;
    } catch (error) {
      const message =
        error?.response?.data?.body?.message ||
        error?.response?.data?.message ||
        'Something went wrong';
      console.error('Add Funds Error:', message);
      return rejectWithValue(message);
    }
  },
);
export const AddFundsSlice = createSlice({
  name: 'AddFundsSlice',
  initialState: {
    loading: false,
    error: null,
    data: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(AddFunds.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(AddFunds.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(AddFunds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export default AddFundsSlice.reducer;
