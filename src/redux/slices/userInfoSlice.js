import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, getUserInfo} from '../../constants/endpoints';
import {Alert} from 'react-native';
import {CommonActions} from '@react-navigation/native';

const getAccessToken = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    return accessToken;
  } catch (error) {
    console.error('Error retrieving access token from AsyncStorage:', error);
    throw error;
  }
};

export const userInfo = createAsyncThunk('userInfo', async ({navigation}) => {
  try {
    const accessToken = await getAccessToken();
    const response = await axios({
      method: 'get',
      url: BASE_URL + getUserInfo,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response?.data;
  } catch (error) {
    if (error.response?.status === 401) {
      Alert.alert(
        'Unauthorized',
        'You are not authorized. Please log in again.',
        [
          {
            text: 'Login',
            onPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{name: 'Login'}],
                }),
              );
            },
          },
        ],
        {cancelable: false},
      );
    }
    throw error;
  }
});

export const userInfoSlice = createSlice({
  name: 'userInfo',
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
      .addCase(userInfo.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.profileImage = action.payload.body.photo_url_profile;
        state.username =
          action.payload.body.first_name + ' ' + action.payload.body.last_name;
      })
      .addCase(userInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userInfoSlice.reducer;
