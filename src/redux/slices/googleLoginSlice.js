import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, googleLogin} from '../../constants/endpoints';

const initialState = {
  loading: false,
  error: null,
  user: null,
};

export const socialLoginGoogle = createAsyncThunk(
  'socialLoginGoogle',
  async (payload, {dispatch}) => {
    try {
      const requestData = {
        grant_type: payload?.grant_type,
        client_id: payload?.client_id,
        client_secret: payload.client_secret,
        email: payload.email,
        scope: payload.scope,
        provider: payload.provider,
        access_token: payload.access_token,
      };

      const response = await axios.post(BASE_URL + googleLogin, requestData);
      return response.data;
    } catch (error) {
      console.error('Social Login Error:', error);
      throw error;
    }
  },
);

export const googleLoginSlice = createSlice({
  name: 'googleLogin',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(socialLoginGoogle.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(socialLoginGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.user = action.payload;
      })
      .addCase(socialLoginGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An error occurred.';
      });
  },
});

export default googleLoginSlice.reducer;
