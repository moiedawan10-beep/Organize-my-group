import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, verify} from '../../constants/endpoints';
const initialState = {
  loading: false,
  error: null,
  code: null,
};

export const otpVerify = createAsyncThunk(
  'otpVerify',
  async (payload, {dispatch}) => {
    const response = await axios({
      method: 'post',
      url: BASE_URL + verify,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        grant_type: payload?.grant_type,
        client_id: payload?.client_id,
        client_secret: payload.client_secret,
        username: payload.username,
        password: payload.password,
        scope: payload.scope,
        email: payload.email || payload.username,
        code: payload.code,
      },
    });
    return response?.data;
  },
);

export const otpVerifySlice = createSlice({
  name: 'otpVerifySlice',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(otpVerify.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(otpVerify.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(otpVerify.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default otpVerifySlice.reducer;
