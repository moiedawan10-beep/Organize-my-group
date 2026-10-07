import {
  Dimensions,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  FlatList,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  SafeAreaView,
  ToastAndroid,
  Modal,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import DashboardHeader2 from '../components/DashboardHeader2';
import {Text} from 'react-native';
import {
  button1backgroundColor,
  button1TextColor,
  buttonTextSize,
  InputBorderColor,
  InputTitleSize,
  otherTextColor,
} from '../resources/styling';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/Ionicons';
import {Dropdown} from 'react-native-element-dropdown';
import ImagePicker from 'react-native-image-crop-picker';
import IonIcon from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import {CreateEventAction} from '../redux/slices/CreateEventSlice';
import {userInfo} from '../redux/slices/userInfoSlice';
import {AllMembersAction} from '../redux/slices/AllmembersSlice';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import MessageModal from '../components/MessageModal';
import {EditEventAction} from '../redux/slices/EditEventSlice';
import {SiteCommissionAction} from '../redux/slices/SiteComissionSlice';
import {EventTemplates} from '../redux/slices/GetEventTemplatesSlice';
import {DeleteEventTemplateAction} from '../redux/slices/DeleteEventTemplateSlice';
import CustomRadioGroup from '../components/CustomRadioGroup';
import CustomInput from '../components/CustomInputField';
import ImagePickerModal from '../components/ImagePickerModal';

const {height} = Dimensions.get('window');

const CreateEvent = ({navigation}) => {
  const dispatch = useDispatch();
  const route = useRoute();
  const {groupId, groupIcon, isEditing, eventID, details} = route?.params;
  const {username, user} = useSelector(state => state.userInfo);

  const {siteCommission, siteCommissionFixed} = useSelector(
    state => state.siteCommission,
  );
  const {allmembers, loading2} = useSelector(state => state.AllMembers);

  const [inputValues, setInputValues] = useState({
    imageUri: groupIcon,
    resource_id: groupId,
    creatorName: username?.length > 0 ? username : '',
    eventName: '',
    description: '',
    freeEvent: 1,
    profitReportableToIRS: 1,
    hostPay: 0,
    startdate: null,
    startTime: null,
    endTime: null,
    location: '',
    mode: 'date',
    currentField: 'startdate',
    show: false,
    entryFees: '',
    commission: 0,
    totalEventCost: 0,
    announceEvent: null,
    announceEventTime: null,
    contactMembers: [],
    registrationOpens: null,
    registrationOpensTime: null,
    registrationCloses: null,
    registrationClosesTime: null,
    chargesDate: null,
    chargesTime: null,
    refundsPermitted: 0,
    refundPolicy: '',
    refundDeadline: null,
    refundDeadlineTime: null,
    refundProcessingFee: 0,
    refundAmount: 0,
    attendanceLimit: 0,
    includeHosts: 0,
    minparticipant: 0,
    maxparticipant: 0,
    GuestAllowed: 0,
    showAttendees: 1,
    repeat: false,
    repeat_cycle: null,
    notes: '',
    error: '*',
    error2: '',
    loading: false,
    createTemplate: false,
    templateName: '',
    templateData: [],
    selectedTemplate: null,
  });
  const [showErrors, setShowErrors] = useState(false);
  const [hosts, setHosts] = useState([]);
  const [pickerFlag, setPickerFlag] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const repeatcycle = [
    {id: 1, name: 'Daily', title: 'daily'},
    {id: 2, name: 'Weekly', title: 'weekly'},
    {id: 3, name: 'Monthly', title: 'monthly'},
  ];

  useFocusEffect(
    useCallback(() => {
      EmptyAllInputFields();
      dispatch(userInfo());
    }, []),
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(userInfo());
        dispatch(SiteCommissionAction());
        const response = await dispatch(
          EventTemplates({currentPage: 1, id: groupId}),
        );
        setInputValues({...inputValues, templateData: response?.payload});
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // useEffect(() => {
  //   if (allmembers?.response?.length > 0) {
  //     const admin = allmembers?.response.find(member => member.is_admin);
  //     if (admin) {
  //       setHosts(prevHosts => {
  //         if (!prevHosts?.some(host => host.id === admin.id)) {
  //           return [
  //             {
  //               id: admin.id,
  //               name: admin.title,
  //               attending: 1,
  //             },
  //             ...prevHosts,
  //           ];
  //         }
  //         return prevHosts;
  //       });
  //     }
  //   }
  // }, [allmembers]);

  useEffect(() => {
    const fetchInitialHost = async () => {
      if (user) {
        setHosts(prevHosts => {
          const newHost = {
            id: user.body.id,
            name: user.body.title,
            attending: 1,
          };
          return [...prevHosts, newHost];
        });
      } else {
        console.log('Something went wrong');
      }
    };

    fetchInitialHost();
  }, [user]);

  const gettime = time => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const starttime = new Date();
    starttime.setHours(hours);
    starttime.setMinutes(minutes);
    starttime.setSeconds(seconds);
    return starttime;
  };

  useEffect(() => {
    if (details) {
      let startDateString = `${details.date} ${details.start_time}`;
      inputValues.creatorName = username || '';
      inputValues.resource_id = details ? details?.resource_id : '';
      inputValues.eventName = details?.title || '';
      inputValues.description = details?.description || '';
      inputValues.imageUri = details?.photo_url_profile || null;
      inputValues.freeEvent = details?.entry_fee === 0 ? 1 : 0;
      inputValues.profitReportableToIRS = details?.profitable || 0;
      inputValues.hostPay = details?.hosts_pay === 1 ? 1 : 0;
      inputValues.startdate = details?.date ? new Date(startDateString) : null;
      inputValues.startTime = details?.start_time
        ? gettime(details.start_time)
        : null;
      inputValues.endTime = details?.end_time
        ? gettime(details.end_time)
        : null;
      inputValues.location = details?.location || '';
      inputValues.entryFees = details?.entry_fee || '';
      inputValues.commission = details?.commission || 0;
      inputValues.totalEventCost = details?.total_amount || 0;
      inputValues.announceEvent = details?.announce_date
        ? new Date(details.announce_date)
        : null;
      inputValues.announceEventTime = details?.announce_date
        ? new Date(details.announce_date)
        : null;
      inputValues.registrationOpens = details?.registration_opens
        ? new Date(details.registration_opens)
        : null;
      inputValues.registrationOpensTime = details?.registration_opens
        ? new Date(details.registration_opens)
        : null;
      inputValues.registrationCloses = details?.registration_closes
        ? new Date(details.registration_closes)
        : null;
      inputValues.registrationClosesTime = details?.registration_closes
        ? new Date(details.registration_closes)
        : null;
      inputValues.chargesDate = details?.charges_process
        ? new Date(details?.charges_process)
        : null;
      inputValues.chargesTime = details?.charges_process
        ? new Date(details?.charges_process)
        : null;
      inputValues.refundsPermitted = details?.refund_amount == '0.00' ? 0 : 1;
      inputValues.refundDeadline =
        details?.refund_deadline && details?.refund_amount != '0.00'
          ? new Date(details.refund_deadline)
          : null;
      inputValues.refundDeadlineTime =
        details?.refund_deadline && details?.refund_amount != '0.00'
          ? new Date(details.refund_deadline)
          : null;
      inputValues.refundPolicy = details?.refund_policy || null;
      inputValues.refundProcessingFee = details?.refund_process_fee || 0;
      inputValues.refundAmount = details?.refund_amount || 0;
      inputValues.attendanceLimit = details?.attendance_limit || 0;
      inputValues.includeHosts = details?.hosts_included === 1 ? 1 : 0;
      inputValues.minparticipant = Number(details?.min_attendence) || 0;
      inputValues.maxparticipant = Number(details?.max_attendence) || 0;
      inputValues.GuestAllowed = details?.guest_allowed || 0;
      inputValues.showAttendees = details?.show_attendees === 1 ? 1 : 0;
      inputValues.repeat = details?.repeat_event ? true : false;
      inputValues.repeat_cycle = details?.repeat_cycle || null;
      inputValues.notes = details?.notes || '';
      inputValues.contactMembers = details?.contact_via
        ? details.contact_via.split(',')
        : [];

      const updatedHosts =
        details?.hosts &&
        details?.hosts.map(host => ({
          id: host.id,
          name: host.title,
          attending: host.attending,
        }));

      setHosts(updatedHosts);
    }
  }, [details]);

  useEffect(() => {
    const comision =
      inputValues.entryFees * (siteCommission / 100) +
      Number(siteCommissionFixed);
    setInputValues({...inputValues, commission: comision.toFixed(2)});
  }, [inputValues.entryFees, siteCommission, siteCommissionFixed]);

  useEffect(() => {
    const refundAmount = (
      parseFloat(inputValues.entryFees || 0) -
      parseFloat(inputValues.refundProcessingFee || 0)
    ).toFixed(2);
    setInputValues(prevValues => ({
      ...prevValues,
      refundAmount: refundAmount,
    }));
  }, [inputValues.entryFees, inputValues.refundProcessingFee]);

  useEffect(() => {
    const totalCost = (
      parseFloat(inputValues.entryFees || 0) +
      parseFloat(inputValues.commission || 0)
    ).toFixed(2);
    setInputValues(prevValues => ({
      ...prevValues,
      totalEventCost: totalCost,
    }));
  }, [inputValues.entryFees, inputValues.commission]);

  useEffect(() => {
    dispatch(AllMembersAction({id: inputValues.resource_id}));
  }, [inputValues.resource_id]);

  useEffect(() => {
    if (!inputValues.refundDeadline || !inputValues.refundDeadlineTime) {
      return;
    }

    const formattedDate = inputValues.refundDeadline.toLocaleDateString(
      'en-US',
      {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      },
    );

    const formattedTime = inputValues.refundDeadlineTime.toLocaleTimeString(
      'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    );

    setInputValues(prevValues => ({
      ...prevValues,
      refundPolicy: `Refunds will be permitted if you remove yourself from the event before ${formattedDate}, ${formattedTime}.\nThe refunded amount after processing fees for this event will be $${prevValues.refundAmount}.`,
    }));
  }, [
    inputValues.refundDeadline,
    inputValues.refundAmount,
    inputValues.refundDeadlineTime,
  ]);

  const EmptyAllInputFields = () => {
    setInputValues({
      resource_id: '',
      name: '',
      description: '',
      imageUri: null,
      freeEvent: 1,
      profitReportableToIRS: 1,
      hostPay: 0,
      startdate: null,
      startTime: null,
      endTime: null,
      location: '',
      entryFees: '',
      commission: 0,
      totalEventCost: 0,
      announceEvent: null,
      announceEventTime: null,
      contactMembers: [],
      registrationOpens: null,
      registrationOpensTime: null,
      registrationCloses: null,
      registrationClosesTime: null,
      chargesDate: null,
      chargesTime: null,
      refundsPermitted: 0,
      refundDeadline: null,
      refundDeadlineTime: null,
      refundPolicy: '',
      refundProcessingFee: 0,
      refundAmount: 0,
      attendanceLimit: 0,
      includeHosts: 0,
      minparticipant: 0,
      maxparticipant: 0,
      GuestAllowed: 0,
      showAttendees: 1,
      repeat: false,
      repeat_cycle: null,
      notes: '',
      error: '*',
      error2: '',
      loading: false,
      createTemplate: false,
      templateName: '',
      templateData: [],
      selectedTemplate: null,
    });
    setHosts([]);
    setShowErrors(false);
  };

  function formatDateTime(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    const formattedDateTime = `${month}/${day}/${year}, ${hours}:${minutes}:${seconds}`;

    return formattedDateTime;
  }

  const combineDateAndTime = (dateObj, timeObj) => {
    if (!dateObj || !timeObj) return null;

    const combined = new Date(dateObj);
    combined.setHours(timeObj.getHours());
    combined.setMinutes(timeObj.getMinutes());
    combined.setSeconds(timeObj.getSeconds());
    combined.setMilliseconds(0);

    return formatDateTime(combined);
  };

  const submitData = async () => {
    if (
      !inputValues.resource_id ||
      !inputValues.creatorName ||
      !inputValues.eventName ||
      hosts.length === 0 ||
      !inputValues.startdate ||
      !inputValues.startTime ||
      !inputValues.endTime ||
      // !inputValues.registrationOpens ||
      !inputValues.registrationCloses ||
      !inputValues.location ||
      (inputValues.freeEvent === 0 && inputValues.entryFees === '')
      // !inputValues.announceEvent ||
      // !inputValues.announceEventTime ||
      // !inputValues.registrationOpensTime
    ) {
      setInputValues({
        ...inputValues,
        error: 'Required field',
        error2: 'Missing required fields',
      });
      setShowErrors(true);
      return;
    }

    if (inputValues.startTime && inputValues.endTime) {
      const startTime = new Date(inputValues.startTime);
      const endTime = new Date(inputValues.endTime);

      if (endTime < startTime) {
        setInputValues({
          ...inputValues,
          error2: 'End time cannot be before the start time',
        });
        return;
      }
    }

    if (
      inputValues.refundsPermitted === 1 &&
      inputValues.freeEvent === 0 &&
      (!inputValues.refundDeadline || !inputValues.refundDeadlineTime)
    ) {
      setInputValues({
        ...inputValues,
        error: 'Required field',
        error2: 'Missing required fields',
      });
      setShowErrors(true);
      return;
    }
    setShowErrors(false);

    if (
      inputValues.refundProcessingFee > Number(inputValues.entryFees) &&
      inputValues.freeEvent !== 1
    ) {
      setInputValues({
        ...inputValues,
        error2:
          'The refund amount cannot be greater than or equal to the entry fee.',
      });
      return;
    }

    if (inputValues.repeat === true && !inputValues.repeat_cycle) {
      setInputValues({...inputValues, error2: 'Please select Repeat-Cycle'});
      return;
    }

    if (inputValues.minparticipant === 0 && inputValues.maxparticipant !== 0) {
      setInputValues({
        ...inputValues,
        error2: 'Please provide minimum participants.',
      });
      return;
    }
    if (
      inputValues.maxparticipant !== 0 &&
      inputValues.minparticipant > inputValues.maxparticipant
    ) {
      setInputValues({
        ...inputValues,
        error2:
          'The maximum number of participants must be greater than or equal to the minimum.',
      });
      return;
    }

    setInputValues({...inputValues, loading: true, error2: ''});
    const hostIds = hosts.map(host => ({
      id: host.id,
      attending: host.attending ?? 1,
    }));

    const announceEventDateTime = combineDateAndTime(
      inputValues.announceEvent,
      inputValues.announceEventTime,
    );
    const registrationOpensDateTime = combineDateAndTime(
      inputValues.registrationOpens,
      inputValues.registrationOpensTime,
    );
    const registrationClosesDateTime = combineDateAndTime(
      inputValues.registrationCloses,
      inputValues.registrationClosesTime,
    );
    const chargesProcessDateTime = combineDateAndTime(
      inputValues.chargesDate,
      inputValues.chargesTime,
    );
    const refundDeadlineDateTime = combineDateAndTime(
      inputValues.refundDeadline,
      inputValues.refundDeadlineTime,
    );

    const payload = {
      ...(isEditing && {id: eventID}),
      title: inputValues.eventName,
      description: inputValues.description,
      hosts: hostIds ? hostIds : '',
      free_event: inputValues.freeEvent,
      profit_reportable_to_IRS: inputValues.freeEvent
        ? 1
        : inputValues.profitReportableToIRS,
      hosts_pay: inputValues.hostPay,
      resource_id: inputValues.resource_id,
      resource_type: 'group',
      date: inputValues.startdate,
      start_time: inputValues.startTime
        ? inputValues.startTime.toLocaleTimeString([], {hour12: false})
        : null,
      end_time: inputValues.endTime
        ? inputValues.endTime.toLocaleTimeString([], {hour12: false})
        : null,
      location: inputValues.location,
      entry_fee: inputValues.entryFees,
      commission: inputValues.commission,
      total_amount: inputValues.totalEventCost,
      registration_opens: inputValues.registrationOpens
        ? registrationOpensDateTime
        : null,
      registration_closes: registrationClosesDateTime,
      charges_process:
        inputValues.chargesDate && inputValues.freeEvent !== 1
          ? chargesProcessDateTime
          : null,
      refunds_permitted:
        inputValues.freeEvent === 1 ? 0 : inputValues.refundsPermitted,
      announce_date: inputValues.announceEvent ? announceEventDateTime : null,
      refund_deadline: inputValues.refundDeadline
        ? refundDeadlineDateTime
        : null,
      refund_process_fee: inputValues.refundProcessingFee,
      refund_amount: inputValues.refundAmount,
      refund_policy: inputValues.refundPolicy,
      attendance_limit: inputValues.attendanceLimit,
      hosts_included: inputValues.includeHosts,
      min_attendence: inputValues.minparticipant,
      max_attendence: inputValues.maxparticipant,
      guest_allowed: inputValues.GuestAllowed,
      repeat_event: inputValues.repeat,
      repeat_cycle: inputValues.repeat_cycle,
      show_attendees: inputValues.showAttendees,
      contact_via: inputValues.contactMembers,
      notes: inputValues.notes,
      photo: inputValues.imageUri,
      createTemplate: inputValues.createTemplate ? 1 : 0,
      templateName: inputValues.templateName.length
        ? inputValues.templateName
        : 'My Event Template',
    };
    let response;

    if (isEditing) {
      response = await dispatch(EditEventAction(payload));
      if (response?.payload?.status_code === 200) {
        setMessageModalVisible(true);
        route.params?.onUpdate();
        EmptyAllInputFields();
      } else {
        Alert.alert('Error', response?.payload?.body?.message);
      }
    } else {
      response = await dispatch(CreateEventAction(payload));
      if (response?.payload?.status_code === 200) {
        EmptyAllInputFields();
        setMessageModalVisible(true);
      } else {
        Alert.alert('Error', response?.payload?.body?.message);
      }
    }
    setInputValues({...inputValues, loading: false});
  };

  const handleDateChange = (field, date) => {
    setInputValues(prevState => {
      if (field === 'startTime') {
        const selectedDateTime = new Date(
          inputValues.startdate.getFullYear(),
          inputValues.startdate.getMonth(),
          inputValues.startdate.getDate(),
          date.getHours(),
          date.getMinutes(),
        );

        const now = new Date();

        if (selectedDateTime < now) {
          Alert.alert('Past Time', 'Start time cannot be in the past.');
          return {...prevState, show: false};
        }
        return {
          ...prevState,
          registrationClosesTime: date,
          [field]: date,
          show: false,
        };
      } else if (field === 'endTime') {
        const eventDate = inputValues.startdate;
        const startTime = inputValues.startTime;

        const selectedEndTime = new Date(
          eventDate.getFullYear(),
          eventDate.getMonth(),
          eventDate.getDate(),
          date.getHours(),
          date.getMinutes(),
        );

        const startDateTime = new Date(
          eventDate.getFullYear(),
          eventDate.getMonth(),
          eventDate.getDate(),
          startTime.getHours(),
          startTime.getMinutes(),
        );

        if (selectedEndTime <= startDateTime) {
          Alert.alert('Invalid time', 'End time must be after start time.');
          return {...prevState, show: false};
        }

        return {
          ...prevState,
          [field]: date,
          show: false,
        };
      } else if (field === 'announceEvent') {
        return {
          ...prevState,
          [field]: date,
          registrationOpens: date,
          show: false,
        };
      } else if (field === 'announceEventTime') {
        return {
          ...prevState,
          [field]: date,
          registrationOpensTime: date,
          show: false,
        };
      } else if (field === 'startdate') {
        return {
          ...prevState,
          [field]: date,
          registrationCloses: date,
          show: false,
        };
      } else if (field === 'registrationClosesTime') {
        const eventDate = inputValues.startdate;
        const regOpenDate = inputValues.registrationOpens;
        const regCloseDate = inputValues.registrationCloses;

        // Check if all three dates are the same
        const sameDay =
          eventDate.getFullYear() === regCloseDate.getFullYear() &&
          eventDate.getMonth() === regCloseDate.getMonth() &&
          eventDate.getDate() === regCloseDate.getDate();
        // regOpenDate.getFullYear() === regCloseDate.getFullYear() &&
        // regOpenDate.getMonth() === regCloseDate.getMonth() &&
        // regOpenDate.getDate() === regCloseDate.getDate();

        if (sameDay) {
          const eventStartDateTime = new Date(
            eventDate.getFullYear(),
            eventDate.getMonth(),
            eventDate.getDate(),
            inputValues.startTime.getHours(),
            inputValues.startTime.getMinutes(),
          );

          const regOpenDateTime = new Date(
            regOpenDate.getFullYear(),
            regOpenDate.getMonth(),
            regOpenDate.getDate(),
            inputValues.registrationOpensTime.getHours(),
            inputValues.registrationOpensTime.getMinutes(),
          );

          const regCloseDateTime = new Date(
            regCloseDate.getFullYear(),
            regCloseDate.getMonth(),
            regCloseDate.getDate(),
            date.getHours(),
            date.getMinutes(),
          );

          if (regCloseDateTime >= eventStartDateTime) {
            Alert.alert(
              'Invalid time',
              'Registration close time must be before event start time.',
            );
            return prevState;
          }

          if (regCloseDateTime <= regOpenDateTime) {
            Alert.alert(
              'Invalid time',
              'Registration close time must be after registration open time.',
            );
            return prevState;
          }
        }

        return {
          ...prevState,
          [field]: date,
          show: false,
        };
      } else if (field === 'registrationOpensTime') {
        const eventDate = inputValues.startdate;
        const regOpenDate = inputValues.registrationOpens;

        const sameDay =
          eventDate.getFullYear() === regOpenDate.getFullYear() &&
          eventDate.getMonth() === regOpenDate.getMonth() &&
          eventDate.getDate() === regOpenDate.getDate();

        if (sameDay) {
          const eventStartDateTime = new Date(
            eventDate.getFullYear(),
            eventDate.getMonth(),
            eventDate.getDate(),
            inputValues.startTime.getHours(),
            inputValues.startTime.getMinutes(),
          );

          const regOpenDateTime = new Date(
            regOpenDate.getFullYear(),
            regOpenDate.getMonth(),
            regOpenDate.getDate(),
            date.getHours(),
            date.getMinutes(),
          );

          // Compare times
          if (regOpenDateTime >= eventStartDateTime) {
            Alert.alert(
              'Invalid time',
              'Registration open time must be before event start time.',
            );
            return prevState;
          }
        }

        return {
          ...prevState,
          [field]: date,
          show: false,
        };
      } else {
        return {
          ...prevState,
          [field]: date,
          show: false,
        };
      }
    });
  };

  const handleFieldPress = (field, mode) => {
    setInputValues(prevState => ({
      ...prevState,
      currentField: field,
      show: true,
      mode: mode,
    }));
  };

  const getPickerMode = field => {
    const timeFields = [
      'startTime',
      'endTime',
      'announceEventTime',
      'registrationOpensTime',
      'registrationClosesTime',
      'chargesTime',
      'refundDeadlineTime',
    ];
    return timeFields.includes(field) ? 'time' : 'date';
  };

  const getFieldMinDate = field => {
    switch (field) {
      case 'startdate':
        return new Date();

      case 'announceEvent':
        return new Date();

      case 'registrationOpens':
        return inputValues.announceEvent
          ? new Date(inputValues.announceEvent)
          : new Date();

      case 'registrationCloses':
        return inputValues.registrationOpens
          ? new Date(inputValues.registrationOpens)
          : inputValues.announceEvent
          ? new Date(inputValues.announceEvent)
          : new Date();

      case 'chargesDate':
        return new Date();

      case 'refundDeadline':
        return inputValues.announceEvent
          ? new Date(inputValues.announceEvent)
          : new Date();

      default:
        return undefined;
    }
  };

  const getFieldMaxDate = field => {
    switch (field) {
      case 'announceEvent':
        return inputValues.startdate
          ? new Date(inputValues.startdate)
          : inputValues.registrationCloses
          ? new Date(inputValues.registrationCloses)
          : inputValues.refundDeadline
          ? new Date(inputValues.refundDeadline)
          : undefined;

      case 'registrationOpens':
        return inputValues.registrationCloses
          ? new Date(inputValues.registrationCloses)
          : inputValues.refundDeadline
          ? new Date(inputValues.refundDeadline)
          : inputValues.startdate
          ? new Date(inputValues.startdate)
          : undefined;

      case 'registrationCloses':
        return inputValues.refundDeadline
          ? new Date(inputValues.refundDeadline)
          : inputValues.startdate
          ? new Date(inputValues.startdate)
          : undefined;

      case 'chargesDate':
        return inputValues.startdate
          ? new Date(inputValues.startdate)
          : undefined;

      case 'refundDeadline':
        return inputValues.startdate
          ? new Date(inputValues.startdate)
          : undefined;

      default:
        return undefined;
    }
  };

  const getDateDifference = (startDateStr, otherDateStr) => {
    if (!startDateStr || !otherDateStr) return '';

    const startDate = new Date(startDateStr);
    const otherDate = new Date(otherDateStr);
    startDate.setHours(0, 0, 0, 0);
    otherDate.setHours(0, 0, 0, 0);

    const diffInMs = Math.abs(otherDate - startDate);
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'On event day';
    if (diffInDays === 1) return '1 day before';
    return `${diffInDays} days before`;
  };

  const calculatedDifference = useMemo(
    () => getDateDifference(inputValues.startdate, inputValues.announceEvent),
    [inputValues.startdate, inputValues.announceEvent],
  );

  const calculatedDifferenceRegistration = useMemo(
    () =>
      getDateDifference(inputValues.startdate, inputValues.registrationOpens),
    [inputValues.startdate, inputValues.registrationOpens],
  );

  const calculatedDifferenceRegistrationClose = useMemo(
    () =>
      getDateDifference(inputValues.startdate, inputValues.registrationCloses),
    [inputValues.startdate, inputValues.registrationCloses],
  );

  const calculatedChargesDate = useMemo(
    () => getDateDifference(inputValues.startdate, inputValues.chargesDate),
    [inputValues.startdate, inputValues.chargesDate],
  );

  const calculatedDifferenceRefund = useMemo(
    () => getDateDifference(inputValues.startdate, inputValues.refundDeadline),
    [inputValues.startdate, inputValues.refundDeadline],
  );
  const UpdateTemplate = item => {
    if (item.id === 'none') {
      setInputValues(prev => ({
        ...prev,
        selectedTemplate: null,
        attendanceLimit: '',
        commission: '',
        contactMembers: [],
        entryFees: '',
        freeEvent: 1,
        GuestAllowed: 0,
        includeHosts: 0,
        hostPay: 0,
        maxparticipant: 0,
        minparticipant: 0,
        notes: '',
        profitReportableToIRS: false,
        refundAmount: '',
        refundPolicy: '',
        refundProcessingFee: '',
        repeat_cycle: '',
        repeat: false,
        showAttendees: 0,
        imageUri: groupIcon,
        location: '',
        description: '',
        refundsPermitted: 1,
      }));
      return;
    }

    const template = item.fullTemplate;
    setInputValues(prev => ({
      ...prev,
      eventName: template?.title || '',
      selectedTemplate: item,
      attendanceLimit: template.attendance_limit,
      commission: template.commission,
      contactMembers: template.contact_via
        ? template.contact_via.split(',')
        : [],
      entryFees: template.entry_fee,
      freeEvent: template.entry_fee > 0 ? 0 : 1,
      GuestAllowed: template.guest_allowed,
      includeHosts: Number(template.hosts_included),
      hostPay: Number(template.hosts_pay),
      maxparticipant:
        Number(template.max_attendence) > 0
          ? Number(template.max_attendence)
          : '',
      minparticipant:
        Number(template.min_attendence) > 0
          ? Number(template.min_attendence)
          : '',
      notes: template.notes,
      profitReportableToIRS: template.profitable,
      refundAmount: template.refund_amount,
      refundPolicy: template.refund_policy,
      refundProcessingFee: template.refund_process_fee,
      repeat_cycle: template.repeat_cycle,
      repeat: Number(template.repeat_event) === 1,
      showAttendees: Number(template.show_attendees),
      // imageUri: template.photo_url_main,
      location: template.location || '',
      description: template.description || '',
      refundsPermitted: Number(template.refund_amount) === 0 ? 0 : 1,
    }));
  };

  const handleDeleteTemplate = async id => {
    try {
      const responsee = await dispatch(DeleteEventTemplateAction({id}));
      ToastAndroid.show(responsee.payload.message, ToastAndroid.SHORT);
      const response = await dispatch(EventTemplates({currentPage: 1}));
      setInputValues({...inputValues, templateData: response?.payload});
    } catch (error) {
      console.log('Error occured ', error.message || error);
    }
  };

  const validateFloatValue = (text, field) => {
    let sanitizedText = text.replace(/[^0-9.]/g, '');
    if (sanitizedText.charAt(0) === '.') {
      sanitizedText = sanitizedText.slice(1);
    }
    if ((sanitizedText.match(/\./g) || []).length > 1) {
      sanitizedText = sanitizedText.replace(/\.(?=.*\.)/, '');
    }
    setInputValues({...inputValues, [field]: sanitizedText});
  };

  const validateIntegerValue = (text, field) => {
    let sanitizedText = text.replace(/[^0-9]/g, '');
    setInputValues({
      ...inputValues,
      [field]: Number(sanitizedText),
    });
  };

  const getDateFieldValue = field => {
    return inputValues[field]
      ? inputValues[field].toLocaleDateString('en-US')
      : null;
  };

  const getTimeFieldValue = field => {
    return inputValues[field]
      ? inputValues[field].toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : null;
  };

  const ValidateEventStartDate = field => {
    if (!inputValues.startdate) {
      ToastAndroid.show('Select Event Start Date first', ToastAndroid.SHORT);
    } else {
      handleFieldPress(field, 'date');
    }
  };

  const filteredHosts = hosts?.filter(host => {
    const member = allmembers?.response?.find(m => m.id === host.id);
    return member;
  });

  const NoHostAttendingflag =
    filteredHosts.length > 0 &&
    filteredHosts.every(host => host.attending === 0);

  useEffect(() => {
    if (NoHostAttendingflag) {
      setInputValues({...inputValues, includeHosts: 0});
    }
  }, [NoHostAttendingflag]);

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <DashboardHeader2
        title={isEditing ? 'Updating Event' : 'Event Creation'}
        isBack={true}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}>
        <KeyboardAvoidingView style={styles.keyboardContainer}>
          {/* IMAGE */}
          <TouchableOpacity
            onPress={() => setPickerFlag(true)}
            style={styles.imageupload}>
            {inputValues.imageUri ? (
              <Image
                source={{uri: inputValues.imageUri}}
                resizeMode="cover"
                style={styles.imageuploaded}
              />
            ) : (
              <IonIcon name="camera-outline" size={30} color="#848484" />
            )}
          </TouchableOpacity>

          <Text style={styles.eventTitle}>Upload Photo</Text>
          {/*Event Creator  */}
          <CustomInput
            label="Event Creator"
            value={inputValues.creatorName}
            editable={false}
            placeholder="Enter Here"
            backgroundColor="#e0e0e0"
            color="grey"
          />

          {/* Event Templates */}
          {!isEditing && (
            <>
              <View style={styles.TitleBox}>
                <Text style={styles.inputTitle}>Templates: </Text>
              </View>
              {inputValues?.templateData?.length > 0 ? (
                <Dropdown
                  style={[styles.dropdown, {marginTop: 0}]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  iconStyle={styles.iconStyle}
                  data={[
                    {id: 'none', name: 'No Template', fullTemplate: null},
                    ...inputValues.templateData.map(item => ({
                      id: item.id,
                      name: item.title,
                      fullTemplate: item.data,
                    })),
                  ]}
                  maxHeight={150}
                  labelField="name"
                  valueField="id"
                  placeholder="Select Template"
                  value={inputValues.selectedTemplate?.id}
                  onChange={UpdateTemplate}
                  renderItem={item => (
                    <View style={styles.item}>
                      <Text style={styles.textItem}>{item.name}</Text>
                      {item.id !== 'none' && (
                        <TouchableOpacity
                          onPress={() => handleDeleteTemplate(item.id)}
                          style={{marginLeft: 10}}>
                          <Icon name="delete" size={20} color="red" />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                />
              ) : (
                <Text style={styles.noText}>No templates available</Text>
              )}
            </>
          )}

          {/* Event Name */}
          <CustomInput
            label="Event Name"
            value={inputValues.eventName}
            onChange={text => setInputValues({...inputValues, eventName: text})}
            placeholder="Enter Here"
            required={true}
            showError={showErrors}
            maxLength={64}
            lengthCounter={true}
          />

          {/* Event Description */}
          <CustomInput
            label="Description"
            value={inputValues.description}
            onChange={text =>
              setInputValues({...inputValues, description: text})
            }
            placeholder="Enter Here"
            maxLength={255}
            multiline={true}
            height={'auto'}
            lengthCounter={true}
          />

          <View>
            <View style={styles.TitleBox}>
              <Text style={styles.inputTitle}>Host(s): </Text>
              {hosts.length === 0 && inputValues.error ? (
                <Text style={styles.errorText}>{inputValues.error}</Text>
              ) : null}
            </View>
            {hosts?.length > 0 && (
              <View
                style={[
                  styles.inputFieldDropDown,
                  {height: 'auto', borderWidth: 1},
                ]}>
                <View>
                  <FlatList
                    data={hosts}
                    numColumns={1}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({item}) => (
                      <View style={styles.flatView}>
                        <View style={styles.keywordContainer}>
                          <Text
                            style={styles.keywordText}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {item.name.length > 20
                              ? `${item.name.slice(0, 20)}...`
                              : item.name}
                          </Text>
                        </View>

                        {/* Show checkboxes for everyone */}
                        <View style={styles.attendingContainer}>
                          <Text style={styles.attendingLabel}>Attending:</Text>

                          {/* Yes checkbox */}
                          <TouchableOpacity
                            style={styles.checkboxItem}
                            onPress={() => {
                              setHosts(prevHosts =>
                                prevHosts.map(host =>
                                  host.id === item.id
                                    ? {...host, attending: 1}
                                    : host,
                                ),
                              );
                            }}>
                            <View style={styles.checkboxRow}>
                              <View style={styles.checkboxSquare}>
                                {item.attending === 1 && (
                                  <View style={styles.checkboxChecked} />
                                )}
                              </View>
                              <Text style={styles.checkboxText}>Yes</Text>
                            </View>
                          </TouchableOpacity>

                          {/* No checkbox */}
                          <TouchableOpacity
                            style={styles.checkboxItem}
                            onPress={() => {
                              setHosts(prevHosts =>
                                prevHosts.map(host =>
                                  host.id === item.id
                                    ? {...host, attending: 0}
                                    : host,
                                ),
                              );
                            }}>
                            <View style={styles.checkboxRow}>
                              <View style={styles.checkboxSquare}>
                                {item.attending === 0 && (
                                  <View style={styles.checkboxChecked} />
                                )}
                              </View>
                              <Text style={styles.checkboxText}>No</Text>
                            </View>
                          </TouchableOpacity>

                          {/* Remove Button — only for non-admins */}
                          {!allmembers?.response?.some(
                            member =>
                              member.id === item.id &&
                              member.id === user.body.id,
                          ) && (
                            <TouchableOpacity
                              onPress={() => {
                                setHosts(prevHosts =>
                                  prevHosts.filter(host => host.id !== item.id),
                                );
                              }}>
                              <Text
                                style={[
                                  styles.removeButtonText,
                                  {color: 'red'},
                                ]}>
                                ✕
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}
                  />
                </View>
              </View>
            )}
            {inputValues.resource_id &&
              !loading2 &&
              allmembers?.response?.length > 0 && (
                <>
                  {allmembers?.response.filter(
                    member =>
                      (member.member_type === 'host' || member.is_admin) &&
                      !hosts?.some(host => host.id === member.id),
                  ).length === 0 ? (
                    <Text style={styles.noText}>No more hosts available</Text>
                  ) : (
                    <Dropdown
                      style={styles.dropdown}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      iconStyle={styles.iconStyle}
                      data={allmembers?.response.filter(
                        member =>
                          (member.member_type === 'host' || member.is_admin) &&
                          !hosts?.some(host => host.id === member.id),
                      )}
                      search
                      maxHeight={300}
                      labelField="title"
                      valueField="id"
                      placeholder="Select Hosts"
                      searchPlaceholder="Search..."
                      value={hosts[hosts.length - 1] || null}
                      onChange={item => {
                        setHosts(prevHosts => {
                          const newHost = {
                            id: item.id,
                            name: item.title,
                            attending: 1,
                          };
                          if (
                            !prevHosts?.some(host => host.id === newHost.id)
                          ) {
                            return [...prevHosts, newHost];
                          }
                          return prevHosts;
                        });
                      }}
                      renderItem={item => (
                        <View style={styles.item}>
                          <Text style={styles.textItem}>{item.title}</Text>
                        </View>
                      )}
                    />
                  )}
                </>
              )}
          </View>

          {/* FREE EVENT */}
          <CustomRadioGroup
            label="Is this a free event?"
            value={inputValues.freeEvent}
            onChange={val => setInputValues({...inputValues, freeEvent: val})}
            isEditing={isEditing}
            disabledCondition={isEditing}
          />

          {/* PROFIT REPORTABLE TO IRS */}
          {inputValues.freeEvent !== 1 && (
            <CustomRadioGroup
              label="Will this event result in profits that are reportable to the IRS?"
              value={inputValues.profitReportableToIRS}
              onChange={val =>
                setInputValues({...inputValues, profitReportableToIRS: val})
              }
            />
          )}

          {/*EVENT DATE */}
          <View style={styles.TitleBox}>
            <Text style={styles.inputTitle}>Event Date: </Text>
            {!inputValues.startdate && inputValues.error ? (
              <Text style={styles.errorText}>{inputValues.error}</Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.buttonWidth}
            onPress={() => handleFieldPress('startdate', 'date')}>
            <TextInput
              style={[styles.inputField]}
              placeholder="Set Date"
              placeholderTextColor="lightgrey"
              value={getDateFieldValue('startdate')}
              editable={false}
            />
          </TouchableOpacity>

          {/* EVENT START TIME */}
          <View style={styles.TitleBox}>
            <Text style={styles.inputTitle}>Event Start Time: </Text>
            {!inputValues.startTime && inputValues.error ? (
              <Text style={styles.errorText}>{inputValues.error}</Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.buttonWidth}
            onPress={() => handleFieldPress('startTime', 'time')}>
            <TextInput
              style={[styles.inputField]}
              placeholder="Set Time"
              placeholderTextColor="lightgrey"
              value={getTimeFieldValue('startTime')}
              editable={false}
            />
          </TouchableOpacity>

          {/*EVENT END TIME */}
          <View style={styles.TitleBox}>
            <Text style={styles.inputTitle}>Event End Time: </Text>
            {!inputValues.endTime && inputValues.error ? (
              <Text style={styles.errorText}>{inputValues.error}</Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.buttonWidth}
            onPress={() => {
              if (inputValues.startTime) {
                handleFieldPress('endTime', 'time');
              } else {
                ToastAndroid.show(
                  'Select Event Start Time first',
                  ToastAndroid.SHORT,
                );
              }
            }}
            disabled={!inputValues.startTime && false}>
            <TextInput
              style={[styles.inputField]}
              placeholder="Set Time"
              placeholderTextColor="lightgrey"
              value={getTimeFieldValue('endTime')}
              editable={false}
            />
          </TouchableOpacity>

          {/* EVENT LOCATION */}
          <CustomInput
            label="Location"
            value={inputValues.location}
            onChange={text => setInputValues({...inputValues, location: text})}
            required={true}
            showError={showErrors}
            placeholder="Enter Here"
            multiline={true}
            height={'auto'}
          />

          {/* ENTRY FEES*/}
          {inputValues.freeEvent !== 1 && (
            <CustomInput
              label="Entry Fee"
              subLabel="(Per Person)"
              value={
                inputValues.entryFees === ''
                  ? ''
                  : String(inputValues.entryFees)
              }
              onChange={text => validateFloatValue(text, 'entryFees')}
              required={true}
              showError={showErrors}
              placeholder="Enter Here"
              keyboardType={'numeric'}
            />
          )}

          {/* OMG FEES*/}
          {inputValues.freeEvent !== 1 && (
            <CustomInput
              label="Processing Fee"
              subLabel="(Per Person)"
              value={`$${inputValues.commission}`}
              editable={false}
              placeholder="Enter Here"
              backgroundColor="#e0e0e0"
              color="grey"
            />
          )}

          {/* TOTAL EVENT COST*/}
          {inputValues.freeEvent !== 1 && (
            <CustomInput
              label="Total Event Cost"
              subLabel="(Per Person)"
              value={`$${inputValues.totalEventCost}`}
              editable={false}
              placeholder="Enter Here"
              backgroundColor="#e0e0e0"
              color="grey"
            />
          )}

          {/* ANNOUNCE EVENT DATE*/}
          <View style={styles.TitleBox}>
            <Text style={styles.inputTitle}>Announce Event Date: </Text>
          </View>
          <TouchableOpacity
            onPress={() => ValidateEventStartDate('announceEvent')}>
            <TextInput
              style={styles.inputField}
              placeholder="Set Date"
              placeholderTextColor="lightgrey"
              value={
                inputValues?.announceEvent
                  ? `${getDateFieldValue(
                      'announceEvent',
                    )} (${calculatedDifference})`
                  : 'Immediately'
              }
              editable={false}
            />
          </TouchableOpacity>

          {/* ANNOUNCE EVENT TIME */}
          <View style={styles.TitleBox}>
            <Text style={styles.inputTitle}>Announce Event Time: </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (!inputValues.announceEvent) {
                ToastAndroid.show(
                  'Set Announce Event Date first',
                  ToastAndroid.SHORT,
                );
              } else {
                handleFieldPress('announceEventTime', 'time');
              }
            }}>
            <TextInput
              style={styles.inputField}
              placeholder="Set Time"
              placeholderTextColor="lightgrey"
              value={
                inputValues?.announceEventTime
                  ? getTimeFieldValue('announceEventTime')
                  : 'Immediately'
              }
              editable={false}
            />
          </TouchableOpacity>

          {/* CONTACT MEMBERS */}
          <View style={styles.TitleBox}>
            <Text style={styles.inputTitle}>Contact Members: </Text>
          </View>
          <View style={styles.boxescontainer}>
            {/* Email Option */}
            <TouchableOpacity
              style={styles.emailOptions}
              onPress={() => {
                const updatedContactMembers =
                  inputValues.contactMembers.includes('email')
                    ? inputValues.contactMembers.filter(
                        member => member !== 'email',
                      )
                    : [...inputValues.contactMembers, 'email'];
                setInputValues({
                  ...inputValues,
                  contactMembers: updatedContactMembers,
                });
              }}>
              <View style={styles.checkbox}>
                {inputValues?.contactMembers?.includes('email') && (
                  <Image
                    source={require('../assets/tick.png')}
                    resizeMode="contain"
                    style={styles.tickImage}
                  />
                )}
              </View>
              <Text style={styles.noText}>Email</Text>
            </TouchableOpacity>
            {/* Text Message Option */}
            <TouchableOpacity
              style={{alignItems: 'center'}}
              onPress={() => {
                const updatedContactMembers =
                  inputValues.contactMembers.includes('sms')
                    ? inputValues.contactMembers.filter(
                        member => member !== 'sms',
                      )
                    : [...inputValues.contactMembers, 'sms'];
                setInputValues({
                  ...inputValues,
                  contactMembers: updatedContactMembers,
                });
              }}>
              <View style={styles.checkbox}>
                {inputValues?.contactMembers?.includes('sms') && (
                  <Image
                    source={require('../assets/tick.png')}
                    resizeMode="contain"
                    style={styles.tickImage}
                  />
                )}
              </View>
              <Text style={styles.noText}>Text Message</Text>
            </TouchableOpacity>
          </View>

          {/* REGISTRATION OPENS DATE*/}
          <View style={styles.TitleBox}>
            <Text style={styles.inputTitle}>Registration Opens Date: </Text>
          </View>
          <TouchableOpacity
            onPress={() => ValidateEventStartDate('registrationOpens')}>
            <TextInput
              style={styles.inputField}
              placeholder="Set Date"
              placeholderTextColor="lightgrey"
              value={
                inputValues?.registrationOpens
                  ? `${getDateFieldValue(
                      'registrationOpens',
                    )} (${calculatedDifferenceRegistration})`
                  : 'Immediately'
              }
              editable={false}
            />
          </TouchableOpacity>

          {/* REGISTRATION OPEN TIME */}
          <View style={styles.TitleBox}>
            <Text style={styles.inputTitle}>Registration Opens Time: </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (!inputValues.registrationOpens) {
                ToastAndroid.show(
                  'Set Registration Opens Date first',
                  ToastAndroid.SHORT,
                );
              } else {
                handleFieldPress('registrationOpensTime', 'time');
              }
            }}>
            <TextInput
              style={styles.inputField}
              placeholder="Set Time"
              placeholderTextColor="lightgrey"
              value={
                inputValues?.registrationOpensTime
                  ? getTimeFieldValue('registrationOpensTime')
                  : 'Immediately'
              }
              editable={false}
            />
          </TouchableOpacity>

          {/* REGISTRATION CLOSES DATE */}
          <View style={styles.TitleBox}>
            <Text style={styles.inputTitle}>Registration Closes Date:</Text>
            {!inputValues.registrationCloses && inputValues.error ? (
              <Text style={[styles.errorText, {marginLeft: 2}]}>
                {' '}
                {inputValues.error}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={() => ValidateEventStartDate('registrationCloses')}>
            <TextInput
              style={[styles.inputField]}
              placeholder="Set Date"
              placeholderTextColor="lightgrey"
              value={
                inputValues?.registrationCloses &&
                `${getDateFieldValue(
                  'registrationCloses',
                )} (${calculatedDifferenceRegistrationClose})`
              }
              editable={false}
            />
          </TouchableOpacity>

          {/* REGISTRATION CLOSES TIME */}
          <View style={styles.TitleBox}>
            <Text style={styles.inputTitle}>Registration Closes Time:</Text>
            {!inputValues.registrationClosesTime && inputValues.error ? (
              <Text style={[styles.errorText, {marginLeft: 2}]}>
                {' '}
                {inputValues.error}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={() => handleFieldPress('registrationClosesTime', 'time')}>
            <TextInput
              style={[styles.inputField]}
              placeholder="Set Time"
              placeholderTextColor="lightgrey"
              value={
                inputValues?.registrationClosesTime &&
                getTimeFieldValue('registrationClosesTime')
              }
              editable={false}
            />
          </TouchableOpacity>

          {/* CHARGES PROCESSED   */}
          {inputValues.freeEvent !== 1 && (
            <View>
              <View style={styles.TitleBox}>
                <Text style={styles.inputTitle}>Charges Processed Date:</Text>
              </View>

              <TouchableOpacity
                onPress={() => ValidateEventStartDate('chargesDate')}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Set Date"
                  placeholderTextColor="lightgrey"
                  value={
                    inputValues?.chargesDate
                      ? `${getDateFieldValue(
                          'chargesDate',
                        )} (${calculatedChargesDate})`
                      : 'Upon registration'
                  }
                  editable={false}
                />
              </TouchableOpacity>

              <View style={styles.TitleBox}>
                <Text style={styles.inputTitle}>Charges Processed Time:</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleFieldPress('chargesTime', 'time')}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Set Time"
                  placeholderTextColor="lightgrey"
                  value={
                    inputValues?.chargesTime
                      ? getTimeFieldValue('chargesTime')
                      : 'Upon registration'
                  }
                  editable={false}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Refunds Permitted */}
          {inputValues.freeEvent !== 1 && (
            <CustomRadioGroup
              label="Are Refunds Permitted?"
              value={inputValues.refundsPermitted}
              onChange={val =>
                setInputValues({...inputValues, refundsPermitted: val})
              }
            />
          )}

          {/* REFUND Deadline Date*/}
          {inputValues.freeEvent !== 1 &&
            inputValues.refundsPermitted === 1 && (
              <>
                <View style={styles.TitleBox}>
                  <Text style={styles.inputTitle}>Refund Deadline Date: </Text>
                  {!inputValues.refundDeadline && inputValues.error ? (
                    <Text style={styles.errorText}>{inputValues.error}</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={() => ValidateEventStartDate('refundDeadline')}>
                  <TextInput
                    style={[styles.inputField]}
                    placeholder="Set Date"
                    placeholderTextColor="lightgrey"
                    value={
                      inputValues?.refundDeadline &&
                      `${getDateFieldValue(
                        'refundDeadline',
                      )} (${calculatedDifferenceRefund})`
                    }
                    editable={false}
                  />
                </TouchableOpacity>
              </>
            )}

          {/* REFUND Deadline Time*/}
          {inputValues.freeEvent !== 1 &&
            inputValues.refundsPermitted === 1 && (
              <>
                <View style={styles.TitleBox}>
                  <Text style={styles.inputTitle}>Refund Deadline Time: </Text>
                  {!inputValues.refundDeadlineTime && inputValues.error ? (
                    <Text style={styles.errorText}>{inputValues.error}</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={() =>
                    handleFieldPress('refundDeadlineTime', 'time')
                  }>
                  <TextInput
                    style={[styles.inputField]}
                    placeholder="Set Time"
                    placeholderTextColor="lightgrey"
                    value={
                      inputValues?.refundDeadlineTime &&
                      getTimeFieldValue('refundDeadlineTime')
                    }
                    editable={false}
                  />
                </TouchableOpacity>
              </>
            )}

          {/* REFUND Processing Fee */}
          {inputValues.freeEvent !== 1 &&
            inputValues.refundsPermitted === 1 && (
              <CustomInput
                label="Refund Processing Fee"
                subLabel="(Per Person)"
                value={
                  inputValues.refundProcessingFee === 0
                    ? ''
                    : inputValues.refundProcessingFee
                }
                onChange={text =>
                  validateFloatValue(text, 'refundProcessingFee')
                }
                placeholder="Enter Here"
                keyboardType={'numeric'}
              />
            )}

          {/* REFUND AMOUNT */}
          {inputValues.freeEvent !== 1 &&
            inputValues.refundsPermitted === 1 && (
              <CustomInput
                label="Refund Amount"
                subLabel="(Per Person)"
                value={`$${inputValues.refundAmount}`}
                editable={false}
                placeholder="Enter Here"
                backgroundColor="#e0e0e0"
                color="grey"
              />
            )}

          {/* REFUND POLICY */}
          {inputValues.freeEvent !== 1 && (
            <CustomInput
              label="Refund Policy"
              subLabel="(Per Person)"
              value={
                inputValues.refundPolicy && inputValues.refundsPermitted === 1
                  ? inputValues.refundPolicy
                  : 'This event is non-refundable'
              }
              editable={false}
              placeholder="Enter Here"
              backgroundColor="#e0e0e0"
              height={'auto'}
              multiline={true}
            />
          )}

          {/* ATTENDANCE LIMIT */}
          {/* <View style={styles.TitleBox}>
            <Text style={styles.inputTitle}>Attendance Limit: </Text>
          </View>
          <View style={styles.inputField}>
            <TextInput
              style={{color: 'black', width: '100%'}}
              placeholder="Enter Here"
              placeholderTextColor="lightgrey"
              keyboardType="numeric"
              value={String(inputValues.attendanceLimit)}
              onChangeText={text =>
                setInputValues({...inputValues, attendanceLimit: Number(text)})
              }
            />
          </View> */}

          {/* Minimum Participants */}
          <CustomInput
            label="Minimum Participants"
            value={
              inputValues.minparticipant === 0
                ? ''
                : String(inputValues.minparticipant)
            }
            onChange={text => validateIntegerValue(text, 'minparticipant')}
            placeholder="No Limit"
            keyboardType={'numeric'}
          />

          {/* Maximum Participants */}
          <CustomInput
            label="Maximum Participants"
            value={
              inputValues.maxparticipant === 0
                ? ''
                : String(inputValues.maxparticipant)
            }
            onChange={text => validateIntegerValue(text, 'maxparticipant')}
            placeholder="No Limit"
            keyboardType={'numeric'}
          />

          {/* INCLUDE HOSTS */}
          <CustomRadioGroup
            label="Include Hosts in this limit?"
            value={inputValues.includeHosts}
            disabled={NoHostAttendingflag}
            onChange={val =>
              setInputValues({...inputValues, includeHosts: val})
            }
          />

          {/* HOST PAY */}
          {inputValues.freeEvent !== 1 && (
            <CustomRadioGroup
              label="Do Hosts Pay?"
              value={inputValues.hostPay}
              disabled={!inputValues.includeHosts}
              onChange={val => setInputValues({...inputValues, hostPay: val})}
            />
          )}

          {/* GUEST ALLOWED */}
          <CustomInput
            label="# Guests Allowed"
            value={
              inputValues.GuestAllowed === 0
                ? ''
                : String(inputValues.GuestAllowed)
            }
            onChange={text => validateIntegerValue(text, 'GuestAllowed')}
            placeholder="No Limit"
            keyboardType={'numeric'}
          />

          {/* SHOW ATTENDEES */}
          <CustomRadioGroup
            label="Show Attendees:"
            value={inputValues.showAttendees}
            onChange={val =>
              setInputValues({...inputValues, showAttendees: val})
            }
          />

          {/* REPEAT */}
          <View style={[styles.repeatContainer, {backgroundColor: '#e0e0e0'}]}>
            <Text style={styles.RepeatTitle}>Repeat? </Text>
            <Switch
              trackColor={{false: '#ccc', true: '#ff6666'}}
              thumbColor={inputValues.repeat ? '#f00' : '#fff'}
              onValueChange={() =>
                setInputValues({...inputValues, repeat: !inputValues.repeat})
              }
              value={inputValues.repeat}
            />
          </View>

          {/*REPEAT CYCLE  */}
          {inputValues.repeat ? (
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              iconStyle={styles.iconStyle}
              data={repeatcycle}
              maxHeight={200}
              labelField="name"
              valueField="id"
              placeholder="Select Repeat-Cycle"
              value={
                repeatcycle.find(
                  item => item.title === inputValues.repeat_cycle,
                )?.id
              }
              onChange={item =>
                setInputValues({...inputValues, repeat_cycle: item.title})
              }
              renderItem={item => (
                <View style={styles.item}>
                  <Text style={styles.textItem}>{item.name}</Text>
                </View>
              )}
            />
          ) : null}

          {/* EVENT NOTES */}
          <CustomInput
            label="Note Instructions"
            value={inputValues.notes}
            onChange={text => setInputValues({...inputValues, notes: text})}
            placeholder="Type Here"
            multiline={true}
            height={100}
          />

          {/* Event Template Flag */}
          {!isEditing && (
            <View
              style={[styles.repeatContainer, {backgroundColor: '#e0e0e0'}]}>
              <Text style={styles.RepeatTitle}>Save as template? </Text>
              <Switch
                trackColor={{false: '#ccc', true: '#ff6666'}}
                thumbColor={inputValues.createTemplate ? '#f00' : '#fff'}
                onValueChange={() =>
                  setInputValues({
                    ...inputValues,
                    createTemplate: !inputValues.createTemplate,
                  })
                }
                value={inputValues.createTemplate}
              />
            </View>
          )}

          {/* Template Name */}
          {inputValues.createTemplate && (
            <CustomInput
              label="Template Name"
              value={inputValues.templateName}
              onChange={text =>
                setInputValues({...inputValues, templateName: text})
              }
              placeholder="Enter Here"
            />
          )}

          {/* Error Message */}
          {inputValues.error2 ? (
            <Text style={styles.errorText}>{inputValues.error2}</Text>
          ) : null}

          {/*SUBMIT BUTTON */}
          <TouchableOpacity
            style={styles.button}
            onPress={inputValues.loading ? null : submitData}>
            {inputValues.loading ? (
              <ActivityIndicator color="white" size={43} />
            ) : isEditing ? (
              <Text style={styles.buttonText}>Save Changes</Text>
            ) : (
              <Text style={styles.buttonText}>Organize My Event</Text>
            )}
          </TouchableOpacity>

          {inputValues.show && (
            <DateTimePicker
              value={inputValues[inputValues.currentField] || new Date()}
              mode={getPickerMode(inputValues.currentField)}
              minimumDate={getFieldMinDate(inputValues.currentField)}
              maximumDate={getFieldMaxDate(inputValues.currentField)}
              is24Hour={false}
              display="default"
              onChange={(event, selectedDate) => {
                if (event.type === 'set') {
                  handleDateChange(inputValues.currentField, selectedDate);
                } else if (event.type === 'dismissed') {
                  setInputValues(prev => ({...prev, show: false}));
                }
              }}
            />
          )}
        </KeyboardAvoidingView>
      </ScrollView>

      {/* IMAGE PICKER MODAL */}
      {pickerFlag && (
        <ImagePickerModal
          visible={pickerFlag}
          setVisible={setPickerFlag}
          setImageUri={uri =>
            setInputValues(prev => ({...prev, imageUri: uri}))
          }
        />
      )}

      {/* Message Modal */}
      {messageModalVisible && (
        <MessageModal
          visible={messageModalVisible}
          title="Message"
          message={`Event ${isEditing ? 'updated' : 'created'} successfully`}
          onClose={() => {
            setMessageModalVisible(false),
              isEditing
                ? navigation.goBack()
                : navigation.navigate('My Events');
          }}
          IconName={'checkmark-circle-outline'}
          iconColor="#4CAF50"
        />
      )}
    </SafeAreaView>
  );
};

export default CreateEvent;

const styles = StyleSheet.create({
  safeAreaContainer: {flex: 1, backgroundColor: 'white'},
  keyboardContainer: {flex: 1},
  container: {
    marginHorizontal: 20,
    marginTop: height * 0.02,
    paddingBottom: height * 0.08,
  },
  button: {
    borderRadius: 10,
    marginTop: 30,
    backgroundColor: button1backgroundColor,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: buttonTextSize,
    padding: 10,
    color: button1TextColor,
    fontWeight: 'bold',
  },
  flatView: {flexDirection: 'row', paddingVertical: 3},
  tickImage: {width: 15, height: 15},
  inputTitle: {
    fontSize: InputTitleSize,
    color: 'black',
    marginBottom: 2,
  },
  TitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    color: 'black',
  },
  noText: {color: 'grey'},
  repeatContainer: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'lightgrey',
    height: 45,
    borderRadius: 10,
  },
  RepeatTitle: {
    fontSize: InputTitleSize,
    color: 'black',
    marginLeft: 5,
  },
  imageupload: {
    backgroundColor: '#EEEEEE',
    marginTop: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: 'grey',
  },
  emailOptions: {alignItems: 'center', marginRight: 20},
  buttonWidth: {width: '100%'},
  imageuploaded: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
  },
  boxescontainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  checkbox: {
    borderWidth: 1,
    borderColor: 'lightgrey',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    marginRight: 20,
  },
  inputField: {
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    height: 48,
    borderRadius: 10,
    paddingLeft: 15,
    borderColor: InputBorderColor,
    color: 'black',
  },
  inputFieldDropDown: {
    borderWidth: 1,
    height: 48,
    borderRadius: 10,
    paddingLeft: 5,
    borderColor: InputBorderColor,
    padding: 5,
  },
  keywordContainer: {
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    height: 35,
    width: '40%',
    justifyContent: 'center',
  },
  keywordText: {
    color: 'black',
    marginRight: 5,
    fontSize: 12,
  },
  eventTitle: {
    textAlign: 'center',
    color: 'black',
    marginTop: 10,
  },
  dropdown: {
    marginTop: 10,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 15,
    borderColor: InputBorderColor,
  },
  item: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: 'lightgrey',
  },
  textItem: {
    flex: 1,
    color: 'black',
    fontSize: 16,
  },
  placeholderStyle: {
    fontSize: 16,
    color: 'lightgrey',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'black',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  removeButton: {
    borderRadius: 50,
    padding: 5,
    marginLeft: 5,
  },
  removeButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  inputSearchStyle: {
    color: 'black',
  },
  attendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignSelf: 'center',
    marginLeft: 4,
  },

  attendingLabel: {
    marginRight: 8,
    fontSize: 12,
    fontWeight: '500',
    color: 'black',
  },

  checkboxItem: {
    marginRight: 10,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkboxSquare: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginRight: 4,
  },

  checkboxChecked: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: 'green',
  },

  checkboxText: {
    fontSize: 12,
    color: 'black',
  },
});
