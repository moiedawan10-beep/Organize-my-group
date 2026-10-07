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
  Modal,
  Platform,
  SafeAreaView,
  ToastAndroid,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
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
import Icon2 from 'react-native-vector-icons/Ionicons';
import {Dropdown} from 'react-native-element-dropdown';
import {launchImageLibrary} from 'react-native-image-picker';
import {useDispatch, useSelector} from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import {userInfo} from '../redux/slices/userInfoSlice';
import {AllMembersAction} from '../redux/slices/AllmembersSlice';
import {EditEventAction} from '../redux/slices/EditEventSlice';
import ImagePicker from 'react-native-image-crop-picker';
import MessageModal from '../components/MessageModal';

const {height} = Dimensions.get('window');

const EditEvent = ({navigation, route}) => {
  const dispatch = useDispatch();
  const {details} = route.params;
  const [pickerFlag, setPickerFlag] = useState(false);
  const {username} = useSelector(state => state.userInfo);
  const {allmembers, loading2} = useSelector(state => state.AllMembers);

  const gettime = time => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const starttime = new Date();
    starttime.setHours(hours);
    starttime.setMinutes(minutes);
    starttime.setSeconds(seconds);
    return starttime;
  };

  const [inputValues, setInputValues] = useState({
    imageUri: null,
    resource_id: null,
    creatorName: '',
    eventName: '',
    description: '',
    freeEvent: 2,
    hostPay: 2,
    startdate: null,
    startTime: null,
    endTime: null,
    location: '',
    mode: 'date',
    currentField: 'startdate',
    show: false,
    entryFees: '',
    commission: '',
    omgFees: '',
    totalEventCost: '',
    announceEvent: null,
    contactMembers: [],
    registrationOpens: null,
    registrationCloses: null,
    refundDeadline: null,
    refundPolicy: '',
    refundProcessingFee: '',
    refundAmount: '',
    attendanceLimit: '',
    includeHosts: 2,
    minparticipant: '',
    GuestAllowed: '',
    showAttendees: 2,
    repeat: false,
    repeat_cycle: null,
    notes: '',
    error: '',
    error2: '',
    loading: false,
  });

  const [hosts, setHosts] = useState([]);
  const [hostIds, setHostIds] = useState([]);
  const [currentAllowedField, setCurrentAllowedField] = useState('startdate');
  const [messageModalVisible, setMessageModalVisible] = useState(false);

  const repeatcycle = [
    {id: 1, name: 'Daily', title: 'daily'},
    {id: 2, name: 'Weekly', title: 'weekly'},
    {id: 3, name: 'Monthly', title: 'monthly'},
  ];
  useEffect(() => {
    dispatch(userInfo());
  }, []);

  useEffect(() => {
    const comision = inputValues.entryFees * 0.15;
    setInputValues({...inputValues, commission: comision.toFixed(2)});
  }, [inputValues.entryFees]);

  useEffect(() => {
    setInputValues({
      creatorName: username.length > 0 ? username : '',
      resource_id: details ? details.resource_id : '',
      eventName: details ? details.title : '',
      description: details ? details.description : '',
      imageUri: details ? details.photo_url_profile : null,
      freeEvent: details.entry_fee === 0 ? 1 : 0,
      hostPay: details ? details.hosts_pay : 2,
      startdate: details ? new Date(details.date) : null,
      startTime: details ? gettime(details.start_time) : null,
      endTime: details ? gettime(details.end_time) : null,
      location: details ? details.location : '',
      entryFees: details ? details.entry_fee : '',
      commission: details ? details.commission : '',
      totalEventCost: details ? details.total_amount : '',
      announceEvent: details ? new Date(details.announce_date) : null,
      registrationOpens: details ? new Date(details.registration_opens) : null,
      registrationCloses: details
        ? new Date(details.registration_closes)
        : null,
      refundDeadline: details ? new Date(details.refund_deadline) : null,
      refundPolicy: details ? details.refund_policy : null,
      refundProcessingFee: details ? details.refund_process_fee : '',
      refundAmount: details ? details.refund_amount : '',
      attendanceLimit: details ? details?.max_attendence : '',
      includeHosts: details ? details.hosts_included : 2,
      minparticipant: details ? details.min_attendence : '',
      GuestAllowed: details ? details.guest_allowed : '0',
      showAttendees: details ? details.show_attendees : 2,
      repeat: details.repeat_event ? true : false,
      repeat_cycle: details ? details.repeat_cycle : null,
      notes: details ? details.notes : '',
      contactMembers: details ? details.contact_via.split(',') : [],
    });

    setHosts(details?.hosts);
  }, [details, navigation]);

  useEffect(() => {
    const ids = hosts.map(host => host.id);
    setHostIds(ids);
  }, [hosts]);

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
    dispatch(AllMembersAction(inputValues?.resource_id));
  }, [inputValues?.resource_id]);

  useEffect(() => {
    if (!inputValues.refundDeadline) {
      return;
    }
    setInputValues(prevValues => ({
      ...prevValues,
      refundPolicy: `Refunds will be permitted if you remove yourself from the event before ${prevValues.refundDeadline.toLocaleString()}.\nThe refunded amount after processing fees for this event will be $${
        prevValues.refundAmount
      }.`,
    }));
  }, [inputValues.refundDeadline, inputValues.refundAmount]);

  const showMode = (currentField, mode) => {
    setInputValues({...inputValues, show: true, currentField, mode});
  };

  const PickerOnChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    if (currentDate) {
      setInputValues({
        ...inputValues,
        [inputValues.currentField]: currentDate,
        show: false,
      });
    }
    if (inputValues.mode === 'date') {
      switch (currentAllowedField) {
        case 'startdate':
          setCurrentAllowedField('announceEvent');
          break;
        case 'announceEvent':
          setCurrentAllowedField('registrationOpens');
          break;
        case 'registrationOpens':
          setCurrentAllowedField('registrationCloses');
          break;
        case 'registrationCloses':
          setCurrentAllowedField('refundDeadline');
          break;
        default:
          break;
      }
    }
  };

  const EmptyAllInputFields = () => {
    setInputValues({
      resource_id: '',
      name: '',
      description: '',
      imageUri: null,
      freeEvent: 2,
      hostPay: 2,
      startdate: null,
      startTime: null,
      endTime: null,
      location: '',
      entryFees: '',
      commission: '',
      omgFees: '',
      totalEventCost: '',
      announceEvent: null,
      contactMembers: [],
      registrationOpens: null,
      registrationCloses: null,
      refundDeadline: null,
      refundPolicy: '',
      refundProcessingFee: '',
      refundAmount: '',
      attendanceLimit: '',
      includeHosts: 2,
      minparticipant: '',
      GuestAllowed: '',
      showAttendees: 2,
      repeat: false,
      repeat_cycle: null,
      notes: '',
      error: '',
      error2: '',
      loading: false,
    }),
      setHosts([]);
    setHostIds([]);
  };

  const submitData = async () => {
    if (
      !inputValues.resource_id ||
      !inputValues.creatorName ||
      !inputValues.eventName ||
      !inputValues.startdate ||
      !inputValues.startTime ||
      !inputValues.endTime ||
      !inputValues.registrationOpens ||
      !inputValues.registrationCloses ||
      !inputValues.location ||
      !inputValues.attendanceLimit ||
      Number(inputValues.includeHosts) == 2 ||
      Number(inputValues.showAttendees) == 2
    ) {
      setInputValues({
        ...inputValues,
        error: '*',
        error2: 'Please Fill Fields with * sign',
      });
      return;
    }

    if (
      inputValues.freeEvent === 0 &&
      (Number(inputValues.hostPay) == 2 || !inputValues.refundDeadline)
    ) {
      setInputValues({
        ...inputValues,
        error: '*',
        error2: 'Please Fill Fields with * sign',
      });
      return;
    }

    if (
      Number(inputValues.attendanceLimit) < Number(inputValues.minparticipant)
    ) {
      setInputValues({
        ...inputValues,
        error2:
          'Maximum Participants must be greater than minimum participants',
      });
      return;
    }
    setInputValues({...inputValues, error: '', error2: ''});

    if (inputValues.repeat === true && !inputValues.repeat_cycle) {
      setInputValues({...inputValues, error2: 'Please select Repeat-Cycle'});
      return;
    }
    setInputValues({...inputValues, error2: '', loading: true});

    const payload = {
      id: details.id,
      title: inputValues.eventName,
      description: inputValues.description,
      hosts: hostIds ? hostIds : '',
      free_event: inputValues.freeEvent,
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
      registration_opens: inputValues.registrationOpens,
      registration_closes: inputValues.registrationCloses,
      announce_date: inputValues.announceEvent,
      refund_deadline: inputValues.refundDeadline,
      refund_policy: inputValues.refundPolicy,
      refund_process_fee: inputValues.refundProcessingFee,
      refund_amount: inputValues.refundAmount,
      max_attendence: inputValues.attendanceLimit,
      hosts_included: inputValues.includeHosts,
      min_attendence: inputValues.minparticipant,
      guest_allowed: inputValues.GuestAllowed,
      repeat_event: inputValues.repeat,
      repeat_cycle: inputValues.repeat_cycle,
      show_attendees: inputValues.showAttendees,
      contact_via: inputValues.contactMembers,
      notes: inputValues.notes,
      photo: inputValues.imageUri,
    };

    const response = await dispatch(EditEventAction(payload));
    if (response?.payload?.status_code === 200) {
      setMessageModalVisible(true);
      route.params?.onUpdate();
      EmptyAllInputFields();
    } else {
      if (response?.payload?.body?.title) {
        Alert.alert('Error', response?.payload?.body?.title[0]);
      } else {
        Alert.alert('Error', response?.payload?.body);
        console.log('Error', response);
      }
    }

    setInputValues({...inputValues, loading: false});
  };

  const selectImage = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const uri = response.assets[0].uri;
        setInputValues({...inputValues, imageUri: uri});
      }
    });
  };

  const pickImage = () => {
    ImagePicker.openPicker({
      width: 390,
      height: 400,
      cropping: true,
      mediaType: 'photo',
      cropperCircleOverlay: true,
      showCropFrame: false,
      cropperActiveWidgetColor: 'red',
    })
      .then(response => {
        setInputValues({...inputValues, imageUri: response.path});
        setPickerFlag(false);
      })
      .catch(error => {
        if (error.code === 'E_PICKER_CANCELLED') {
          console.log('Image selection cancelled');
        } else {
          Alert.alert('Error', error.message);
        }
      });
  };

  const takePhoto = () => {
    ImagePicker.openCamera({
      width: 390,
      height: 400,
      cropping: true,
      mediaType: 'photo',
      cropperCircleOverlay: true,
      showCropFrame: false,
      cropperActiveWidgetColor: 'red',
    })
      .then(response => {
        setInputValues({...inputValues, imageUri: response.path});
        setPickerFlag(false);
      })
      .catch(error => {
        if (error.code === 'E_PICKER_CANCELLED') {
          console.log('Camera operation cancelled');
        } else {
          Alert.alert('Error', error.message);
        }
      });
  };

  const handleFieldPress = (field, mode) => {
    if (
      !inputValues[field] &&
      field !== currentAllowedField &&
      mode === 'date'
    ) {
      Alert.alert(
        'Invalid Selection',
        `Please select the ${currentAllowedField} first.`,
      );

      return;
    }

    if (
      !inputValues[field] &&
      mode === 'time' &&
      (field === 'announceEvent' ||
        field === 'registrationOpens' ||
        field === 'registrationCloses') &&
      field !== currentAllowedField
    ) {
      Alert.alert(
        'Invalid Selection',
        `Please select the ${currentAllowedField} first.`,
      );
      return;
    }

    if (mode === 'time' && (field === 'startTime' || field === 'endTime')) {
      showMode(field, mode);
      return;
    }

    setCurrentAllowedField(field);
    showMode(field, mode);
  };

  const calculatedDifference = useMemo(() => {
    if (!inputValues.startdate || !inputValues.announceEvent) return '';
    const diffInMs = Math.abs(
      inputValues.announceEvent - inputValues.startdate,
    );
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const options = {hour: 'numeric', minute: 'numeric', hour12: true};
    const formattedTime = inputValues.announceEvent.toLocaleTimeString(
      'en-US',
      options,
    );
    return `${diffInDays} days before at ${formattedTime}`;
  }, [inputValues.startdate, inputValues.announceEvent]);

  const calculatedDifferenceRegistration = useMemo(() => {
    if (!inputValues.startdate || !inputValues.registrationOpens) return '';
    const diffInMs = Math.abs(
      inputValues.registrationOpens - inputValues.startdate,
    );
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const options = {hour: 'numeric', minute: 'numeric', hour12: true};
    const formattedTime = inputValues.registrationOpens.toLocaleTimeString(
      'en-US',
      options,
    );
    return `${diffInDays} days before at ${formattedTime}`;
  }, [inputValues.startdate, inputValues.registrationOpens]);

  const calculatedDifferenceRegistrationClose = useMemo(() => {
    if (!inputValues.startdate || !inputValues.registrationCloses) return '';
    const diffInMs = Math.abs(
      inputValues.registrationCloses - inputValues.startdate,
    );
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const options = {hour: 'numeric', minute: 'numeric', hour12: true};
    const formattedTime = inputValues.registrationCloses.toLocaleTimeString(
      'en-US',
      options,
    );
    return `${diffInDays} days before at ${formattedTime}`;
  }, [inputValues.startdate, inputValues.registrationCloses]);

  const calculatedDifferenceRefund = useMemo(() => {
    if (!inputValues.startdate || !inputValues.refundDeadline) return '';
    const diffInMs = Math.abs(
      inputValues.refundDeadline - inputValues.startdate,
    );
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const options = {hour: 'numeric', minute: 'numeric', hour12: true};
    const formattedTime = inputValues.refundDeadline.toLocaleTimeString(
      'en-US',
      options,
    );
    return `${diffInDays} days before at ${formattedTime}`;
  }, [inputValues.startdate, inputValues.refundDeadline]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <DashboardHeader2 title="Updating Event" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView
          // behavior={Platform.OS === 'android' ? 'padding' : 'height'}
          style={{flex: 1}}>
          {/* IMAGE */}
          {inputValues.imageUri ? (
            <TouchableOpacity
              onPress={() => setPickerFlag(true)}
              style={styles.imageupload}>
              <Image
                source={{uri: inputValues.imageUri}}
                resizeMode="cover"
                style={styles.imageuploaded}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.imageupload}
              onPress={() => setPickerFlag(true)}>
              <Icon2 name="camera-outline" size={30} color="#848484" />
            </TouchableOpacity>
          )}
          <Text style={styles.eventTitle}>Upload Photo</Text>

          {/* INPUT FIELDS */}

          <Text style={[styles.inputTitle, {marginTop: 20}]}>
            Event Creator:{' '}
          </Text>
          <View style={[styles.inputField, {backgroundColor: '#e0e0e0'}]}>
            <TextInput
              style={{width: '80%', color: 'grey'}}
              placeholder="Enter Here"
              placeholderTextColor="lightgrey"
              value={inputValues.creatorName}
              editable={false}
              onChangeText={text =>
                setInputValues({...inputValues, creatorName: text})
              }
            />
          </View>

          <View style={styles.TitleBox}>
            <Text style={styles.inputTitle}>Event Name: </Text>
            {!inputValues.eventName && inputValues.error ? (
              <Text style={styles.errorText}>{inputValues.error}</Text>
            ) : null}
          </View>
          <View style={styles.inputField}>
            <TextInput
              style={{width: '100%', color: 'black', paddingRight: 10}}
              placeholder="Enter Here"
              placeholderTextColor="lightgrey"
              value={inputValues.eventName}
              maxLength={64}
              onChangeText={text =>
                setInputValues({...inputValues, eventName: text})
              }
            />
          </View>

          {/* Event Description */}
          <Text style={[styles.inputTitle, {marginTop: 20}]}>
            Description:{' '}
          </Text>
          <View style={[styles.inputField, {height: 'auto'}]}>
            <TextInput
              style={{width: '100%', color: 'black', paddingRight: 10}}
              placeholder="Enter Here"
              placeholderTextColor="lightgrey"
              maxLength={255}
              value={inputValues.description}
              onChangeText={text =>
                setInputValues({...inputValues, description: text})
              }
            />
          </View>

          {/* HOST */}
          <Text style={[styles.inputTitle, {marginTop: 20}]}>Host(s): </Text>
          {hosts.length > 0 && (
            <View
              style={[styles.inputField, {flexWrap: 'wrap', height: 'auto'}]}>
              <View style={styles.keywordsContainer}>
                <FlatList
                  data={hosts}
                  numColumns={2}
                  keyExtractor={item => item}
                  renderItem={({item}) => (
                    <View style={styles.keywordContainer}>
                      <Text style={styles.keywordText}>{item.title}</Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => {
                          setHosts(prevHosts =>
                            prevHosts.filter(id => id !== item),
                          );
                        }}>
                        <Text style={styles.removeButtonText}>X</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>
            </View>
          )}

          {inputValues.resource_id &&
            !loading2 &&
            allmembers?.response?.length > 0 && (
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={allmembers?.response.filter(
                  member =>
                    member?.member_type === 'admin' ||
                    member?.member_type === 'host',
                )}
                search
                maxHeight={300}
                labelField="title"
                valueField="membership_id"
                placeholder="Select Hosts"
                searchPlaceholder="Search..."
                value={hosts[hosts.length - 1] || null}
                onChange={item => {
                  setHosts(prevHosts => {
                    if (Array.isArray(prevHosts)) {
                      if (
                        !prevHosts.some(
                          existingItem => existingItem.id === item.id,
                        )
                      ) {
                        return [...prevHosts, item];
                      }
                      return prevHosts;
                    }
                    return [item];
                  });
                }}
                renderItem={item => (
                  <View style={styles.item}>
                    <Text style={styles.textItem}>{item.title}</Text>
                  </View>
                )}
              />
            )}

          {/* FREE EVENT */}
          <Text style={[styles.inputTitle, {marginTop: 20}]}>
            Is this a free event?{' '}
          </Text>
          {inputValues.freeEvent === 2 && inputValues.error ? (
            <Text
              style={[
                styles.errorText,
                {
                  position: 'relative',
                  right: 15,
                  top: -40,
                  marginBottom: -40,
                },
              ]}>
              {inputValues.error}
            </Text>
          ) : null}
          {/* YES */}
          <View style={styles.boxescontainer}>
            <TouchableOpacity
              style={{alignItems: 'center', marginRight: 20}}
              onPress={() => setInputValues({...inputValues, freeEvent: 1})}>
              <View style={styles.checkbox}>
                {inputValues.freeEvent === 1 && (
                  <Image
                    source={require('../assets/tick.png')}
                    resizeMode="contain"
                    style={{width: 15, height: 15}}
                  />
                )}
              </View>
              <Text style={{color: 'grey'}}>Yes</Text>
            </TouchableOpacity>
            {/* No */}
            <TouchableOpacity
              style={{alignItems: 'center'}}
              disabled={inputValues.freeEvent === 1}
              onPress={() => setInputValues({...inputValues, freeEvent: 0})}>
              <View style={styles.checkbox}>
                {inputValues.freeEvent === 0 && (
                  <Image
                    source={require('../assets/tick.png')}
                    resizeMode="contain"
                    style={{width: 15, height: 15}}
                  />
                )}
              </View>
              <Text style={{color: 'grey'}}>No</Text>
            </TouchableOpacity>
          </View>

          {/* HOST PAY */}
          {inputValues.freeEvent !== 1 && (
            <>
              <Text style={[styles.inputTitle, {marginTop: 20}]}>
                Do Hosts Pay?{' '}
              </Text>
              {inputValues.hostPay === 2 && inputValues.error ? (
                <Text
                  style={[
                    styles.errorText,
                    {
                      position: 'relative',
                      right: 15,
                      top: -40,
                      marginBottom: -40,
                    },
                  ]}>
                  {inputValues.error}
                </Text>
              ) : null}
              {/* YES */}
              <View style={styles.boxescontainer}>
                <TouchableOpacity
                  style={{alignItems: 'center', marginRight: 20}}
                  onPress={() => setInputValues({...inputValues, hostPay: 1})}>
                  <View style={styles.checkbox}>
                    {inputValues.hostPay === 1 && (
                      <Image
                        source={require('../assets/tick.png')}
                        resizeMode="contain"
                        style={{width: 15, height: 15}}
                      />
                    )}
                  </View>
                  <Text style={{color: 'grey'}}>Yes</Text>
                </TouchableOpacity>
                {/* No */}
                <TouchableOpacity
                  style={{alignItems: 'center'}}
                  onPress={() => setInputValues({...inputValues, hostPay: 0})}>
                  <View style={styles.checkbox}>
                    {inputValues.hostPay === 0 && (
                      <Image
                        source={require('../assets/tick.png')}
                        resizeMode="contain"
                        style={{width: 15, height: 15}}
                      />
                    )}
                  </View>
                  <Text style={{color: 'grey'}}>No</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* DATE */}
          <View style={styles.TitleBox}>
            <Text style={styles.inputTitle}>Date </Text>
            {!inputValues.startdate && inputValues.error ? (
              <Text style={styles.errorText}>{inputValues.error}</Text>
            ) : null}
          </View>
          <View style={styles.inputField}>
            <TouchableOpacity
              style={{width: '80%'}}
              onPress={() => showMode('startdate', 'date')}>
              <TextInput
                style={{color: 'black'}}
                placeholder="7/31/2024"
                placeholderTextColor="lightgrey"
                value={
                  inputValues.startdate
                    ? inputValues.startdate.toLocaleDateString()
                    : null
                }
                editable={false}
              />
            </TouchableOpacity>
          </View>

          {inputValues.show && (
            <DateTimePicker
              value={inputValues[inputValues.currentField] || new Date()}
              minimumDate={
                inputValues.currentField === 'startdate'
                  ? new Date()
                  : inputValues.currentField === 'registrationOpens' &&
                    inputValues.announceEvent
                  ? new Date(inputValues.announceEvent)
                  : inputValues.currentField === 'registrationCloses' &&
                    inputValues.registrationOpens
                  ? new Date(inputValues.registrationOpens)
                  : inputValues.currentField === 'refundDeadline'
                  ? new Date(inputValues.registrationCloses)
                  : undefined
              }
              maximumDate={
                inputValues.currentField === 'announceEvent' &&
                inputValues.startdate
                  ? new Date(inputValues.startdate)
                  : inputValues.currentField === 'registrationOpens' &&
                    inputValues.startdate
                  ? new Date(inputValues.startdate)
                  : inputValues.currentField === 'registrationCloses' &&
                    inputValues.startdate
                  ? new Date(inputValues.startdate)
                  : inputValues.currentField === 'refundDeadline' &&
                    inputValues.startdate
                  ? new Date(inputValues.startdate)
                  : undefined
              }
              mode={inputValues.mode}
              is24Hour={false}
              display="default"
              onChange={PickerOnChange}
            />
          )}

          {/* START TIME */}
          <Text style={[styles.inputTitle, {marginTop: 20}]}>Start Time: </Text>
          <View style={styles.inputField}>
            <TouchableOpacity
              style={{width: '80%'}}
              onPress={() => handleFieldPress('startTime', 'time')}>
              <TextInput
                style={{color: 'black'}}
                placeholder="5:00pm"
                placeholderTextColor="lightgrey"
                value={
                  inputValues.startTime
                    ? inputValues.startTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })
                    : null
                }
                editable={false}
              />
            </TouchableOpacity>
            {!inputValues.startTime && inputValues.error ? (
              <Text style={styles.errorText}>{inputValues.error}</Text>
            ) : null}
          </View>

          {/* END TIME */}
          <Text style={[styles.inputTitle, {marginTop: 20}]}>End Time: </Text>
          <View style={styles.inputField}>
            <TouchableOpacity
              style={{width: '80%'}}
              onPress={() => handleFieldPress('endTime', 'time')}>
              <TextInput
                style={{color: 'black'}}
                placeholder="7:00pm"
                placeholderTextColor="lightgrey"
                value={
                  inputValues.endTime
                    ? inputValues.endTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })
                    : null
                }
                editable={false}
              />
            </TouchableOpacity>
            {!inputValues.endTime && inputValues.error ? (
              <Text style={styles.errorText}>{inputValues.error}</Text>
            ) : null}
          </View>

          {/* EVENT LOCATION */}
          <View style={styles.TitleBox}>
            <Text style={styles.inputTitle}>Location: </Text>
            {inputValues.location.length === 0 && inputValues.error ? (
              <Text style={styles.errorText}>{inputValues.error}</Text>
            ) : null}
          </View>
          <View style={[styles.inputField, {height: 'auto'}]}>
            <TextInput
              style={{width: '100%', color: 'black', marginRight: 5}}
              placeholder="Enter Here"
              placeholderTextColor="lightgrey"
              multiline={true}
              value={inputValues.location}
              onChangeText={text =>
                setInputValues({...inputValues, location: text})
              }
            />
          </View>

          {/* ENTRY FEES*/}
          {inputValues.freeEvent !== 1 && (
            <>
              <Text style={[styles.inputTitle, {marginTop: 20}]}>
                Entry Fees:{' '}
              </Text>
              <View style={styles.inputField}>
                <TextInput
                  style={{width: '80%', color: 'black'}}
                  placeholder="Enter Here"
                  placeholderTextColor="lightgrey"
                  value={String(inputValues.entryFees)}
                  keyboardType="numeric"
                  onChangeText={text =>
                    setInputValues({...inputValues, entryFees: text})
                  }
                />
              </View>
            </>
          )}

          {/* OMG FEES*/}
          {inputValues.freeEvent !== 1 && (
            <>
              <Text style={[styles.inputTitle, {marginTop: 20}]}>
                OMG Fees:{' '}
              </Text>
              <View style={[styles.inputField, {backgroundColor: '#e0e0e0'}]}>
                <TextInput
                  style={{width: '80%', color: 'grey'}}
                  placeholder="Enter Here"
                  placeholderTextColor="lightgrey"
                  value={`$${inputValues.commission}`}
                  editable={false}
                  onChangeText={text =>
                    setInputValues({...inputValues, omgFees: text})
                  }
                />
              </View>
            </>
          )}

          {/* TOTAL EVENT COST*/}
          {inputValues.freeEvent !== 1 && (
            <>
              <Text style={[styles.inputTitle, {marginTop: 20}]}>
                Total Event Cost:{' '}
              </Text>
              <View style={[styles.inputField, {backgroundColor: '#e0e0e0'}]}>
                <TextInput
                  style={{width: '80%', color: 'grey'}}
                  placeholder="Enter Here"
                  placeholderTextColor="lightgrey"
                  keyboardType="numeric"
                  value={`$${inputValues.totalEventCost}`}
                  editable={false}
                />
              </View>
            </>
          )}

          {/* ANNOUNCE EVENT*/}
          <View style={[styles.TitleBox, {justifyContent: 'space-between'}]}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.inputTitle}>Announce Event: </Text>
              {!inputValues.announceEvent && inputValues.error ? (
                <Text style={styles.errorText}>{inputValues.error}</Text>
              ) : null}
            </View>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                style={{padding: 5}}
                onPress={() => {
                  if (inputValues.announceEvent) {
                    handleFieldPress(
                      'announceEvent',
                      'time',
                      'announceEventTime',
                    );
                  } else {
                    ToastAndroid.show(
                      'Select Announce event date first',
                      ToastAndroid.SHORT,
                    );
                  }
                }}>
                <Icon2 name="time-outline" size={15} color={'grey'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{padding: 5}}
                onPress={() => {
                  if (!inputValues.startdate) {
                    ToastAndroid.show(
                      'Select Start Date first',
                      ToastAndroid.SHORT,
                    );
                  } else {
                    handleFieldPress('announceEvent', 'date');
                  }
                }}>
                <Icon2 name="calendar-outline" size={15} color={'grey'} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.inputField]}>
            <TextInput
              style={{color: 'black'}}
              placeholder="Set Date & Time"
              placeholderTextColor="lightgrey"
              value={calculatedDifference}
              editable={false}
            />
          </View>

          {/* CONTACT MEMBERS */}
          <Text style={[styles.inputTitle, {marginTop: 20}]}>
            Contact Members{' '}
          </Text>
          <View style={styles.boxescontainer}>
            {/* Email Option */}
            <TouchableOpacity
              style={{alignItems: 'center', marginRight: 20}}
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
                {inputValues.contactMembers.includes('email') && (
                  <Image
                    source={require('../assets/tick.png')}
                    resizeMode="contain"
                    style={{width: 15, height: 15}}
                  />
                )}
              </View>
              <Text style={{color: 'grey'}}>Email</Text>
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
                {inputValues.contactMembers.includes('sms') && (
                  <Image
                    source={require('../assets/tick.png')}
                    resizeMode="contain"
                    style={{width: 15, height: 15}}
                  />
                )}
              </View>
              <Text style={{color: 'grey'}}>Text Message</Text>
            </TouchableOpacity>
          </View>

          {/* REGISTRATION OPENS */}
          <View style={[styles.TitleBox, {justifyContent: 'space-between'}]}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.inputTitle}>Registration Opens: </Text>
              {!inputValues.registrationOpens && inputValues.error ? (
                <Text style={styles.errorText}>{inputValues.error}</Text>
              ) : null}
            </View>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                style={{padding: 5}}
                onPress={() => {
                  if (inputValues.registrationOpens) {
                    handleFieldPress(
                      'registrationOpens',
                      'time',
                      'registrationOpensTime',
                    );
                  } else {
                    ToastAndroid.show(
                      'Select Registration open date first',
                      ToastAndroid.SHORT,
                    );
                  }
                }}>
                <Icon2 name="time-outline" size={15} color={'grey'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{padding: 5}}
                onPress={() => {
                  if (!inputValues.startdate) {
                    ToastAndroid.show(
                      'Select Start Date first',
                      ToastAndroid.SHORT,
                    );
                  } else {
                    handleFieldPress('registrationOpens', 'date');
                  }
                }}>
                <Icon2 name="calendar-outline" size={15} color={'grey'} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.inputField]}>
            <View style={{flexDirection: 'row'}}>
              <TextInput
                style={{color: 'black'}}
                placeholder="Set Date"
                placeholderTextColor="lightgrey"
                value={calculatedDifferenceRegistration}
                editable={false}
              />
            </View>
          </View>

          {/* REGISTRATION CLOSES AND CHARGES PROCESSED */}
          <View style={[styles.TitleBox, {justifyContent: 'space-between'}]}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.inputTitle}>
                Registration Closes &{'\n'}Charges Processed:
              </Text>
              {!inputValues.registrationCloses && inputValues.error ? (
                <Text style={styles.errorText}>{inputValues.error}</Text>
              ) : null}
            </View>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                style={{padding: 5}}
                onPress={() => {
                  if (inputValues.registrationCloses) {
                    handleFieldPress(
                      'registrationCloses',
                      'time',
                      'registrationClosesTime',
                    );
                  } else {
                    ToastAndroid.show(
                      'Select Registration close date first',
                      ToastAndroid.SHORT,
                    );
                  }
                }}>
                <Icon2 name="time-outline" size={15} color={'grey'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{padding: 5}}
                onPress={() => {
                  if (!inputValues.startdate) {
                    ToastAndroid.show(
                      'Select Start Date first',
                      ToastAndroid.SHORT,
                    );
                  } else {
                    handleFieldPress('registrationCloses', 'date');
                  }
                }}>
                <Icon2 name="calendar-outline" size={15} color={'grey'} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.inputField]}>
            <View style={{flexDirection: 'row'}}>
              <TextInput
                style={{color: 'black'}}
                placeholder="Set Date"
                placeholderTextColor="lightgrey"
                value={calculatedDifferenceRegistrationClose}
                editable={false}
              />
            </View>
          </View>

          {/* REFUND Deadline */}
          {inputValues.freeEvent !== 1 && (
            <>
              <View
                style={[styles.TitleBox, {justifyContent: 'space-between'}]}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.inputTitle}>Refund Deadline: </Text>
                  {!inputValues.registrationOpens && inputValues.error ? (
                    <Text style={styles.errorText}>{inputValues.error}</Text>
                  ) : null}
                </View>
                <View style={{flexDirection: 'row'}}>
                  <TouchableOpacity
                    style={{padding: 5}}
                    onPress={() => {
                      if (inputValues.refundDeadline) {
                        handleFieldPress(
                          'refundDeadline',
                          'time',
                          'refundDeadlineTime',
                        );
                      } else {
                        ToastAndroid.show(
                          'Select Refund deadline date first',
                          ToastAndroid.SHORT,
                        );
                      }
                    }}>
                    <Icon2 name="time-outline" size={15} color={'grey'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{padding: 5}}
                    onPress={() => {
                      if (!inputValues.startdate) {
                        ToastAndroid.show(
                          'Select Start Date first',
                          ToastAndroid.SHORT,
                        );
                      } else {
                        handleFieldPress('refundDeadline', 'date');
                      }
                    }}>
                    <Icon2 name="calendar-outline" size={15} color={'grey'} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.inputField]}>
                <TextInput
                  style={{color: 'black'}}
                  placeholder="Set Date & Time"
                  placeholderTextColor="lightgrey"
                  value={calculatedDifferenceRefund}
                  editable={false}
                />
              </View>
            </>
          )}

          {/* REFUND Processing Fee */}
          {inputValues.freeEvent !== 1 && (
            <>
              <Text style={[styles.inputTitle, {marginTop: 20}]}>
                Refund Processing Fee?:{' '}
              </Text>
              <View style={styles.inputField}>
                <TextInput
                  style={{width: '80%', color: 'black'}}
                  placeholder="Enter Here"
                  placeholderTextColor="lightgrey"
                  keyboardType="numeric"
                  value={inputValues.refundProcessingFee}
                  onChangeText={text =>
                    setInputValues({
                      ...inputValues,
                      refundProcessingFee: text,
                    })
                  }
                />
              </View>
            </>
          )}

          {/* REFUND AMOUNT */}
          {inputValues.freeEvent !== 1 && (
            <>
              <Text style={[styles.inputTitle, {marginTop: 20}]}>
                Refund Amount:{' '}
              </Text>
              <View style={styles.inputField}>
                <TextInput
                  style={{width: '80%', color: 'black'}}
                  placeholder="Enter Here"
                  placeholderTextColor="lightgrey"
                  editable={false}
                  value={inputValues.refundAmount}
                />
              </View>
            </>
          )}

          {/* REFUND Policy */}
          {inputValues.freeEvent !== 1 && (
            <>
              <Text style={[styles.inputTitle, {marginTop: 20}]}>
                Refund Policy:{' '}
              </Text>
              <View
                style={[
                  styles.inputField,
                  {backgroundColor: '#e0e0e0', height: 'auto'},
                ]}>
                <Text style={{color: 'black', marginVertical: 5}}>
                  {inputValues.refundPolicy}
                </Text>
              </View>
            </>
          )}

          {/* ATTENDANCE LIMIT */}
          <View style={styles.TitleBox}>
            <Text style={styles.inputTitle}>Attendance Limit: </Text>
            {!inputValues.attendanceLimit && inputValues.error ? (
              <Text style={styles.errorText}>{inputValues.error}</Text>
            ) : null}
          </View>
          <View style={styles.inputField}>
            <TextInput
              style={{width: '80%', color: 'black'}}
              placeholder="Enter Here"
              placeholderTextColor="lightgrey"
              keyboardType="numeric"
              value={inputValues.attendanceLimit.toString()}
              onChangeText={text =>
                setInputValues({...inputValues, attendanceLimit: text})
              }
            />
          </View>

          {/* INCLUDE HOSTS */}
          <Text style={[styles.inputTitle, {marginTop: 20}]}>
            Include Hosts in this limit?{' '}
          </Text>
          {inputValues.includeHosts === 2 && inputValues.error ? (
            <Text
              style={[
                styles.errorText,
                {position: 'relative', marginBottom: -35, top: -39, left: 80},
              ]}>
              {inputValues.error}
            </Text>
          ) : null}
          {/* YES */}
          <View style={styles.boxescontainer}>
            <TouchableOpacity
              style={{alignItems: 'center', marginRight: 20}}
              onPress={() => setInputValues({...inputValues, includeHosts: 1})}>
              <View style={styles.checkbox}>
                {inputValues.includeHosts === 1 && (
                  <Image
                    source={require('../assets/tick.png')}
                    resizeMode="contain"
                    style={{width: 15, height: 15}}
                  />
                )}
              </View>
              <Text style={{color: 'grey'}}>Yes</Text>
            </TouchableOpacity>
            {/* No */}
            <TouchableOpacity
              style={{alignItems: 'center'}}
              onPress={() => setInputValues({...inputValues, includeHosts: 0})}>
              <View style={styles.checkbox}>
                {inputValues.includeHosts === 0 && (
                  <Image
                    source={require('../assets/tick.png')}
                    resizeMode="contain"
                    style={{width: 15, height: 15}}
                  />
                )}
              </View>
              <Text style={{color: 'grey'}}>No</Text>
            </TouchableOpacity>
          </View>

          {/* EVENT POLICY */}
          <Text style={[styles.inputTitle, {marginTop: 20}]}>
            Minimum Participants:{' '}
          </Text>
          <View style={styles.inputField}>
            <TextInput
              style={{width: '80%', color: 'black'}}
              placeholder="Enter Here"
              placeholderTextColor="lightgrey"
              keyboardType="numeric"
              value={inputValues.minparticipant.toString()}
              onChangeText={text =>
                setInputValues({...inputValues, minparticipant: text})
              }
            />
          </View>

          <View>
            <Text style={[styles.inputTitle, {marginTop: 20}]}>
              # Guests Allowed:{' '}
            </Text>
            <View style={styles.inputField}>
              <TextInput
                style={{width: '80%', color: 'black'}}
                placeholder="Number of guests allowed"
                placeholderTextColor="lightgrey"
                keyboardType="numeric"
                value={inputValues.GuestAllowed.toString()}
                onChangeText={text =>
                  setInputValues({...inputValues, GuestAllowed: text})
                }
              />
            </View>
          </View>

          {/* SHOW ATTENDEES */}
          <Text style={[styles.inputTitle, {marginTop: 20}]}>
            Show Attendees:{' '}
          </Text>
          {inputValues.showAttendees === 2 && inputValues.error ? (
            <Text
              style={[
                styles.errorText,
                {position: 'relative', marginTop: -22},
              ]}>
              {inputValues.error}
            </Text>
          ) : null}
          {/* YES */}
          <View style={styles.boxescontainer}>
            <TouchableOpacity
              style={{alignItems: 'center', marginRight: 20}}
              onPress={() =>
                setInputValues({...inputValues, showAttendees: 1})
              }>
              <View style={styles.checkbox}>
                {inputValues.showAttendees === 1 && (
                  <Image
                    source={require('../assets/tick.png')}
                    resizeMode="contain"
                    style={{width: 15, height: 15}}
                  />
                )}
              </View>
              <Text style={{color: 'grey'}}>Yes</Text>
            </TouchableOpacity>
            {/* No */}
            <TouchableOpacity
              style={{alignItems: 'center'}}
              onPress={() =>
                setInputValues({...inputValues, showAttendees: 0})
              }>
              <View style={styles.checkbox}>
                {inputValues.showAttendees === 0 && (
                  <Image
                    source={require('../assets/tick.png')}
                    resizeMode="contain"
                    style={{width: 15, height: 15}}
                  />
                )}
              </View>
              <Text style={{color: 'grey'}}>No</Text>
            </TouchableOpacity>
          </View>

          {/* REPEAT */}
          <View style={[styles.repeatContainer, {backgroundColor: '#e0e0e0'}]}>
            <Text style={styles.RepeatTitle}>Repeat?: </Text>
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

          {/* Event Notes */}
          <Text style={[styles.inputTitle, {marginTop: 20}]}>
            Note Instructions:{' '}
          </Text>
          <View style={[styles.inputField, {height: 100}]}>
            <TextInput
              style={{
                width: '100%',
                color: 'black',
                height: 100,
                textAlign: 'auto',
              }}
              placeholder="Type Here"
              placeholderTextColor="lightgrey"
              value={inputValues.notes}
              multiline={true}
              numberOfLines={4}
              maxLength={150}
              onChangeText={text =>
                setInputValues({...inputValues, notes: text})
              }
            />
          </View>

          {inputValues.error2 ? (
            <Text style={styles.errorText}>{inputValues.error2}</Text>
          ) : null}

          {/* BUTTON */}
          <TouchableOpacity
            style={styles.button}
            onPress={inputValues.loading ? null : submitData}>
            {inputValues.loading ? (
              <ActivityIndicator color="white" size={43} />
            ) : (
              <Text style={styles.buttonText}>Edit My Event</Text>
            )}
          </TouchableOpacity>

          <Modal transparent={true} visible={pickerFlag}>
            <View style={styles.overlay}>
              <View style={styles.modal}>
                <Text style={styles.modaltitle}>Event photo</Text>

                <View style={styles.modalbuttoncontainer}>
                  <View style={{alignItems: 'center'}}>
                    <TouchableOpacity
                      onPress={takePhoto}
                      style={styles.modalicons}>
                      <Icon2 name="camera" color={otherTextColor} size={30} />
                    </TouchableOpacity>
                    <Text style={{color: 'black'}}>Camera</Text>
                  </View>

                  <View style={{alignItems: 'center'}}>
                    <TouchableOpacity
                      onPress={pickImage}
                      style={styles.modalicons}>
                      <Icon2 name="image" color={otherTextColor} size={30} />
                    </TouchableOpacity>
                    <Text style={{color: 'black'}}>Gallery</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setPickerFlag(false)}>
                  <Text style={{color: 'black', fontSize: 20}}>✖</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </ScrollView>

      {/* Message Modal */}
      <MessageModal
        visible={messageModalVisible}
        title="Message"
        message="Event updated successfully"
        onClose={() => {
          setMessageModalVisible(false), navigation.goBack();
        }}
        IconName={'checkmark-circle-outline'}
        iconColor="#4CAF50"
      />
    </SafeAreaView>
  );
};

