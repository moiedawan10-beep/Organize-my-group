import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL, checkPassword } from '../../constants/endpoints';

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

export const CheckPasswordAction = createAsyncThunk(
    'CheckPasswordAction',
    async ({ password }, { rejectWithValue }) => {
        try {
            const accessToken = await getAccessToken();
            const response = await axios(`${BASE_URL}${checkPassword}`, {
                method: 'post',
                maxBodyLength: Infinity,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data',
                    Accept: 'application/json',
                },
                data: {
                    password: password
                },
            });
            return response.data;
        } catch (error) {
            console.log(String(error?.response?.data?.body?.message))
        }
    },
);

export const CheckPasswordSlice = createSlice({
    name: 'ChangePasswordSlice',
    initialState: {
        loading: false,
        error: null,
        user: null,
    },
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(CheckPasswordAction.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(CheckPasswordAction.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.user = action.payload;
            })
            .addCase(CheckPasswordAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default CheckPasswordSlice.reducer;
