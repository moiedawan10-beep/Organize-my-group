import {
  Dimensions,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Text,
  FlatList,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  KeyboardAvoidingView,
  Alert,
  TextInput,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import DashboardHeader2 from '../components/DashboardHeader2';
import {
  button1backgroundColor,
  button1TextColor,
  buttonTextSize,
  card1Color,
  EventDetailTextSize,
  headerTitleColor,
  InputBorderColor,
  InputTitleSize,
  otherTextColor,
  PageTitleColor,
} from '../resources/styling';
import {useDispatch, useSelector} from 'react-redux';
import {GroupDetailsAction} from '../redux/slices/GroupDetailsSlice';
import {JoinGroupAction} from '../redux/slices/JoinGroupSlice';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {JoinPrivateGroupAction} from '../redux/slices/JoinPrivateGroupSlice';
import {AllMembersAction} from '../redux/slices/AllmembersSlice';
import {GroupRequestsRejectionAction} from '../redux/slices/DeclineMembershipSlice';
import {DeleteGroupAction} from '../redux/slices/DeleteGroupSlice';
import {LeaveGroupAction} from '../redux/slices/LeaveGroupSlice';
import {GroupJoiningRequestsAction} from '../redux/slices/GroupJoiningRequestsSlice';
import {GroupRequestsApprovalAction} from '../redux/slices/GroupRequestApprovalSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {WebView} from 'react-native-webview';
import CustomAlertModal from '../components/CustomAlertModal';
import Theme from '../constants/Theme';
import ImageModal from '../components/ImageModal';
import MessageModal from '../components/MessageModal';
import {HostSelectionAction} from '../redux/slices/HostSelectionSlice';
import {ContactMembersAction} from '../redux/slices/ContactMembersSlice';
import {transferGroupOwnershipAction} from '../redux/slices/TransferGroupOwnership';
import {cancelGroupOwnershipAction} from '../redux/slices/CancelGroupOwnershipSlice';
import {userInfo} from '../redux/slices/userInfoSlice';
import AuthorizePayment from '../components/AuthorizePayment';
import FastImage from 'react-native-fast-image';
import {TextInput as PaperInput} from 'react-native-paper';
import {SiteCommissionAction} from '../redux/slices/SiteComissionSlice';
import {useFocusEffect} from '@react-navigation/native';

const {height} = Dimensions.get('window');

const defaultImage =
  'http://app.organizemygroup.com/default/img/nophoto_user_main.png';

const GroupDetails = ({route, navigation}) => {
  const dispatch = useDispatch();
  const [allMemberFlag, setAllMembersFlag] = useState(false);
  const [ownershipFlag, setOwnershipFlag] = useState(false);
  const [pendingRequestsFlag, setPendingRequestsFlag] = useState(false);
  const [groupDeleteFlag, setGroupDeleteFlag] = useState(false);
  const [password, setPassword] = useState('');
  const {id, isNew, isUpdated} = route.params;
  const {details, loading} = useSelector(state => state.groupDetail);
  const {allmembers, loading2} = useSelector(state => state.AllMembers);
  const {settingData} = useSelector(state => state.siteCommission);
  const [hosts, setHosts] = useState([]);
  const {requests, message} = useSelector(state => state.groupJoiningRequests);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showWebView, setShowWebView] = useState(false);
  const [requestData, setRequestData] = useState();
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [stripLoading, setStripLoading] = useState(false);
  const [memberIdToDelete, setMemberIdToDelete] = useState(null);
  const [isRemoveMemberAlertVisible, setIsRemoveMemberAlertVisible] =
    useState(false);
  const [stripeConnectUrl, setStripeConnectUrl] = useState('');
  const [imageFullScreen, setImageFullScreen] = useState(false);
  const [isConfirm, setIsConfirmModal] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [hostsFlag, setHostsFlag] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [contactModelVisible, setContactModelVisible] = useState(false);
  const [responseMessgae, setResponseMessgae] = useState('');
  const [modalTitle, setModalTitle] = useState('Message');
  const [modalIcon, setModalIcon] = useState('notifications');
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [iconColor, setIconColor] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [subject, setSubject] = useState('');
  const [inputValues, setInputValues] = useState({
    contactMembers: [],
  });
  const [fundModelVisible, setFundModelVisible] = useState(false);
  const [userData, setUserData] = useState();
  const [joinRequestFlag, setJoinRequestFlag] = useState(false);
  const [groupOwnershipLoader, setGroupOwnershipLoader] = useState(null);
  //PAGINATION STATES
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMoreMembers, setHasMoreMembers] = useState(true);
  const [membersData, setMembersData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loader, setLoader] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [state, setState] = useState({
    group: null,
    loading: false,
    stripeConnectModal: false,
    stripeConnectUrl: '',
  });

  const code = details?.body?.code;
  const siteSmsRate = settingData?.siteSmsRate;
  const siteEmailRate = settingData?.siteEmailRate * 10;

  useFocusEffect(
    React.useCallback(() => {
      dispatch(SiteCommissionAction());
    }, [dispatch]),
  );

  const toggleOption = option => {
    setInputValues(prevState => {
      const updatedContactMembers = prevState.contactMembers.includes(option)
        ? prevState.contactMembers.filter(member => member !== option)
        : [...prevState.contactMembers, option];
      return {...prevState, contactMembers: updatedContactMembers};
    });
  };

  const handleContactMemberConfirmButton = async () => {
    if (inputValues.contactMembers.length === 0) {
      setErrorMessage(
        'Please select at least one contact method (Email or Message).',
      );
      return;
    }
    if (inputValues.contactMembers.includes('email') && !subject.trim()) {
      setErrorMessage('Please enter a subject.');
      return;
    }
    if (!bodyText.trim()) {
      setErrorMessage('Please enter the body text.');
      return;
    }
    if (inputValues.contactMembers.includes('sms') && bodyText.length > 160) {
      setErrorMessage(
        'Please limit the message body to a maximum of 160 characters.',
      );
      return;
    }
    setErrorMessage('');
    const data = {
      id: id,
      contact_via: inputValues.contactMembers.join(','),
      subject: inputValues.contactMembers.includes('email') ? subject : '',
      message: bodyText,
    };
    setDeleteLoading(true);
    try {
      const response = await dispatch(ContactMembersAction({data}));
      if (ContactMembersAction.rejected.match(response)) {
        const errorMessage =
          response?.payload?.body?.message || 'Something went wrong';
        setErrorMessage(errorMessage);
      } else {
        dispatch(GroupDetailsAction(id));
        setInputValues(prev => ({...prev, contactMembers: []}));
        setContactModelVisible(false);
        setBodyText('');
        setSubject('');
      }
    } catch (error) {
      console.log(error, 'message');
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    if (membersData && Array.isArray(membersData)) {
      const hostIds = membersData
        .filter(member => member?.member_type === 'host' && member?.id)
        .map(member => member.id);
      setHosts(hostIds);
    }
  }, [membersData]);

  useEffect(() => {
    fetchUserInfo();
  }, [navigation, dispatch]);

  const fetchUserInfo = async () => {
    try {
      const response = await dispatch(userInfo({navigation}));
      setUserData(response?.payload?.body);
    } catch (error) {
      console.log('Error fetching user data:', error);
    }
  };

  const showModal = (title, message, iconName, isConfirm, iconColorProps) => {
    setModalTitle(title);
    setResponseMessgae(message);
    setModalVisible(true);
    setModalIcon(iconName);
    setIconColor(iconColorProps);
    if (isConfirm) {
      setIsConfirmModal(true);
    } else {
      setIsConfirmModal(false);
    }
  };

  const handleModalConfirm = () => {
    dispatch(GroupDetailsAction(id));
    setModalVisible(false);
  };

  const handleOkayPress = () => {
    if (shouldNavigate) {
      navigation.navigate('MyGroups');
    }
    setModalVisible(false);
    setShouldNavigate(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(GroupDetailsAction(id));
    });
    return unsubscribe;
  }, [id, navigation, state.stripeConnectModal]);

  const loadMoreMembers = async () => {
    if (!isFetchingMore && hasMoreMembers) {
      setIsFetchingMore(true);
      setLoader(true);
      const nextPage = currentPage + 1;
      const response = await dispatch(AllMembersAction({id, nextPage}));
      if (response?.payload?.response?.length > 0) {
        setMembersData(prev => [...prev, ...response?.payload?.response]);
        setCurrentPage(nextPage);
      } else {
        setHasMoreMembers(false);
      }
      setIsFetchingMore(false);
      setLoader(false);
    }
  };

  const JoiningRequests = async () => {
    try {
      const requestData = await dispatch(GroupJoiningRequestsAction(id));
      setRequestData(requestData?.payload);
    } catch (error) {
      console.error('Error fetching joining requests', error);
      Alert.alert('Error', 'Failed to fetch pending requests');
    }
  };

  const submitJoinRequest = async () => {
    setJoinRequestFlag(true);
    if (details?.body?.privacy === 'public') {
      const payload = {id, code};
      const response = await dispatch(JoinGroupAction(payload));
      const payloadData = response.payload;
      showModal(
        'Message',
        payloadData,
        'checkmark-circle-outline',
        false,
        '#4CAF50',
      );
      dispatch(GroupDetailsAction(id));
    } else if (details?.body?.privacy === 'private') {
      if (!code) {
        Alert.alert('Error', 'No code Available');
      }
      const payload = {id, code};
      const response = await dispatch(JoinPrivateGroupAction(payload));
      dispatch(GroupDetailsAction(id));
      showModal(
        'Message',
        response?.payload,
        'checkmark-circle-outline',
        false,
        '#4CAF50',
      );
      setResponseMessgae(response?.payload);
    }
    setJoinRequestFlag(false);
  };

  useEffect(() => {
    dispatch(GroupJoiningRequestsAction(id));
  }, [dispatch]);

  const seeMembers = async () => {
    loadMoreMembers();
  };

  useEffect(() => {
    seeMembers();
  }, []);

  const handleSeeMembersModalCloseButton = () => {
    setHostsFlag(false);
    setIsFetchingMore(false);
    setHasMoreMembers(true);
    setMembersData([]);
    setCurrentPage(0);
    setAllMembersFlag(false);
    setOwnershipFlag(false);
  };

  const UpcomingEventsData = async () => {
    navigation.navigate('Upcoming Events', {groupId: id ? id : null});
  };

  const DeclineRequest = async user_id => {
    const response = await dispatch(
      GroupRequestsRejectionAction({id, user_id}),
    );
    if (response?.payload?.message === 'Declined user membership') {
      const members = membersData.filter(user => user.id !== user_id);
      setMembersData(members);
      JoiningRequests();
      loadMoreMembers();
      setIsRemoveMemberAlertVisible(false);
      dispatch(GroupDetailsAction(id));
    }
  };

  const SubmitDeleteRequest = async () => {
    if (!password) {
      setErrorMessage('Please Provide Password');
      return;
    }
    if (password.length > 0) {
      setDeleteLoading(true);
      const response = await dispatch(DeleteGroupAction({id, password}));
      if (response?.payload != undefined) {
        setDeleteLoading(false);
        setShouldNavigate(true);
        showModal('Message', response?.payload?.message, 'trash', false, 'red');
        setGroupDeleteFlag(false);
        setPassword('');
      } else {
        setShouldNavigate(false);
        setErrorMessage('Incorrect Password');
        setDeleteLoading(false);
      }
    }
  };

  const SubmitLeaveRequest = async () => {
    setJoinRequestFlag(true);
    const response = await dispatch(LeaveGroupAction(id));
    if (response?.payload != undefined) {
      setIsAlertVisible(false);
      dispatch(GroupDetailsAction(id));
      loadMoreMembers();
      onRefresh();
    } else {
      Alert.alert('API Error occured');
    }
    setJoinRequestFlag(false);
  };

  const ApproveRequest = async user_id => {
    const response = await dispatch(GroupRequestsApprovalAction({id, user_id}));
    if (response?.payload?.message) {
      setPendingRequestsFlag(false);
      showModal(
        'Approval Status',
        'Request ' + response?.payload?.message,
        'checkmark-circle-outline',
        false,
        '#4CAF50',
      );
      loadMoreMembers();
      JoiningRequests();
      onRefresh();
    } else {
      Alert.alert('Error', 'Unknown error Occured');
    }
  };

  const onStripeConnect = async () => {
    await AsyncStorage.setItem('stripe_connect', String(1));
    await AsyncStorage.setItem('resource_type', 'group');
    await AsyncStorage.setItem('resource_id', String(id));
    const stripeConnectUrl = `https://dev.organizemygroup.com/api/stripe/connect`;
    setState({...state, stripeConnectUrl, stripeConnectModal: true});
  };

  const getAccessToken = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      return accessToken;
    } catch (error) {
      console.error('Error retrieving access token from AsyncStorage:', error);
      throw error;
    }
  };

  const handleWebViewNavigationStateChange = async state => {
    const accessToken = await getAccessToken();
    const {url} = state;
    if (url.includes('code=')) {
      const code = url.split('code=')[1];
      setState({...state, stripeConnectUrl, stripeConnectModal: false});
      setStripLoading(true);
      try {
        const response = await fetch(
          'https://dev.organizemygroup.com/api/stripe/connect/return',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              code: code,
              resource_id: id,
              resource_type: 'group',
            }),
          },
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setStripLoading(false);
        showModal(
          'Stripe Connect',
          'Stripe account connected successfully.',
          'checkmark-circle-outline',
          true,
          '#4CAF50',
        );
        setState({...state, stripeConnectUrl, stripeConnectModal: false});
      } catch (error) {
        console.error('Error completing Stripe connect:', error);
        Alert.alert(
          'Error',
          'Failed to connect Stripe account. Please try again.',
        );
        setState({...state, stripeConnectUrl, stripeConnectModal: false});
      } finally {
        setStripLoading(false);
      }
    } else if (url.includes('cancel')) {
      setShowWebView(false);
    }
  };

  const closeStripeConnectModal = () => {
    setState({...state, stripeConnectModal: false});
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(GroupDetailsAction(id));
    dispatch(GroupJoiningRequestsAction(id));
    setTimeout(() => setRefreshing(false), 1500);
  }, [id, dispatch]);

  useEffect(() => {
    if (isNew) {
      Alert.alert(
        'Connect Stripe Account',
        'Do you want to connect your Stripe account?',
        [
          {
            text: 'No',
            onPress: () => console.log('Stripe connection canceled'),
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => {
              onStripeConnect();
            },
          },
        ],
        {cancelable: false},
      );
    }
  }, [isNew]);

  const onSuccess = isAuthorized => {
    if (isAuthorized) {
      Alert.alert(
        'Funds Added',
        'Funds added to your wallet!',
        [
          {
            text: 'OK',
            onPress: () => dispatch(GroupDetailsAction(id)),
          },
        ],
        {cancelable: false},
      );
    } else {
    }
  };

  useEffect(() => {
    if (isUpdated) {
      showModal(
        'Message',
        'Group updated successfully.',
        'checkmark-circle-outline',
        false,
        '#4CAF50',
      );
      navigation.setParams({isUpdated: false});
    }
  }, [isUpdated]);

  const handleCancel = () => {
    setIsAlertVisible(false);
    setIsRemoveMemberAlertVisible(false);
  };

  const handleRemoveClick = memberId => {
    setMemberIdToDelete(memberId);
    setIsRemoveMemberAlertVisible(true);
  };

  const handleUserProfile = id => {
    navigation.navigate('User Profile', {id}), setAllMembersFlag(false);
    setPendingRequestsFlag(false);
  };

  const handleUpdateHost = async () => {
    try {
      const response = await dispatch(
        HostSelectionAction({data: hosts, id: id}),
      );
      setIsFetchingMore(false);
      setHasMoreMembers(true);
      setMembersData([]);
      setCurrentPage(0);
      setHostsFlag(false);
    } catch (error) {
      console.error('Error updating host selection:', error);
    }
  };

  const handleGroupTransfer = async userId => {
    setGroupOwnershipLoader(userId);
    try {
      const payload = {
        user_id: userId,
        group_id: id,
      };
      const response = await dispatch(transferGroupOwnershipAction(payload));
      setIsFetchingMore(false);
      setHasMoreMembers(true);
      setMembersData([]);
      setCurrentPage(0);
      if (
        response.payload.body.message ===
        'Only group owners can transfer group membership.'
      ) {
        Alert.alert('Request Rejected', response.payload.body.message);
      }
    } catch (error) {
      console.error('Error Transferring Group:', error);
    } finally {
      setGroupOwnershipLoader(null);
    }
  };

  const handleTransferOwnershipButton = () => {
    seeMembers(), setAllMembersFlag(true), setOwnershipFlag(true);
  };

  const handleCancelTransfer = async userId => {
    setGroupOwnershipLoader(userId);
    try {
      const payload = {
        user_id: userId,
        group_id: id,
      };

      const response = await dispatch(cancelGroupOwnershipAction(payload));

      setIsFetchingMore(false);
      setHasMoreMembers(true);
      setMembersData([]);
      setCurrentPage(0);
    } catch (error) {
      console.error('Error Transferring Group:', error);
    } finally {
      setGroupOwnershipLoader(null);
    }
  };

  const handleImagePress = () => {
    setImageFullScreen(true);
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <DashboardHeader2 title="Group Details" isBack={true} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <KeyboardAvoidingView style={styles.keyboardView}>
          {loading ? (
            <ActivityIndicator color={otherTextColor} size={50} />
          ) : (
            <View style={styles.container}>
              <TouchableOpacity onPress={handleImagePress}>
                {details?.body?.photo_url_main && (
                  <FastImage
                    source={{
                      uri: details?.body?.photo_url_main,
                      priority: FastImage.priority.normal,
                      cache: FastImage.cacheControl.immutable,
                    }}
                    style={styles.image}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                )}
              </TouchableOpacity>
              <View style={styles.v1}>
                <Text style={[styles.title, {alignSelf: 'center'}]}>
                  {details?.body?.title}
                </Text>
                {!!details?.body?.is_owner && (
                  <View style={styles.v2}>
                    <FontAwesome5 name="crown" size={15} color={'red'} />
                  </View>
                )}
              </View>
              {details?.body?.owner_title && (
                <View style={styles.v1}>
                  <Text style={styles.ownedText}>Owned by: </Text>
                  <TouchableOpacity
                    onPress={() => handleUserProfile(details?.body?.owner_id)}>
                    <Text style={{color: otherTextColor}}>
                      {details?.body?.owner_title.length > 25
                        ? details.body.owner_title.slice(0, 25) + '...'
                        : details.body.owner_title}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {details?.body?.description && (
                <Text style={styles.text}>{details?.body?.description}</Text>
              )}
              <TouchableOpacity
                onPress={() => {
                  seeMembers(), setAllMembersFlag(true);
                }}>
                <Text style={styles.seemembertext}>
                  See Members({details?.body?.members_count})
                </Text>
              </TouchableOpacity>
              {details?.body?.is_owner ? (
                <TouchableOpacity
                  onPress={() => {
                    setPendingRequestsFlag(true);
                    JoiningRequests();
                  }}>
                  <Text style={styles.seemembertext}>See Pending Requests</Text>
                </TouchableOpacity>
              ) : null}
              {!details?.body?.is_member && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={submitJoinRequest}
                  disabled={joinRequestFlag}>
                  {joinRequestFlag ? (
                    <ActivityIndicator color="white" size={43} />
                  ) : (
                    <Text style={styles.buttonText}>Join Group</Text>
                  )}
                </TouchableOpacity>
              )}
              {details?.body?.is_owner === false &&
                details?.body?.is_approved === false &&
                details?.body?.is_member === true && (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={SubmitLeaveRequest}
                    disabled={joinRequestFlag}>
                    {joinRequestFlag ? (
                      <ActivityIndicator color="white" size={43} />
                    ) : (
                      <Text style={styles.buttonText}>Cancel Join Request</Text>
                    )}
                  </TouchableOpacity>
                )}
              {/* MESSAGE BOARD */}
              {!!details?.body?.is_approved && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    navigation.navigate('Message Board', {
                      resource_id: details?.body?.id,
                      is_member: details?.body?.is_member || false,
                      allow_notification:
                        details?.body?.user_settings?.allow_notification || 0,
                      allow_user_notification:
                        details?.body?.user_settings?.allow_user_notification ||
                        0,
                      is_Group_Owner: details?.body?.is_admin || false,
                    })
                  }>
                  <Text style={styles.buttonText}>Group Chat</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.button}
                onPress={UpcomingEventsData}>
                <Text style={styles.buttonText}>Upcoming Events</Text>
              </TouchableOpacity>

              <View>
                {/* Contact Members Button - Only visible if the user is an admin */}
                {!!details?.body?.can_create_event && (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => setContactModelVisible(true)}>
                    <Text style={styles.buttonText}>Contact Members</Text>
                  </TouchableOpacity>
                )}

                {/* Edit Group Button - Only visible if the user is an admin */}
                {!!details?.body?.is_admin && (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      if (details?.body) {
                        navigation.navigate('CreateGroup', {
                          data: details.body,
                          isEdit: true,
                          groupId: id,
                        });
                      } else {
                        console.warn('Details body is undefined or null');
                      }
                    }}>
                    <Text style={styles.buttonText}>Edit Group</Text>
                  </TouchableOpacity>
                )}

                {/* Create Event Button - Only visible if the user is an admin */}
                {!!details?.body?.can_create_event && (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      if (!details?.body?.approved) {
                        Alert.alert(
                          'Group Approval',
                          'Group is pending approval, you will be notified once your group has been approved. Please try again later.',
                        );
                      } else {
                        navigation.navigate('Create Event', {
                          groupId: id ? id : null,
                          groupIcon: details?.body?.photo_url_main || '',
                        });
                      }
                    }}>
                    <Text style={styles.buttonText}>Create Event</Text>
                  </TouchableOpacity>
                )}

                {/* Delete Group Button - Only visible if the user is an admin */}
                {!!details?.body?.is_admin && (
                  <>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleTransferOwnershipButton}>
                      <Text style={styles.buttonText}>
                        Transfer Group Ownership
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => setGroupDeleteFlag(true)}>
                      <Text style={styles.buttonText}>Delete Group</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* Leave Group Button - Visible if the user is approved and not an admin */}
                {!!details?.body?.is_approved && !details?.body?.is_admin && (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => setIsAlertVisible(true)}>
                    <Text style={styles.buttonText}>Leave Group</Text>
                  </TouchableOpacity>
                )}
              </View>

              {!!details?.body?.is_owner && (
                <View style={styles.bottombox}>
                  <Text style={{textAlign: 'center'}}>
                    <Text
                      style={[
                        styles.text,
                        {fontWeight: '500', color: 'black'},
                      ]}>
                      Text/Email Balance:
                    </Text>
                    <Text
                      style={[
                        styles.text,
                        {fontWeight: '500', color: PageTitleColor},
                      ]}>
                      {''} ${details?.body?.wallet || '0'}
                    </Text>
                  </Text>
                  <Text style={styles.amountStringText}>
                    When contacting group or event members, you'll be charged{' '}
                    {siteSmsRate} cent per SMS recipient and {siteEmailRate}{' '}
                    cents for every 10 emails sent.
                  </Text>
                  <TouchableOpacity
                    disabled={fundModelVisible}
                    style={[
                      styles.button,
                      {
                        backgroundColor: otherTextColor,
                        marginTop: 15,
                        width: '100%',
                        alignSelf: 'center',
                      },
                    ]}
                    onPress={() => setFundModelVisible(true)}>
                    <Text style={styles.buttonText}>Add Funds</Text>
                  </TouchableOpacity>
                  {!!details?.body?.stripe_connected && (
                    <View style={styles.connectedStripView}>
                      <Text style={styles.connectedStripText}>
                        ✅ You are already connected with your Stripe account.
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.button,
                      {
                        backgroundColor: otherTextColor,
                        marginTop: 15,
                        alignSelf: 'center',
                        width: '100%',
                      },
                    ]}
                    onPress={onStripeConnect}
                    disabled={stripLoading}>
                    {stripLoading ? (
                      <ActivityIndicator color="white" size={43} />
                    ) : (
                      <Text style={styles.buttonText}>
                        {details?.body?.stripe_connected
                          ? 'Change Stripe Account'
                          : 'Connect Stripe'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* pending request modal */}
          <Modal transparent={true} visible={pendingRequestsFlag}>
            <View style={styles.modal}>
              <View style={[styles.view, {width: '90%', height: '60%'}]}>
                <Text
                  style={[
                    styles.text,
                    {
                      fontSize: 18,
                      fontWeight: '500',
                      color: 'black',
                      position: 'absolute',
                      left: 10,
                      top: 10,
                    },
                  ]}>
                  Pending Requests
                </Text>
                {requestData?.response?.length > 0 ? (
                  <FlatList
                    data={requestData?.response}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item, index}) => {
                      return (
                        <TouchableOpacity
                          style={[styles.card, {paddingRight: 10}]}
                          onPress={() => handleUserProfile(item.user_id)}>
                          <View style={{flexDirection: 'row'}}>
                            {item.photo_url_main === defaultImage ? (
                              <View
                                style={{
                                  width: 50,
                                  height: 50,
                                  alignSelf: 'center',
                                  borderRadius: 30,
                                  borderWidth: 1,
                                  borderColor: 'lightgrey',
                                  marginLeft: 12,
                                }}>
                                <Icon
                                  name="user-circle"
                                  size={47}
                                  color={headerTitleColor}
                                  style={{alignSelf: 'center'}}
                                />
                              </View>
                            ) : (
                              <FastImage
                                source={{
                                  uri: item.photo_url_main,
                                  priority: FastImage.priority.normal,
                                  cache: FastImage.cacheControl.immutable,
                                }}
                                style={[
                                  styles.imagestyle,
                                  {backgroundColor: 'lightgrey'},
                                ]}
                                resizeMode={FastImage.resizeMode.cover}
                              />
                            )}
                            <Text
                              style={[
                                styles.text,
                                {
                                  width: '50%',
                                  alignSelf: 'center',
                                  textAlign: 'left',
                                  color: 'black',
                                  fontWeight: '500',
                                  marginLeft: 10,
                                },
                              ]}
                              numberOfLines={1}>
                              {item.title}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.buttoncontainer,
                              {alignItems: 'center'},
                            ]}>
                            <TouchableOpacity
                              style={[
                                styles.pendingmodalbutton,
                                {
                                  backgroundColor: '#E7F4FB',
                                  borderRadius: 20,
                                  height: 30,
                                  width: 30,
                                  right: 6,
                                },
                              ]}
                              onPress={() => ApproveRequest(item.user_id)}>
                              <Icon2
                                name="check"
                                size={20}
                                color={headerTitleColor}
                                style={{alignSelf: 'center'}}
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.pendingmodalbutton,
                                {
                                  backgroundColor: '#F7D0D5',
                                  borderRadius: 20,
                                  height: 30,
                                  width: 30,
                                },
                              ]}
                              onPress={() => DeclineRequest(item.user_id)}>
                              <Icon2
                                name="clear"
                                size={20}
                                color={button1backgroundColor}
                                style={{alignSelf: 'center'}}
                              />
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <Text
                    style={{
                      margin: 20,
                      color: 'red',
                      fontSize: buttonTextSize,
                      textAlign: 'center',
                    }}>
                    {message}
                  </Text>
                )}
                <TouchableOpacity
                  style={[styles.closeButton, {top: 5, right: 10}]}
                  onPress={() => setPendingRequestsFlag(false)}>
                  <Icon2 name="close" size={25} color={'black'} />
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* see member modal */}
          <Modal
            onOrientationChange={'landscape-right'}
            transparent={true}
            visible={allMemberFlag}>
            <View style={styles.modal}>
              <View style={[styles.view, {width: '90%', height: '60%'}]}>
                <Text
                  style={[
                    styles.text,
                    {
                      fontSize: 18,
                      fontWeight: '500',
                      color: 'black',
                      position: 'absolute',
                      left: 10,
                      top: 15,
                    },
                  ]}>
                  {ownershipFlag ? 'Transfer Group Ownership' : 'Group Members'}
                  {/* ({membersData.length}) */}
                </Text>

                {loader && membersData.length === 0 ? (
                  <ActivityIndicator
                    color={otherTextColor}
                    size={50}
                    style={styles.container}
                  />
                ) : membersData ? (
                  <FlatList
                    data={membersData}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item, index}) => (
                      <TouchableOpacity
                        disabled={hostsFlag || ownershipFlag}
                        style={styles.card}
                        onPress={() => handleUserProfile(item.id)}>
                        {/* Checkbox for all members */}
                        {hostsFlag === true && index !== 0 && (
                          <TouchableOpacity
                            style={{alignItems: 'center', alignSelf: 'center'}}
                            onPress={() => {
                              const updatedHosts = hosts.includes(item.id)
                                ? hosts.filter(host => host !== item.id)
                                : [...hosts, item.id];
                              setHosts(updatedHosts);
                            }}>
                            <View style={styles.checkbox}>
                              {hosts.length > 0 && hosts.includes(item.id) ? (
                                <Image
                                  source={require('../assets/tick.png')}
                                  resizeMode="contain"
                                  style={{width: 15, height: 15}}
                                />
                              ) : null}
                            </View>
                          </TouchableOpacity>
                        )}

                        <View style={styles.GroupmemberContainer}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            {/* Member photo */}
                            {item.photo_url_main === defaultImage ? (
                              <View
                                style={{
                                  width: 50,
                                  height: 50,
                                  alignSelf: 'center',
                                  borderRadius: 30,
                                  borderWidth: 1,
                                  borderColor: 'lightgrey',
                                  marginLeft: 12,
                                }}>
                                <Icon
                                  name="user-circle"
                                  size={47}
                                  color={headerTitleColor}
                                  style={{alignSelf: 'center'}}
                                />
                              </View>
                            ) : (
                              <FastImage
                                source={{
                                  uri: item?.photo_url_main,
                                  priority: FastImage.priority.normal,
                                  cache: FastImage.cacheControl.immutable,
                                }}
                                style={[
                                  styles.imagestyle,
                                  {backgroundColor: 'lightgrey'},
                                ]}
                                resizeMode={FastImage.resizeMode.cover}
                              />
                            )}

                            {/* Member name */}

                            <View
                              style={{
                                justifyContent: 'flex-start',
                                marginLeft: 10,
                              }}>
                              <Text
                                style={[
                                  styles.text,
                                  {
                                    fontWeight: '500',
                                    color: 'black',
                                    textAlign: 'left',
                                  },
                                ]}
                                numberOfLines={1}>
                                {item.title.length > 17
                                  ? item.title.slice(0, 17) + '...'
                                  : item.title}
                              </Text>
                              {!!details?.body?.is_owner &&
                                index !== 0 &&
                                ownershipFlag && (
                                  <TouchableOpacity
                                    style={{
                                      padding: 1,
                                    }}
                                    onPress={() =>
                                      item.ownership_request === 0
                                        ? handleGroupTransfer(item.id)
                                        : handleCancelTransfer(item.id)
                                    }
                                    disabled={!!groupOwnershipLoader}>
                                    {groupOwnershipLoader === item.id ? (
                                      <ActivityIndicator
                                        size={20}
                                        color={otherTextColor}
                                      />
                                    ) : (
                                      <Text
                                        style={{
                                          color:
                                            item.ownership_request === 0
                                              ? otherTextColor
                                              : 'red',
                                          textDecorationLine: 'underline',
                                          fontSize: 14,
                                        }}>
                                        {item.ownership_request === 0
                                          ? 'Transfer Group Ownership'
                                          : 'Cancel Invitation'}
                                      </Text>
                                    )}
                                  </TouchableOpacity>
                                )}
                            </View>
                          </View>

                          {/* Remove button for non-owner hosts */}
                          {!!details?.body?.is_owner &&
                          details?.body &&
                          !hostsFlag ? (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 10,
                              }}>
                              {index !== 0 && !ownershipFlag && (
                                <TouchableOpacity
                                  style={[
                                    styles.pendingmodalbutton,
                                    {
                                      right: '3%',
                                    },
                                  ]}
                                  onPress={() => handleRemoveClick(item.id)}>
                                  <AntDesign
                                    name="delete"
                                    size={18}
                                    color={button1backgroundColor}
                                    style={{alignSelf: 'center'}}
                                  />
                                </TouchableOpacity>
                              )}
                              <View style={{alignSelf: 'center'}}>
                                <Text
                                  style={{
                                    color: PageTitleColor,
                                    padding: 8,
                                    fontSize: 13,
                                    borderRadius: 20,
                                    backgroundColor: card1Color,
                                  }}>
                                  {item.member_type === 'admin'
                                    ? 'Owner'
                                    : item.member_type === 'host'
                                    ? 'Host'
                                    : item.member_type === 'member'
                                    ? 'Member'
                                    : null}
                                </Text>
                              </View>
                            </View>
                          ) : (
                            <View
                              style={{alignSelf: 'center', marginRight: 10}}>
                              <Text
                                style={{
                                  color: PageTitleColor,
                                  padding: 8,
                                  fontSize: 13,
                                  borderRadius: 20,
                                  backgroundColor: card1Color,
                                }}>
                                {item.member_type === 'admin'
                                  ? 'Owner'
                                  : item.member_type === 'host'
                                  ? 'Host'
                                  : item.member_type === 'member'
                                  ? 'Member'
                                  : null}
                              </Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}
                    onEndReached={loadMoreMembers}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                      isFetchingMore ? (
                        <ActivityIndicator
                          size="small"
                          color={otherTextColor}
                        />
                      ) : null
                    }
                  />
                ) : (
                  <Text>No members to show</Text>
                )}

                <TouchableOpacity
                  style={[styles.closeButton, {top: 5, right: 10}]}
                  onPress={handleSeeMembersModalCloseButton}>
                  <Icon2 name="close" size={25} color={'black'} />
                </TouchableOpacity>

                {/* Select Host Button */}
                {details?.body?.is_owner === true &&
                membersData.length > 1 &&
                !ownershipFlag ? (
                  hostsFlag ? (
                    <TouchableOpacity
                      style={[
                        styles.button,
                        {
                          width: '75%',
                          alignSelf: 'center',
                          marginVertical: 10,
                          backgroundColor: otherTextColor,
                        },
                      ]}
                      onPress={handleUpdateHost}>
                      <Text style={styles.buttonText}>Update group hosts</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.button,
                        {
                          width: '75%',
                          alignSelf: 'center',
                          marginVertical: 10,
                          backgroundColor: otherTextColor,
                        },
                      ]}
                      onPress={() => setHostsFlag(true)}>
                      <Text style={styles.buttonText}>Edit group hosts</Text>
                    </TouchableOpacity>
                  )
                ) : null}
              </View>
            </View>
          </Modal>

          <Modal
            animationType="fade"
            transparent={true}
            visible={groupDeleteFlag}
            onRequestClose={() => setGroupDeleteFlag(false)}>
            <View style={styles.modalBackground}>
              <View style={styles.modalContent}>
                <Text style={styles.inputTitle}>Confirm Password:</Text>

                <View style={styles.inputField}>
                  {/* <TextInput
                    style={{width: '80%', color: 'black'}}
                    placeholderTextColor="grey"
                    placeholder="Enter Password"
                    secureTextEntry
                    keyboardType="visible-password"
                    value={password}
                    onChangeText={text => {
                      setPassword(text);
                      if (errorMessage) {
                        setErrorMessage('');
                      }
                    }}
                  /> */}
                  <PaperInput
                    mode="outlined"
                    value={password}
                    placeholder="Enter Password..."
                    placeholderTextColor={'grey'}
                    outlineColor="transparent"
                    activeOutlineColor="transparent"
                    onChangeText={text => {
                      setPassword(text);
                      if (errorMessage) {
                        setErrorMessage('');
                      }
                    }}
                    secureTextEntry={!passwordVisible}
                    style={{
                      width: '90%',
                      backgroundColor: 'transparent',
                      bottom: 4,
                      right: 7,
                      fontSize: 14,
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    cursorColor="lightgreen"
                    textColor="black"
                    borderWidth={0}
                    InputBorderColor={'white'}
                  />
                  <TouchableOpacity
                    style={styles.passwordopacity}
                    onPress={() => setPasswordVisible(!passwordVisible)}>
                    {passwordVisible ? (
                      <Icon2 name="visibility" size={19} color="#555" />
                    ) : (
                      <Icon2 name="visibility-off" size={19} color="#555" />
                    )}
                  </TouchableOpacity>
                </View>
                {errorMessage ? (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}
                <View style={styles.deleteGroupModalButtonContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      setGroupDeleteFlag(false), setPassword('');
                      setErrorMessage('');
                    }}
                    style={[
                      styles.button,
                      {
                        marginTop: 10,
                        backgroundColor: Theme.COLORS.OTHER_BACKGROUND_COLOR,
                        width: '49%',
                      },
                    ]}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={SubmitDeleteRequest}
                    style={[
                      styles.button,
                      {
                        marginTop: 10,
                        backgroundColor: Theme.COLORS.BUTTON_1_BACKGROUND,
                        width: '49%',
                      },
                    ]}>
                    {deleteLoading ? (
                      <ActivityIndicator size={20} color={'white'} top={10} />
                    ) : (
                      <Text style={styles.buttonText}>Confirm</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Contact Member Model */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={contactModelVisible}
            onRequestClose={() => setContactModelVisible(false)}>
            <View style={styles.modalBackground}>
              <View style={styles.modalContent}>
                <Text
                  style={[
                    styles.inputTitle,
                    {fontWeight: '500', marginBottom: 10, fontSize: 18},
                  ]}>
                  Contact Members
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingBottom: 10,
                  }}>
                  <Text style={styles.inputTitle}>Contact Via:</Text>
                  <View style={{flexDirection: 'row'}}>
                    {/* Email Option */}
                    <TouchableOpacity
                      style={{
                        alignItems: 'center',
                        marginRight: 20,
                        flexDirection: 'row',
                      }}
                      onPress={() => toggleOption('email')}>
                      <Text style={{color: 'grey'}}>Email</Text>
                      <View style={[styles.checkbox]}>
                        {inputValues.contactMembers.includes('email') && (
                          <Image
                            source={require('../assets/tick.png')}
                            resizeMode="contain"
                            style={{width: 15, height: 15}}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                    {/* Text Message Option */}
                    <TouchableOpacity
                      style={{alignItems: 'center', flexDirection: 'row'}}
                      onPress={() => toggleOption('sms')}>
                      <Text style={{color: 'grey'}}>Text</Text>
                      <View style={styles.checkbox}>
                        {inputValues.contactMembers.includes('sms') && (
                          <Image
                            source={require('../assets/tick.png')}
                            resizeMode="contain"
                            style={{width: 15, height: 15}}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
                {inputValues.contactMembers.includes('email') && (
                  <>
                    <Text style={styles.inputTitle}>Subject:</Text>
                    <TextInput
                      style={{
                        width: '100%',
                        color: 'black',
                        borderWidth: 1,
                        borderColor: 'grey',
                        borderRadius: 10,
                        paddingHorizontal: 10,
                      }}
                      placeholderTextColor="grey"
                      placeholder="Write Subject..."
                      value={subject}
                      onChangeText={setSubject}
                      maxLength={75}
                    />
                    <View style={{flexDirection: 'row-reverse'}}>
                      <Text
                        style={{
                          color: 'grey',
                        }}>{`${subject?.length} / 75`}</Text>
                    </View>
                  </>
                )}

                <Text style={styles.inputTitle}>Body:</Text>
                <TextInput
                  style={{
                    width: '100%',
                    color: 'black',
                    borderWidth: 1,
                    borderColor: 'grey',
                    borderRadius: 10,
                    height: 150,
                    paddingHorizontal: 10,
                    textAlignVertical: 'top',
                  }}
                  placeholderTextColor="grey"
                  placeholder="Write Body..."
                  value={bodyText}
                  returnKeyType="done"
                  onChangeText={setBodyText}
                  maxLength={
                    inputValues.contactMembers.includes('sms') ? 160 : undefined
                  }
                  multiline={true}
                />
                {inputValues.contactMembers.includes('sms') && (
                  <View style={{flexDirection: 'row-reverse'}}>
                    <Text
                      style={{
                        color: 'grey',
                      }}>{`${bodyText?.length} / 160`}</Text>
                  </View>
                )}
                {errorMessage ? (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      setContactModelVisible(false);
                      setBodyText('');
                      setSubject('');
                      setErrorMessage('');
                      setInputValues(prev => ({...prev, contactMembers: []}));
                    }}
                    style={[
                      styles.button,
                      {
                        marginTop: 10,
                        backgroundColor: Theme.COLORS.OTHER_BACKGROUND_COLOR,
                        width: '49%',
                      },
                    ]}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleContactMemberConfirmButton}
                    style={[
                      styles.button,
                      {
                        marginTop: 10,
                        backgroundColor: Theme.COLORS.BUTTON_1_BACKGROUND,
                        width: '49%',
                      },
                    ]}>
                    {deleteLoading ? (
                      <ActivityIndicator size={20} color={'white'} top={8} />
                    ) : (
                      <Text style={styles.buttonText}>Send</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {state.stripeConnectModal && (
            <Modal
              visible={state.stripeConnectModal}
              animationType="slide"
              transparent={true}
              onRequestClose={closeStripeConnectModal}>
              <WebView
                source={{uri: state.stripeConnectUrl}}
                onNavigationStateChange={handleWebViewNavigationStateChange}
              />
              <TouchableOpacity
                onPress={closeStripeConnectModal}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: 10,
                }}>
                <Text style={{fontSize: 10, color: 'white', padding: 5}}>
                  Close
                </Text>
              </TouchableOpacity>
            </Modal>
          )}
        </KeyboardAvoidingView>
      </ScrollView>
      <CustomAlertModal
        visible={isAlertVisible}
        onClose={() => setIsAlertVisible(false)}
        onOperation={SubmitLeaveRequest}
        onCancel={handleCancel}
        title={'Leave Group'}
        subtitle={'Are you sure you want to leave group?'}
        operationButtonLabel={'Leave'}
        IconName="location-exit"
      />
      <CustomAlertModal
        visible={isRemoveMemberAlertVisible}
        onClose={() => setIsRemoveMemberAlertVisible(false)}
        onOperation={() => DeclineRequest(memberIdToDelete)}
        onCancel={handleCancel}
        title={'Remove Member'}
        subtitle={'Are you sure you want to remove member?'}
        operationButtonLabel={'Remove'}
        IconName="delete"
      />
      <ImageModal
        imageUri={details?.body?.photo_url_main}
        imageFullScreen={imageFullScreen}
        setImageFullScreen={setImageFullScreen}
      />

      <MessageModal
        visible={modalVisible}
        title={modalTitle}
        message={responseMessgae}
        onClose={isConfirm ? handleModalConfirm : handleOkayPress}
        IconName={modalIcon}
        iconColor={iconColor}
      />

      {fundModelVisible && (
        <AuthorizePayment
          visible={fundModelVisible}
          onClose={() => setFundModelVisible(false)}
          onSuccess={onSuccess}
          isWallet={true}
          data={details}
        />
      )}
    </SafeAreaView>
  );
};

export default GroupDetails;

const styles = StyleSheet.create({
  safeAreaContainer: {flex: 1, backgroundColor: 'white'},
  keyboardView: {flex: 1},
  container: {
    marginHorizontal: 20,
    marginTop: height * 0.05,
    paddingBottom: height * 0.13,
    flex: 1,
  },
  v1: {flexDirection: 'row', justifyContent: 'center'},
  v2: {alignSelf: 'center', paddingHorizontal: 5},
  ownedText: {fontWeight: '500', color: 'black'},
  title: {
    color: 'black',
    fontSize: 19,
    fontWeight: '500',
  },
  text: {
    color: 'grey',
    fontSize: EventDetailTextSize,
    textAlign: 'center',
  },
  image: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: 'lightgrey',
    borderWidth: 1,
    borderColor: 'lightgrey',
  },
  amountStringText: {color: 'grey', fontSize: 12},
  button: {
    borderRadius: 10,
    marginTop: 20,
    backgroundColor: Theme.COLORS.BUTTON_1_BACKGROUND,
  },
  buttoncontainer: {
    flexDirection: 'row',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: buttonTextSize,
    padding: 10,
    color: button1TextColor,
    fontWeight: 'bold',
  },
  bottombox: {
    position: 'relative',
    top: '8%',
  },
  connectedStripView: {
    backgroundColor: '#C6FCE5',
    top: 6,
    borderRadius: 10,
  },
  seemembertext: {
    textAlign: 'center',
    color: otherTextColor,
    fontWeight: '500',
    marginTop: 10,
    fontSize: EventDetailTextSize,
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  connectedStripText: {padding: 10, fontSize: 10, color: 'grey'},
  view: {
    backgroundColor: 'white',
    elevation: 5,
    borderRadius: 10,
    shadowColor: 'black',
    paddingTop: 50,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: -10,
    right: 0,
    backgroundColor: 'transparent',
    padding: 10,
  },
  card: {
    borderTopWidth: 1,
    borderTopColor: 'lightgrey',
    paddingVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconstyle: {
    alignSelf: 'center',
    marginRight: 7,
    marginLeft: 12,
  },
  imagestyle: {
    width: 50,
    height: 50,
    alignSelf: 'center',
    borderRadius: 30,
    backgroundColor: 'lightgrey',
    borderWidth: 1,
    borderColor: 'lightgrey',
    marginLeft: 12,
  },
  passwordopacity: {
    alignSelf: 'center',
    marginRight: 15,
  },
  GroupmemberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  Modalbutton: {
    marginRight: 10,
    backgroundColor: otherTextColor,
    borderRadius: 10,
    margin: 5,
    padding: 5,
  },
  // inputTitle: {
  //   alignSelf: 'flex-start',
  //   fontWeight: 'bold',
  //   fontSize: InputTitleSize,
  //   color: 'black',
  //   marginBottom: 2,
  // },
  inputTitle: {
    fontSize: InputTitleSize,
    color: 'black',
    marginBottom: 2,
  },
  inputField: {
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 48,
    borderRadius: 10,
    paddingLeft: 10,
    borderColor: InputBorderColor,
    color: 'black',
  },
  pendingmodalbutton: {
    justifyContent: 'center',
  },
  Modalbuttontext: {
    textAlign: 'center',
    color: button1TextColor,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  checkbox: {
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'lightgrey',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteGroupModalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  errorText: {
    color: 'red',
    marginBottom: 5,
    textAlign: 'center',
  },
});