export default EditEvent;

const styles = StyleSheet.create({
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
  eventTitle: {
    textAlign: 'center',
    color: 'black',
    marginTop: 10,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: buttonTextSize,
    padding: 10,
    color: button1TextColor,
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  },
  imageuploaded: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
  },
  inputTitle: {
    fontSize: InputTitleSize,
    color: 'black',
    marginBottom: 2,
  },
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
  totalHostText: {
    color: 'black',
  },

  errorText: {
    color: 'red',
    alignSelf: 'center',
    marginTop: 15,
    marginRight: 20,
  },

  remember: {
    backgroundColor: '#09CA67',
    borderRadius: 3,
    width: 18,
    height: 18,
  },
  remember2: {
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'black',
    width: 18,
    height: 18,
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
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 5,
  },
  keywordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    padding: 5,
    height: 35,
    margin: 5,
  },
  keywordText: {
    color: 'black',
    marginRight: 5,
  },
  textInput: {
    flex: 1,
    color: 'black',
  },
  TimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -20,
  },
  dateText: {
    color: otherTextColor,
    marginTop: 8,
  },
  dropdown: {
    marginTop: 10,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 15,
    borderColor: InputBorderColor,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
  },
  textItem: {
    flex: 1,
    color: 'black',
    fontSize: 16,
  },
  TitleBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 20,
    color: 'black',
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
    fontSize: 12,
    fontWeight: 'bold',
    color: 'red',
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 150,
    backgroundColor: 'lightgrey',
    justifyContent: 'center',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: -5,
    right: 10,
    backgroundColor: 'transparent',
    padding: 10,
  },
  modaltitle: {
    alignSelf: 'center',
    fontSize: 20,
    position: 'relative',
    top: -15,
    fontWeight: '500',
    color: 'black',
  },
  modalbuttoncontainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalicons: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'grey',
  },
  inputSearchStyle: {
    color: 'black',
  },
});
