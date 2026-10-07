import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, settings} from '../../constants/endpoints';

export const SiteCommissionAction = createAsyncThunk(
  'SiteCommissionAction',
  async () => {
    try {
      const response = await axios({
        method: 'get',
        url: `${BASE_URL}${settings}`,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // console.log(response?.data?.body);
      return response?.data?.body;
    } catch (error) {
      return error.data;
    }
  },
);

export const SiteCommissionSlice = createSlice({
  name: 'SiteCommissionSlice',
  initialState: {
    loading: false,
    error: null,
    siteCommission: '',
    siteCommissionFixed: '',
    settingData: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(SiteCommissionAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(SiteCommissionAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // console.log('Reducer',action?.payload?.siteCommission)
        state.settingData = action?.payload;
        state.siteCommission = action.payload?.siteCommission;
        state.siteCommissionFixed = action.payload?.siteCommissionFixed;
      })
      .addCase(SiteCommissionAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default SiteCommissionSlice.reducer;
