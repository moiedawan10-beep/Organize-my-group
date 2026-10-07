import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, joinEvent} from '../../constants/endpoints';

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

export const JoinEventAction = createAsyncThunk(
  'JoinEventAction',
  async data => {
    try {
      // console.log('PAYLOADINJOIN',data)
      const accessToken = await getAccessToken();

      const response = await axios({
        method: 'post',
        url: `${BASE_URL}${joinEvent}/${data?.id}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          id: data.id,
          resource_id: data.resource_id,
          resource_type: data.resource_type,
          payment_method: data.payment_method,
          guests: data.guests,
          amount:data?.amount
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        'API Error:',
        error.response ? error.response.data : error.message,
      );
      return error.response ? error.response.data : error.message
    }
  },
);

export const JoinEventSlice = createSlice({
  name: 'JoinEventSlice',
  initialState: {
    loading: false,
    error: null,
    data: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(JoinEventAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(JoinEventAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(JoinEventAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default JoinEventSlice.reducer;
