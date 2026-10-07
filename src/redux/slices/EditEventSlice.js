import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL, editEvent} from '../../constants/endpoints';

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

const formatDateTime = dateString => {
  if (!dateString) return '';

  const [datePart, timePart] = dateString.split(', ');
  const [month, day, year] = datePart.split('/');
  const [hours, minutes, seconds] = timePart.split(':');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const EditEventAction = createAsyncThunk(
  'EditEventAction',
  async (payload, {rejectWithValue}) => {
    // console.log(payload, "Data Payload")
    try {
      const accessToken = await getAccessToken();
      const formattedDate = new Date(payload?.date).toISOString().split('T')[0];

      const FormData = require('form-data');
      let data = new FormData();

      if (payload?.photo) {
        if (
          payload.photo.startsWith('http://') ||
          payload.photo.startsWith('https://')
        ) {
          console.log('Server expects an image file, not a URL.');
        } else if (payload.photo.startsWith('file://')) {
          data.append('photo', {
            uri: payload.photo,
            type: 'image/jpeg',
            name: 'photo.jpg',
          });
        }
      }
      data.append('resource_id', payload?.resource_id);
      data.append('title', payload?.title);
      data.append('description', payload?.description);
      // if (payload?.hosts && Array.isArray(payload?.hosts)) {
      //   payload?.hosts.forEach(hostId => {
      //     data.append('hosts[]', hostId);
      //   });
      // }
      if (payload?.hosts && Array.isArray(payload?.hosts)) {
        data.append('hosts', JSON.stringify(payload.hosts));
      }
      data.append('free_event', payload?.free_event);
      data.append('profitable', payload?.profit_reportable_to_IRS);
      data.append(
        'hosts_pay',
        payload?.free_event === 1 ? 0 : payload?.hosts_pay,
      );
      data.append('resource_type', 'group');
      data.append('date', formattedDate);
      data.append('start_time', payload?.start_time);
      data.append('end_time', payload?.end_time);
      data.append('location', payload?.location);
      data.append(
        'entry_fee',
        payload?.free_event !== 1 ? payload?.entry_fee : 0,
      );
      data.append(
        'commission',
        payload?.free_event !== 1 ? parseFloat(payload?.commission) : 0,
      );
      data.append(
        'total_amount',
        payload?.total_amount > 0 && payload?.free_event !== 1
          ? parseFloat(payload?.total_amount)
          : 0,
      );
      data.append('announce_date', formatDateTime(payload?.announce_date));
      data.append('contact_via', payload?.contact_via);
      data.append(
        'registration_opens',
        formatDateTime(payload?.registration_opens),
      );
      data.append(
        'registration_closes',
        formatDateTime(payload?.registration_closes),
      );
      data.append(
        'charges_process',
        payload.free_event !== 1
          ? formatDateTime(payload?.charges_process)
          : null,
      );
      data.append('refunds_permitted', payload?.refunds_permitted);
      data.append(
        'refund_deadline',
        payload?.refunds_permitted === 1
          ? formatDateTime(payload?.refund_deadline)
          : null,
      );
      data.append(
        'refund_process_fee',
        payload?.refunds_permitted === 1
          ? parseFloat(payload?.refund_process_fee)
          : 0,
      );
      data.append(
        'refund_amount',
        payload?.refunds_permitted === 1
          ? parseFloat(payload?.refund_amount)
          : 0,
      );
      data.append(
        'refund_policy',
        payload.refunds_permitted === 1 ? payload?.refund_policy : '',
      );
      data.append('attendance_limit', payload?.attendance_limit);
      data.append('hosts_included', payload?.hosts_included);
      data.append('min_attendence', payload?.min_attendence);
      data.append('max_attendence', payload?.max_attendence);
      data.append('guest_allowed', payload?.guest_allowed);
      data.append('show_attendees', payload?.show_attendees);
      data.append('repeat_event', payload?.repeat_event === true ? 1 : 0);
      data.append('repeat_cycle', payload?.repeat_cycle);
      data.append('announce_frequency', 1);
      data.append('notes', payload?.notes);
      // console.log(data, 'edit data ===?');

      const response = await axios(`${BASE_URL}${editEvent}/${payload.id}`, {
        method: 'post',
        maxBodyLength: Infinity,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
        data: data,
      });
      // console.log(response?.data, 'resposne=====')
      return response?.data;
    } catch (error) {
      if (error?.response) {
        console.error('Edit Event Error Response:', error?.response.data);
      } else if (error?.request) {
        console.error('Edit Event Error Request:', error?.request);
      } else {
        console.error('Edit Event Error Message:', error?.message);
      }
      return rejectWithValue(error?.response?.data || error?.message);
    }
  },
);

export const EditEventSlice = createSlice({
  name: 'EditEventSlice',
  initialState: {
    loading: false,
    error: null,
    event: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(EditEventAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(EditEventAction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.event = action.payload;
      })
      .addCase(EditEventAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default EditEventSlice.reducer;
