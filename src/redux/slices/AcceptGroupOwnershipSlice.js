import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, acceptGroupOwnership} from '../../constants/endpoints';

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

export const acceptGroupOwnershipAction = createAsyncThunk(
  'acceptGroupOwnershipAction',
  async (payload) => {
    // console.log(payload, 'payload')
    try {
      const accessToken = await getAccessToken();

      const response = await axios({
        method: 'post',
        url: `${BASE_URL}${acceptGroupOwnership}/${payload?.group_id}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        data:{
          user_id : payload.user_id
        }
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

export const acceptGroupOwnershipSlice = createSlice({
  name: 'acceptGroupOwnershipSlice',
  initialState: {
    loading: false,
    error: null,
    data: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(acceptGroupOwnershipAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptGroupOwnershipAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(acceptGroupOwnershipAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default acceptGroupOwnershipSlice.reducer;
