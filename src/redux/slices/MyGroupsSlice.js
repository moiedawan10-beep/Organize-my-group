import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, mygroups} from '../../constants/endpoints';

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

export const MyGroupsAction = createAsyncThunk(
  'MyGroupsAction',
  async ({currentPage}) => {
    try {
      const limit = 10;
      const accessToken = await getAccessToken();
      const response = await axios({
        method: 'get',
        url: `${BASE_URL}${mygroups}?page=${currentPage}&limit=10`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response?.data;
    } catch (error) {
      if (error.response.data.status_code === 404) {
        console.error('No Group Message:', error.response.data);
        return error.response.data;
      } else {
        return error;
      }
    }
  },
);

export const MyGroupsSlice = createSlice({
  name: 'MyGroupsSlice',
  initialState: {
    loading: false,
    error: null,
    groups: [],
    message: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(MyGroupsAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(MyGroupsAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (action.payload.status_code == 404) {
          state.message = action.payload.body.message;
        } else {
          state.groups = action.payload.body.response;
        }
      })
      .addCase(MyGroupsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default MyGroupsSlice.reducer;
