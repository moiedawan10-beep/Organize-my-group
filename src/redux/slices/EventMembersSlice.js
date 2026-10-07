import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, eventMembers} from '../../constants/endpoints';

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

export const EventMembersAction = createAsyncThunk(
  'EventMembersAction',
  async id => {
    try {
      const accessToken = await getAccessToken();
      const response = await axios({
        method: 'get',
        url: `${BASE_URL}${eventMembers}/${id}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response?.data?.body;
    } catch (error) {
      console.error('Event Members Error:', error.code);
      return error.code;
    }
  },
);

export const EventMembersSlice = createSlice({
  name: 'EventMembersSlice',
  initialState: {
    membersloading: false,
    error: null,
    members: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(EventMembersAction.pending, state => {
        state.membersloading = true;
        state.error = null;
      })
      .addCase(EventMembersAction.fulfilled, (state, action) => {
        state.membersloading = false;
        state.error = null;
        state.members = action.payload;
      })
      .addCase(EventMembersAction.rejected, (state, action) => {
        state.membersloading = false;
        state.error = action.payload;
      });
  },
});

export default EventMembersSlice.reducer;
