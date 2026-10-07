import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  View,
  ActivityIndicator,
  FlatList,
  Linking,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DashboardHeader2 from '../components/DashboardHeader2';
import {
  button1backgroundColor,
  button1TextColor,
  buttonTextSize,
  card1Color,
  otherTextColor,
  PageTitleColor,
} from '../resources/styling';
import moment from 'moment';
import {EventDetailsAction} from '../redux/slices/EventDetailsSlice';
import {useDispatch, useSelector} from 'react-redux';
import {JoinEventAction} from '../redux/slices/JoinEventSlice';
import {DeleteEventAction} from '../redux/slices/DeleteEventSlice';
import {EventMembersAction} from '../redux/slices/EventMembersSlice';
import AuthorizeModal from '../components/AuthorizeModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {WithdrawEventAction} from '../redux/slices/WithdrawEventSlice';
import axios from 'axios';
import CustomAlertModal from '../components/CustomAlertModal';
import ImageModal from '../components/ImageModal';
import MessageModal from '../components/MessageModal';
import {SafeAreaView} from 'react-native';
import Theme from '../constants/Theme';
import {MyEventsAction} from '../redux/slices/MyEventsSlice';
import FastImage from 'react-native-fast-image';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const {height} = Dimensions.get('window');

const EventDetails = ({route, navigation}) => {
  const {id} = route.params;
  const dispatch = useDispatch();
  const [membersFlag, setMembersFlag] = useState(false);
  const [duration, setDuration] = useState({hours: 0, minutes: 0});
  const [editDeleteFlag, setEditDeleteFlag] = useState(false);
  const [details, setDetails] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [refetch, setRefetch] = useState(0);
  const [sessionId, setSessionId] = useState();
  const [imageFullScreen, setImageFullScreen] = useState(false);
  const [stripeUrl, setStripeUrl] = useState();
  const [webviewVisible, setWebviewVisible] = useState(false);
  const [isDeleteEventAlertVisible, setIsDeleteEventAlertVisible] =
    useState(false);
  const [isWithDrawAlertVisible, setIsWithDrawAlertVisible] = useState(false);
  const {loading} = useSelector(state => state.eventdetails);
  const {membersloading, members} = useSelector(state => state.eventmembers);
  const [eventGuests, setEventGuests] = useState([]);
  const [messageModalFlag, setMessageModalFlag] = useState(false);
  const [amount, setAmount] = useState(0);
  let eventId = details?.id || null;
  let payment_method = details?.payment_method;
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState([]);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {duration: 600});
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{translateY: (1 - progress.value) * 40}],
  }));

  useEffect(() => {
    setAmount(details?.total_amount);
  }, [details]);

  const handleShowGuestModal = guests => {
    setMembersFlag(false);
    setSelectedGuests(guests);
    setGuestModalVisible(true);
  };

  const closeGuestModal = () => {
    setGuestModalVisible(false);
    setSelectedGuests([]);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setAmount(details?.total_amount);
  };

  const handleGuests = newGuests => {
    setEventGuests(newGuests);
  };

  const handleAmountChange = amountt => {
    setAmount(amountt);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(EventDetailsAction(id));
    });
    return unsubscribe;
  }, [id, navigation, refetch]);

  const eventDetailsData = async () => {
    const data = await dispatch(EventDetailsAction(id));
    setDetails(data?.payload);
  };

  useEffect(() => {
    eventDetailsData();
  }, [refetch, navigation]);

  useEffect(() => {
    if (details) {
      function calculateTimeDifference(startTime, endTime) {
        const startDate = convertTimeToDate(startTime);
        const endDate = convertTimeToDate(endTime);

        if (endDate < startDate) {
          endDate.setDate(endDate.getDate() + 1);
        }

        const diffInMilliseconds = endDate - startDate;

        const durationSeconds = Math.floor(diffInMilliseconds / 1000);
        const hours = Math.floor(durationSeconds / 3600);
        const minutes = Math.floor((durationSeconds % 3600) / 60);

        return {hours, minutes};
      }

      function convertTimeToDate(timeString) {
        const [hours, minutes, seconds] = timeString.split(':').map(Number);

        const date = new Date();
        date.setHours(hours, minutes, seconds, 0);

        return date;
      }

      const duration = calculateTimeDifference(
        details?.start_time ? details?.start_time : '',
        details?.end_time ? details?.end_time : '',
      );
      setDuration(duration);
    } else {
      console.log('Invalid start or end time');
    }
  }, [details]);

  const registerEvent = async () => {
    setEditDeleteFlag(true);
    const response = await dispatch(JoinEventAction(id));
    if (response?.payload?.status_code === 200) {
      Alert.alert('Success', response?.payload?.body?.message);
    } else {
      Alert.alert('failure', 'Unknown error occured');
    }
    setEditDeleteFlag(false);
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

  const authorize = async (guests, amounnt) => {
    const accessToken = await getAccessToken();
    const apiUrl = 'https://dev.organizemygroup.com/api/stripe/authorize';

    let requestData = {
      guests: guests,
      amount: amounnt,
      id: eventId,
      resource_id: eventId,
      resource_type: 'event',
      payment_method: payment_method,
    };

    if (details?.total_amount <= 0 || details.payment_method > 0) {
      const response = await dispatch(JoinEventAction(requestData));

      if (response.payload?.body?.message === 'Event is full') {
        Alert.alert(
          'Event Full',
          'Sorry, the event is full and cannot accept more guests.',
          [
            {
              text: 'OK',
              onPress: () => {
                setModalVisible(false);
              },
            },
          ],
          {cancelable: false},
        );
      } else {
        setModalVisible(false);
        setRefetch(pre => pre + 1);
      }
    } else {
      try {
        const response = await axios.post(apiUrl, requestData, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setSessionId(response?.data?.body?.session_id);
        const {url} = response.data.body;

        if (url) {
          setStripeUrl(url);
          setWebviewVisible(true);
        } else {
          Alert.alert('Error', 'Authorization URL not found.');
        }
      } catch (error) {
        console.error('Authorization error:', error);
        Alert.alert('Error', 'Failed to fetch the Stripe authorization URL.');
      }
    }
  };

  const handleAuthorizePaymentMessage = () => {
    setMessageModalFlag(false);
    setStripeUrl(null);
    setSessionId(null);
    setRefetch(pre => pre + 1);
  };

  const handleWebViewNavigationStateChange = async state => {
    const accessToken = await getAccessToken();
    const {url} = state;
    if (
      url.includes('https://dev.organizemygroup.com/stripe/authorize/return')
    ) {
      if (sessionId) {
        setWebviewVisible(false);
        try {
          const response = await fetch(
            'https://dev.organizemygroup.com/api/stripe/authorize/return',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                guests: eventGuests,
                amount: amount,
                session_id: sessionId,
                resource_id: eventId,
                resource_type: 'event',
              }),
            },
          );
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setMessageModalFlag(true);
          setModalVisible(false);
        } catch (error) {
          console.error('Error completing Stripe connect:', error);
          Alert.alert(
            'Error',
            'Failed to connect Stripe account. Please try again.',
          );
        }
      }
    } else if (url.includes('cancel')) {
      setWebviewVisible(false);
    }
  };

  const deleteEvent = async () => {
    setEditDeleteFlag(true);
    const response = await dispatch(DeleteEventAction(id));
    if (response?.payload?.status_code === 200) {
      navigation.navigate('My Events');
      setIsDeleteEventAlertVisible(false);
    } else {
      Alert.alert('failure', 'Network error occured');
    }
    setEditDeleteFlag(false);
  };

  const withdrawevent = async () => {
    const response = await dispatch(WithdrawEventAction(id));
    if (response?.payload != undefined) {
      setRefetch(pre => pre + 1);
      setStripeUrl(null);
      setSessionId(null);
      setSessionId(null);
      setIsWithDrawAlertVisible(false);
    } else {
      Alert.alert('Warning', "Event Owner can't withdraw the event");
    }
    dispatch(MyEventsAction());
  };
  const handleCancel = () => {
    setIsWithDrawAlertVisible(false);
    setIsDeleteEventAlertVisible(false);
  };
  const handleUserProfile = id => {
    navigation.navigate('User Profile', {id}), setMembersFlag(false);
  };

  const handleImagePress = () => {
    setImageFullScreen(true);
  };

  const parseDescription = text => {
    const regex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(regex);
    return parts;
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <DashboardHeader2 title="Event Details" isBack={true} />
      {loading ? (
        <ActivityIndicator size={50} color={otherTextColor} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}>
          {details?.photo_url_main && (
            <TouchableOpacity onPress={handleImagePress}>
              <FastImage
                source={{
                  uri: details?.photo_url_main,
                  priority: FastImage.priority.normal,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={styles.image}
                resizeMode={FastImage.resizeMode.cover}
              />
            </TouchableOpacity>
          )}
          {/* EVENT NAME */}
          <Animated.View style={[styles.bottom, animatedStyle]}>
            <Text style={styles.heading}>Event Name</Text>
            <Text style={styles.text}>{details.title}</Text>
          </Animated.View>
          {/* DESCRIPTION */}
          {details?.description && (
            <Animated.View style={[styles.bottom, animatedStyle]}>
              <Text style={styles.heading}>Description</Text>
              <Text style={styles.text} selectable={true}>
                {parseDescription(details.description).map((part, index) => {
                  const isLink = part.match(/https?:\/\/[^\s]+/);
                  if (isLink) {
                    return (
                      <Text
                        key={index}
                        style={styles.link}
                        onPress={() => Linking.openURL(part)}
                        selectable={true}>
                        {part}
                      </Text>
                    );
                  } else {
                    return <Text key={index}>{part}</Text>;
                  }
                })}
              </Text>
            </Animated.View>
          )}
          {details?.parent_title && (
            <Animated.View style={[styles.bottom, animatedStyle]}>
              <Text style={styles.heading}>Group</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Group Details', {
                    id: details?.resource_id,
                  })
                }>
                <Text style={[styles.text, {color: otherTextColor}]}>
                  {details.parent_title}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
          {/* HOSTS */}
          <Animated.View style={[styles.hostView, animatedStyle]}>
            <Text style={styles.heading}>Host(s)</Text>
            <View style={styles.hostSubView}>
              {details?.hosts &&
                details?.hosts.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() =>
                      navigation.navigate('User Profile', {id: item.id})
                    }
                    style={styles.userView}>
                    <Text style={[styles.text, {padding: 8}]}>
                      {item.title.length > 25
                        ? `${item.title.slice(0, 25)}...`
                        : item.title}{' '}
                      <Text style={styles.attendingText}>
                        {item.attending === 1
                          ? '(Attending)'
                          : '(Not Attending)'}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </Animated.View>
          {/* DATE */}
          <Animated.View style={[styles.bottom, animatedStyle]}>
            <Text style={styles.heading}>Event Date</Text>
            <Text style={styles.text}>
              {moment(details.date, 'YYYY-MM-DD').format('MM/DD/YYYY')}
            </Text>
          </Animated.View>
          {/* TIME */}
          <Animated.View style={[styles.bottom, animatedStyle]}>
            <Text style={styles.heading}>Event Time</Text>
            <Text style={styles.text}>
              {moment(details.start_time, 'HH:mm:ss').format('hh:mm A')}
            </Text>
          </Animated.View>
          {/* Duration */}
          <Animated.View style={[styles.bottom, animatedStyle]}>
            <Text style={styles.heading}>Duration</Text>
            <Text style={styles.text}>
              {duration.hours === 0
                ? ''
                : duration.hours > 1
                ? `${duration.hours} hours`
                : `${duration.hours} hour`}
              {duration.minutes > 0 ? ` ${duration.minutes} minutes` : ''}
            </Text>
          </Animated.View>
          {/* LOCATION */}
          <Animated.View style={[styles.bottom, animatedStyle]}>
            <Text style={styles.heading}>Location</Text>
            <Text style={styles.text}>{details.location}</Text>
          </Animated.View>
          {/* COST */}
          <Animated.View style={[styles.bottom, animatedStyle]}>
            <Text style={styles.heading}>Cost</Text>
            <Text style={styles.text}>${details.total_amount}</Text>
          </Animated.View>
          {/* REGISTRATION */}
          <Animated.View style={[styles.bottom, animatedStyle]}>
            <Text style={styles.heading}>Registration opens</Text>
            <Text style={styles.text}>
              {new Date(details.registration_opens).toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </Text>
          </Animated.View>
          <Animated.View style={[styles.bottom, animatedStyle]}>
            <Text style={styles.heading}>Registration closes</Text>
            <Text style={styles.text}>
              {new Date(details.registration_closes).toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </Text>
          </Animated.View>
          {/* Charges Processed */}
          {details?.entry_fee > 0 && (
            <Animated.View style={[styles.bottom, animatedStyle]}>
              <Text style={styles.heading}>Charges processed</Text>
              <Text style={styles.text}>
                {new Date(details?.charges_process).toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
            </Animated.View>
          )}

          {/* REFUNDs PERMITTED */}
          {details.entry_fee > 0 && (
            <Animated.View style={[styles.bottom, animatedStyle]}>
              <Text style={styles.heading}>Refunds Permitted</Text>
              <Text style={styles.text}>
                {details.refund_amount == '0.00' ? 'No' : 'Yes'}
              </Text>
            </Animated.View>
          )}

          {/* REFUND POLICY */}
          {details?.refund_policy && details?.entry_fee > 0 && (
            <Animated.View style={[styles.bottom, animatedStyle]}>
              <Text style={styles.heading}>Refund Policy</Text>
              <Text style={styles.text}>{details.refund_policy}</Text>
            </Animated.View>
          )}

          {/* ATTENDEES */}
          {details?.show_attendees == 1 && (
            <Animated.View style={[styles.bottom, animatedStyle]}>
              <Text style={styles.heading}>Current Attendees</Text>
              <TouchableOpacity
                onPress={() => {
                  setMembersFlag(!membersFlag),
                    dispatch(EventMembersAction(id));
                }}>
                <Text style={[styles.text, {color: otherTextColor}]}>
                  {details.current_attendees === 0
                    ? '0'
                    : `${details.current_attendees} ${
                        details.current_attendees === 1 ? 'Person' : 'People'
                      }`}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
          {/* ATTENDANCE LIMIT */}
          {/* <View style={styles.bottom}>
            <Text style={styles.heading}>Attendance Limit</Text>
            <Text style={styles.text}>
              {details.attendance_limit === 0
                ? 'No limit'
                : `${details.attendance_limit} ${
                    details.attendance_limit === 1 ? 'Person' : 'People'
                  }`}
            </Text>
          </View> */}

          {/* MINIMUM ATTENDACE TO HOLD EVENT */}
          <Animated.View style={[styles.bottom, animatedStyle]}>
            <Text style={styles.heading}>Minimum attendance to hold event</Text>
            <Text style={styles.text}>
              {details.min_attendence === 0
                ? 'No limit'
                : `${details.min_attendence} ${
                    details.min_attendence === 1 ? 'Person' : 'People'
                  }`}
            </Text>
          </Animated.View>

          {/* MAXIMUM PARTICIPANTS */}
          <Animated.View style={[styles.bottom, animatedStyle]}>
            <Text style={styles.heading}>Maximum Participants</Text>
            <Text style={styles.text}>
              {details.max_attendence === 0
                ? 'No limit'
                : `${details.max_attendence} ${
                    details.max_attendence === 1 ? 'Person' : 'People'
                  }`}
            </Text>
          </Animated.View>
          {/* GUEST ALLOWED */}
          <Animated.View style={[styles.bottom, animatedStyle]}>
            <Text style={styles.heading}>Guests Allowed</Text>
            {details.guest_allowed > 0 ? (
              <Text style={styles.text}>Yes - max {details.guest_allowed}</Text>
            ) : (
              <Text style={styles.text}>Yes - No Limit </Text>
            )}
          </Animated.View>
          {/* NOTE */}
          {details?.notes && (
            <Animated.View style={[styles.bottom, animatedStyle]}>
              <Text style={styles.heading}>Note</Text>
              <Text style={styles.text}>{details.notes}</Text>
            </Animated.View>
          )}
          {(details?.is_owner ||
            details?.can_edit_event ||
            details?.can_delete_event) && (
            <View>
              {!details?.has_started ? (
                <>
                  {!!details?.can_edit_event && (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() =>
                        navigation.navigate('Create Event', {
                          isEditing: true,
                          details: details,
                          onUpdate: eventDetailsData,
                          eventID: id,
                        })
                      }>
                      <Text style={styles.buttonText}>Edit Event Details</Text>
                    </TouchableOpacity>
                  )}

                  {!!details?.can_delete_event && (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => setIsDeleteEventAlertVisible(true)}>
                      {editDeleteFlag ? (
                        <ActivityIndicator color="white" size={43} />
                      ) : (
                        <Text style={styles.buttonText}>Cancel Event</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    {color: 'black', fontWeight: '400'},
                  ]}>
                  Event has started, You cannot Edit/Delete it
                </Text>
              )}
            </View>
          )}

          {!!details?.can_join && !details?.is_member && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setModalVisible(true)}>
              {editDeleteFlag ? (
                <ActivityIndicator color="white" size={43} />
              ) : (
                <Text style={styles.buttonText}>
                  Register Now for this Event
                </Text>
              )}
            </TouchableOpacity>
          )}
          {!!details?.is_member && details.is_owner === false && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setIsWithDrawAlertVisible(true)}>
              <Text style={styles.buttonText}>Leave Event</Text>
            </TouchableOpacity>
          )}
          {details?.is_authorized === 0 &&
            !!details.is_member &&
            details.is_owner === false && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => setModalVisible(true)}>
                <Text style={styles.buttonText}>Authorize Payment</Text>
              </TouchableOpacity>
            )}
        </ScrollView>
      )}
      {membersFlag && (
        <Modal visible={membersFlag} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text
                style={[
                  styles.text,
                  {
                    fontSize: 18,
                    fontWeight: '500',
                    color: 'black',
                  },
                ]}>
                {details.current_attendees}{' '}
                {details.current_attendees === 1 ? 'Attendee' : 'Attendees'}
              </Text>
              <TouchableOpacity
                onPress={() => setMembersFlag(!membersFlag)}
                style={styles.closeButton}>
                <Text style={styles.cancelModelText}>╳</Text>
              </TouchableOpacity>

              <ScrollView>
                {members && !membersloading ? (
                  members?.response?.map((item, index) => {
                    const isHost = item.is_owner;
                    const hasGuests = item.guests && item.guests.length > 0;

                    return (
                      <TouchableOpacity
                        onPress={() => handleUserProfile(item.id)}
                        style={styles.container1}
                        key={item.id || index}>
                        <View style={styles.modalViewStyle}>
                          <FastImage
                            source={{
                              uri: item?.photo_url_main,
                              priority: FastImage.priority.normal,
                              cache: FastImage.cacheControl.immutable,
                            }}
                            style={styles.Attendees_image}
                            resizeMode={FastImage.resizeMode.cover}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                          }}>
                          <Text style={styles.modalText}>
                            {item.title.length > 20
                              ? item.title.slice(0, 20) + '...'
                              : item.title}
                          </Text>

                          {!isHost && hasGuests && (
                            <TouchableOpacity
                              onPress={() => handleShowGuestModal(item.guests)}
                              style={styles.hasGuestStyle}>
                              <Text style={styles.hasGuestText}>
                                {item.guests.length}{' '}
                                {item?.guests?.length > 1 ? 'Guests' : 'Guest'}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <ActivityIndicator
                    color={otherTextColor}
                    style={{marginTop: height * 0.18}}
                    size={50}
                  />
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {guestModalVisible && (
        <Modal
          visible={guestModalVisible}
          transparent={true}
          animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.guestModalContainer}>
              <Text
                style={[
                  styles.text,
                  {
                    fontSize: 18,
                    fontWeight: '500',
                    color: 'black',
                  },
                ]}>
                Guests
              </Text>
              <TouchableOpacity
                onPress={closeGuestModal}
                style={styles.closeButton}>
                <Text style={styles.cancelModelText}>╳</Text>
              </TouchableOpacity>

              {selectedGuests.length > 0 && (
                <FlatList
                  data={selectedGuests}
                  keyExtractor={(item, index) => index.toString()}
                  showsVerticalScrollIndicator={false}
                  renderItem={({item, index}) => (
                    <View style={{flexDirection: 'row', paddingVertical: 5}}>
                      <View style={styles.guestView}>
                        <Text style={[styles.guestText, {fontWeight: 'bold'}]}>
                          {index + 1}
                        </Text>
                      </View>
                      <Text style={[styles.guestText, {left: 10}]}>{item}</Text>
                    </View>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.guestText}>No guests available</Text>
                  }
                />
              )}
            </View>
          </View>
        </Modal>
      )}

      {modalVisible && (
        <AuthorizeModal
          visible={modalVisible}
          onClose={handleCloseModal}
          onSave={handleGuests}
          onAmountSave={handleAmountChange}
          maxGuest={details ? details?.guest_allowed : null}
          amount={amount}
          authorize={authorize}
          handleWebViewNavigation={handleWebViewNavigationStateChange}
          webviewVisible={webviewVisible}
          stripeUrl={stripeUrl}
          closeWebView={() => setWebviewVisible(false)}
        />
      )}

      {isWithDrawAlertVisible && (
        <CustomAlertModal
          visible={isWithDrawAlertVisible}
          onClose={() => setIsWithDrawAlertVisible(false)}
          onOperation={withdrawevent}
          onCancel={handleCancel}
          title={'Leave Event'}
          subtitle={'Are you sure you want to leave event?'}
          operationButtonLabel={'Leave'}
          IconName="location-exit"
        />
      )}

      {isDeleteEventAlertVisible && (
        <CustomAlertModal
          visible={isDeleteEventAlertVisible}
          onClose={() => setIsDeleteEventAlertVisible(false)}
          onOperation={deleteEvent}
          onCancel={handleCancel}
          title={'Cancel Event'}
          subtitle={'Are you sure you want to cancel this event?'}
          operationButtonLabel={'Confirm'}
          IconName="delete"
        />
      )}

      {imageFullScreen && (
        <ImageModal
          imageUri={details?.photo_url_main}
          imageFullScreen={imageFullScreen}
          setImageFullScreen={setImageFullScreen}
        />
      )}

      {messageModalFlag && (
        <MessageModal
          visible={messageModalFlag}
          title="Message"
          message="Payment method added successfully"
          onClose={handleAuthorizePaymentMessage}
          IconName={'checkmark-circle-outline'}
          iconColor={Theme.COLORS.SUCCESS}
        />
      )}
    </SafeAreaView>
  );
};

export default EventDetails;

const styles = StyleSheet.create({
  safeAreaContainer: {flex: 1, backgroundColor: 'white'},
  container: {
    marginHorizontal: 20,
    marginTop: height * 0.05,
    paddingBottom: height * 0.1,
  },
  heading: {
    color: 'black',
    fontWeight: '500',
    fontSize: 14,
  },
  text: {
    color: 'grey',
    fontSize: 13,
  },
  button: {
    borderRadius: 10,
    marginTop: 30,
    backgroundColor: button1backgroundColor,
  },
  guestModalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    height: '30%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: buttonTextSize,
    padding: 10,
    color: button1TextColor,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0,0.1)',
  },
  guestList: {
    paddingLeft: 10,
    paddingTop: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    position: 'absolute',
    right: 4,
    top: 10,
  },
  guestText: {
    fontSize: 15,
    color: 'black',
    alignSelf: 'center',
  },
  modalContainer: {
    width: '90%',
    height: '60%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 18,
    backgroundColor: 'transparent',
  },
  bottom: {
    marginBottom: height * 0.02,
  },
  container1: {
    marginTop: '2%',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: 'lightgrey',
  },
  modalText: {
    marginHorizontal: 10,
    fontWeight: '500',
    color: 'black',
  },
  image: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    borderRadius: 100,
    marginBottom: 10,
    backgroundColor: 'lightgrey',
    borderWidth: 1,
    borderColor: 'lightgrey',
  },
  Attendees_image: {
    width: 50,
    height: 50,
    alignSelf: 'center',
    borderRadius: 100,
    backgroundColor: 'lightgrey',
    borderWidth: 1,
    borderColor: 'lightgrey',
  },
  link: {
    color: otherTextColor,
    textDecorationLine: 'underline',
    fontStyle: 'italic',
  },
  hostView: {marginBottom: 4},
  hostSubView: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 5},
  userView: {
    backgroundColor: card1Color,
    margin: 2,
    borderRadius: 15,
  },
  guestView: {
    backgroundColor: '#E7F4FB',
    borderRadius: 20,
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendingText: {fontSize: 12, color: PageTitleColor},
  cancelModelText: {color: 'black', right: 10, fontSize: 20},
  modalViewStyle: {borderRadius: 25, overflow: 'hidden'},
  hasGuestStyle: {
    backgroundColor: '#E7F4FB',
    borderRadius: 20,
  },
  hasGuestText: {color: 'red', fontSize: 12, padding: 5},
});
