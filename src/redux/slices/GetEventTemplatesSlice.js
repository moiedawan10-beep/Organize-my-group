import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, getTemplates} from '../../constants/endpoints';

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

export const EventTemplates = createAsyncThunk(
  'EventTemplates',
  async ({currentPage, id}) => {
    // console.log(id, 'group_id ------>  ');
    try {
      const accessToken = await getAccessToken();

      let url = `${BASE_URL}${getTemplates}?group_id=${id}`;

      const response = await axios({
        method: 'get',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // console.log('Templates Data', response);
      return response?.data?.body?.response;
    } catch (error) {
      console.log(error, 'error');
      if (error.response?.data?.status_code === 404) {
        return error.response.data;
      } else {
        return error;
      }
    }
  },
);

export const EventTemplatesSlice = createSlice({
  name: 'EventTemplatesSlice',
  initialState: {
    loading: false,
    error: null,
    templates: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(EventTemplates.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(EventTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.templates = action.payload;
      })
      .addCase(EventTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default EventTemplatesSlice.reducer;
