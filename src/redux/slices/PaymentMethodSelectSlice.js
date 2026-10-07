import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, paymentsMethodeSelect} from '../../constants/endpoints';

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

export const selectPaymentMethodAction = createAsyncThunk(
  'selectPaymentMethodAction',
  async id => {
    try {
      const accessToken = await getAccessToken();
      const response = await axios({
        method: 'patch',
        url: `${BASE_URL}${paymentsMethodeSelect}/${id}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response?.data?.body?.response;
    } catch (error) {
      if (error.response.data.status_code === 404) {
        console.error('No Payments Method:', error.response.data);
        return error.response.data;
      } else {
        return error;
      }
    }
  },
);

export const PaymentsMethodSelectSlice = createSlice({
  name: 'PaymentsMethodSelectSlice',
  initialState: {
    loading: false,
    error: null,
    paymentsMethod: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(selectPaymentMethodAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(selectPaymentMethodAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.events = action.payload;
      })
      .addCase(selectPaymentMethodAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default PaymentsMethodSelectSlice.reducer;
