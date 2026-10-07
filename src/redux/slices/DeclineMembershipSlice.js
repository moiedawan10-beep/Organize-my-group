import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, grouprequestrejection} from '../../constants/endpoints';
import {Alert} from 'react-native';

const getAccessToken = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) throw new Error('Access token is null or undefined');
    return accessToken;
  } catch (error) {
    throw error;
  }
};

export const GroupRequestsRejectionAction = createAsyncThunk(
  'GroupRequestsRejectionAction',
  async ({id, user_id}) => {
    try {
      const accessToken = await getAccessToken();
      const response = await axios({
        method: 'post',
        url: `${BASE_URL}${grouprequestrejection}/${id}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          user_id,
        },
      });
      return response.data.body;
    } catch (error) {
      Alert.alert(
        'Error:',
        JSON.stringify(
          error.response ? error.response.data.body.message : error,
        ),
      );
      return {error: error.response};
    }
  },
);

export const GroupRequestsRejectionSlice = createSlice({
  name: 'GroupRequestsRejectionSlice',
  initialState: {
    loading: false,
    error: null,
    rejection: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(GroupRequestsRejectionAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GroupRequestsRejectionAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.rejection = action.payload;
      })
      .addCase(GroupRequestsRejectionAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default GroupRequestsRejectionSlice.reducer;
