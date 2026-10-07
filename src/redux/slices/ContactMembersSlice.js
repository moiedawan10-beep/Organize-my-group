import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, membersContact} from '../../constants/endpoints';
import { Alert } from 'react-native';

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

export const ContactMembersAction = createAsyncThunk(
  'AllMembersAction',
  async ({ data }, { rejectWithValue }) => {
    // console.log(data, 'data to send ')
    try {
      const accessToken = await getAccessToken();
      const url = `${BASE_URL}${membersContact}/${data?.id}`;

      const response = await axios({
        method: 'post',
        url,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          contact_via: data.contact_via,
          subject: data.subject,
          message: data.message,
        },
      });

      // console.log(response.data, '✅ Contact Members Success');
      return response.data;

    } catch (error) {
      console.log(error, 'errrr')
      const errorData = error.response?.data || error.message;
      console.log(errorData, 'error data ===')
      return rejectWithValue(errorData); 
    }
  }
);



export const ContactMembersSlice = createSlice({
  name: 'AllMembersSlice',
  initialState: {
    loading2: false,
    error: null,
    membersContact: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(ContactMembersAction.pending, state => {
        state.loading2 = true;
        state.error = null;
      })
      .addCase(ContactMembersAction.fulfilled, (state, action) => {
        state.loading2 = false;
        state.error = null;
        state.membersContact = action.payload;
      })
      .addCase(ContactMembersAction.rejected, (state, action) => {
        state.loading2 = false;
        state.error = action.payload;
      });
  },
});

export default ContactMembersSlice.reducer;
