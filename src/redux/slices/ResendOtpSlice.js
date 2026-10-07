import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, resendCode} from '../../constants/endpoints';
const initialState = {
  loading: false,
  error: null,
  code: null,
};

export const resendOtpAction = createAsyncThunk(
  'resendOtpAction',
  async (email, {dispatch}) => {
    const response = await axios({
      method: 'post',
      url: BASE_URL + resendCode,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        email,
      },
    });
    return response?.data;
  },
);

export const resendOtpSlice = createSlice({
  name: 'resendOtpSlice',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(resendOtpAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOtpAction.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(resendOtpAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default resendOtpSlice.reducer;
