import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, grouprequestapproval} from '../../constants/endpoints';

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

export const GroupRequestsApprovalAction = createAsyncThunk(
  'GroupRequestsApprovalAction',
  async ({id, user_id}) => {
    try {
      const accessToken = await getAccessToken();

      const response = await axios({
        method: 'post',
        url: `${BASE_URL}${grouprequestapproval}/${id}`,
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
      console.error(
        'API Error:',
        error.response ? error.response.data : error.message,
      );
    }
  },
);

export const GroupRequestsApprovalSlice = createSlice({
  name: 'GroupRequestsApprovalSlice',
  initialState: {
    loading: false,
    error: null,
    approval: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(GroupRequestsApprovalAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GroupRequestsApprovalAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.approval = action.payload;
      })
      .addCase(GroupRequestsApprovalAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default GroupRequestsApprovalSlice.reducer;
