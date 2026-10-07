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

export const DeleteEventTemplateAction = createAsyncThunk(
  'DeleteEventTemplateAction',
  async ({id}) => {
    try {
      const accessToken = await getAccessToken();

      const response = await axios({
        method: 'delete',
        url: `${BASE_URL}${getTemplates}/${id}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response?.data?.body;
    } catch (error) {
      console.error(
        'API Error:',
        error.response ? error.response.data : error.message,
      );
    }
  },
);

export const DeleteEventTemplateSlice = createSlice({
  name: 'DeleteEventTemplateSlice',
  initialState: {
    loading: false,
    error: null,
    data: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(DeleteEventTemplateAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(DeleteEventTemplateAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(DeleteEventTemplateAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default DeleteEventTemplateSlice.reducer;
