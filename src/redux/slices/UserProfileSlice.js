import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, userProfile} from '../../constants/endpoints';

const getAccessToken = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    return accessToken;
  } catch (error) {
    console.error('Error retrieving access token from AsyncStorage:', error);
    throw error;
  }
};

export const userProfileAction = createAsyncThunk(
  'userProfileAction',
  async id => {
    try {
      const accessToken = await getAccessToken();
      const response = await axios({
        method: 'get',
        url: `${BASE_URL}${userProfile}/${id}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response?.data;
    } catch (error) {
      console.error('User Info Error:', error);
      throw error;
    }
  },
);

export const userProfileSlice = createSlice({
  name: 'userProfileSlice',
  initialState: {
    loading: false,
    error: null,
    user: null,
    username: null,
    profileImage: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(userProfileAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userProfileAction.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.profileImage = action.payload.body.photo_url_profile;
        state.username =
          action.payload.body.first_name + ' ' + action.payload.body.last_name;
      })
      .addCase(userProfileAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userProfileSlice.reducer;
