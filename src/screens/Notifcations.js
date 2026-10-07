import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState, useCallback, useMemo} from 'react';
import DashboardHeader2 from '../components/DashboardHeader2';

import {
  button1backgroundColor,
  NotificationTextSize,
  otherTextColor,
  PageTitleColor,
} from '../resources/styling';
import {useDispatch} from 'react-redux';
import {NotifcationsAction} from '../redux/slices/NotificationSlice';
import {GroupRequestsRejectionAction} from '../redux/slices/DeclineMembershipSlice';
import {GroupRequestsApprovalAction} from '../redux/slices/GroupRequestApprovalSlice';
import {ReadNotifcationsAction} from '../redux/slices/NotificationsReadSlice';
import MessageModal from '../components/MessageModal';
import {SafeAreaView} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {DeleteNotificationAction} from '../redux/slices/DeleteNotificationSlice';
import {cancelGroupOwnershipAction} from '../redux/slices/CancelGroupOwnershipSlice';
import {acceptGroupOwnershipAction} from '../redux/slices/AcceptGroupOwnershipSlice';

const Notifcations = ({navigation}) => {
  const dispatch = useDispatch();
  const [actionLoaders, setActionLoaders] = useState({});
  const [modalState, setModalState] = useState({
    visible: false,
    title: 'Message',
    message: '',
    icon: 'notifications',
    iconColor: '',
  });
  const [notificationState, setNotificationState] = useState({
    isFetchingMore: false,
    hasMoreData: true,
    data: [],
    currentPage: 0,
    loader: false,
  });
  const showModal = useCallback((title, message, iconName, iconColorProp) => {
    setModalState({
      visible: true,
      title,
      message,
      icon: iconName,
      iconColor: iconColorProp,
    });
  }, []);

  useEffect(() => {
    dispatch(ReadNotifcationsAction());
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setNotificationState(prev => ({
        ...prev,
        isFetchingMore: false,
        hasMoreData: true,
        data: [],
        currentPage: 0,
      }));
      loadMoreNotifications();
    });
    return unsubscribe;
  }, [navigation]);

  const loadMoreNotifications = useCallback(async () => {
    const {isFetchingMore, hasMoreData, currentPage} = notificationState;
    if (!isFetchingMore && hasMoreData) {
      setNotificationState(prev => ({
        ...prev,
        isFetchingMore: true,
        loader: true,
      }));
      const nextPage = currentPage + 1;
      const response = await dispatch(NotifcationsAction(nextPage));
      if (response?.payload?.body?.response?.length > 0) {
        setNotificationState(prev => ({
          ...prev,
          data: [...prev.data, ...response.payload.body.response],
          currentPage: nextPage,
          isFetchingMore: false,
          loader: false,
        }));
      } else {
        setNotificationState(prev => ({
          ...prev,
          hasMoreData: false,
          isFetchingMore: false,
          loader: false,
        }));
      }
    }
  }, [dispatch, notificationState]);

  const refreshNotifications = useCallback(async () => {
    setNotificationState(prev => ({
      ...prev,
      isFetchingMore: false,
      hasMoreData: true,
      data: [],
      currentPage: 0,
      loader: true,
    }));
    const response = await dispatch(NotifcationsAction(1));
    if (response?.payload?.body?.response?.length > 0) {
      setNotificationState(prev => ({
        ...prev,
        data: response?.payload?.body?.response,
        currentPage: 1,
        loader: false,
      }));
    } else {
      setNotificationState(prev => ({
        ...prev,
        loader: false,
      }));
    }
  }, [dispatch]);

  const handleApproveRequest = useCallback(
    async (id, user_id) => {
      setActionLoaders(prev => ({...prev, [`approve_${id}`]: true}));
      const response = await dispatch(
        GroupRequestsApprovalAction({id, user_id}),
      );
      if (response?.payload?.message) {
        setActionLoaders(prev => ({...prev, [`approve_${id}`]: false}));
        showModal(
          'Approval Status',
          'Request approved',
          'checkmark-circle-outline',
          '#4CAF50',
        );
        await refreshNotifications();
      } else {
        Alert.alert('Error', 'Unknown error occurred');
      }
    },
    [dispatch, showModal, refreshNotifications],
  );

  const handleDeclineRequest = useCallback(
    async (id, user_id) => {
      setActionLoaders(prev => ({...prev, [`reject_${id}`]: true}));
      const response = await dispatch(
        GroupRequestsRejectionAction({id, user_id}),
      );
      if (response?.payload?.message === 'Declined user membership') {
        setActionLoaders(prev => ({...prev, [`reject_${id}`]: false}));
        showModal(
          'Decline Request',
          'User membership declined',
          'close-circle-outline',
          'red',
        );
        await refreshNotifications();
      }
    },
    [dispatch, showModal, refreshNotifications],
  );

  const handleNavigation = useCallback(
    item => {
      if (item.object_type === 'group') {
        navigation.navigate('Group Details', {id: item.object.id});
      } else if (item.object_type === 'event') {
        navigation.navigate('Event Details', {id: item.object.id});
      }
    },
    [navigation],
  );

  const handleApproveOwnership = async (groupId, userId) => {
    try {
      const payload = {
        user_id: userId,
        group_id: groupId,
      };
      await dispatch(acceptGroupOwnershipAction(payload));
      await refreshNotifications();
    } catch (error) {
      showModal(
        'Error',
        'Failed to approve ownership request',
        'alert-circle',
        'red',
      );
    }
  };

  const handleDeclineOwnership = async (groupId, userId) => {
    try {
      const payload = {
        user_id: userId,
        group_id: groupId,
      };
      await dispatch(cancelGroupOwnershipAction(payload));
      await refreshNotifications();
    } catch (error) {
      showModal(
        'Error',
        'Failed to decline ownership request',
        'alert-circle',
        'red',
      );
    }
  };

  const handleDeleteNotification = async id => {
    try {
      setActionLoaders(prev => ({...prev, [`delete_${id}`]: true}));
      await dispatch(DeleteNotificationAction({id}));
      await refreshNotifications();
    } catch (error) {
      showModal(
        'Error',
        'Failed to delete notification',
        'alert-circle',
        'red',
      );
    } finally {
      setActionLoaders(prev => ({...prev, [`delete_${id}`]: false}));
    }
  };

  const renderNotifications = useCallback(
    ({item}) => {
      let strippedText = item.body_content.replace(/<a.*?>(.*?)<\/a>/g, '$1');
      strippedText = strippedText.replace(/\(\d+\)/g, '').trim();
      strippedText = strippedText.replace(/\s*group\.?$/, '');
      strippedText = strippedText.replace(/\bmembership\.$/, 'membership for');
      const isJoinRequest = item.type === 'joinGroup_request';
      const isOwnershipRequest = item.type === 'group_ownership_request';
      const showRequestButtons = isJoinRequest || isOwnershipRequest;
      const renderRightActions = (progress, dragX) => {
        return (
          <TouchableOpacity
            disabled={actionLoaders[`delete_${item?.id}`]}
            onPress={() => handleDeleteNotification(item.id)}
            style={{
              backgroundColor: 'red',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View style={{paddingHorizontal: 10}}>
              {actionLoaders[`delete_${item?.id}`] ? (
                <ActivityIndicator size={23} color="white" />
              ) : (
                <AntDesign name="delete" size={23} color={'white'} />
              )}
            </View>
          </TouchableOpacity>
        );
      };

      return (
        <Swipeable
          renderRightActions={renderRightActions}
          friction={2}
          leftThreshold={3}
          rightThreshold={10}>
          <View style={styles.content}>
            <TouchableOpacity
              style={styles.container1}
              onPress={() => handleNavigation(item)}>
              <View style={styles.imageContainer}>
                <Image
                  source={{uri: item?.object?.image_profile}}
                  style={{width: 50, height: 50, backgroundColor: 'lightgrey'}}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.modalText}>
                {strippedText}{' '}
                <Text style={{color: '#FD397F', fontWeight: '500'}}>
                  {item?.object?.title}
                  {item.object_type === 'group' && (
                    <Text style={[styles.modalText, {fontWeight: '400'}]}>
                      {' '}
                      group.
                    </Text>
                  )}
                </Text>
              </Text>

              {showRequestButtons && (
                <View style={styles.buttonscontainer}>
                  <TouchableOpacity
                    onPress={() =>
                      isOwnershipRequest
                        ? handleApproveOwnership(
                            item?.object?.id,
                            item?.subject_id,
                          )
                        : handleApproveRequest(
                            item?.object?.id,
                            item?.subject_id,
                          )
                    }
                    disabled={actionLoaders[`approve_${item?.object?.id}`]}
                    style={styles.approvebuttonstyle}>
                    {actionLoaders[`approve_${item?.object?.id}`] ? (
                      <ActivityIndicator
                        size={19}
                        style={{marginHorizontal: 17}}
                        color="white"
                      />
                    ) : (
                      <Text style={styles.buttontextstyle}>
                        {isOwnershipRequest ? 'Accept' : 'Approve'}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      isOwnershipRequest
                        ? handleDeclineOwnership(
                            item?.object?.id,
                            item?.owner_id,
                          )
                        : handleDeclineRequest(
                            item?.object?.id,
                            item?.subject_id,
                          )
                    }
                    disabled={actionLoaders[`reject_${item?.object?.id}`]}
                    style={styles.rejectbuttonstyle}>
                    {actionLoaders[`reject_${item?.object?.id}`] ? (
                      <ActivityIndicator
                        size={19}
                        style={{marginHorizontal: 17}}
                        color="white"
                      />
                    ) : (
                      <Text style={styles.buttontextstyle}>
                        {isOwnershipRequest ? 'Decline' : 'Reject'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Swipeable>
      );
    },
    [
      actionLoaders,
      handleApproveRequest,
      handleDeclineRequest,
      handleNavigation,
      dispatch,
    ],
  );

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyView}>
        <Text style={{color: 'red'}}>No Notifications Available</Text>
      </View>
    ),
    [],
  );

  const ListFooterComponent = useMemo(
    () =>
      notificationState.isFetchingMore ? (
        <ActivityIndicator size="small" color={otherTextColor} />
      ) : null,
    [notificationState.isFetchingMore],
  );

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <DashboardHeader2 title="Notifications" isBack={true} />
      <View style={styles.viewContainer}>
        {notificationState.loader && notificationState.data.length === 0 ? (
          <ActivityIndicator size={40} color={otherTextColor} />
        ) : (
          <FlatList
            data={notificationState.data}
            renderItem={renderNotifications}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMoreNotifications}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={ListEmptyComponent}
            ListFooterComponent={ListFooterComponent}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{paddingVertical: 10}}
          />
        )}
      </View>
      {modalState.visible && (
        <MessageModal
          visible={modalState.visible}
          title={modalState.title}
          message={modalState.message}
          onClose={() => setModalState(prev => ({...prev, visible: false}))}
          IconName={modalState.icon}
          iconColor={modalState.iconColor}
        />
      )}
    </SafeAreaView>
  );
};

export default Notifcations;

const styles = StyleSheet.create({
  safeAreaContainer: {flex: 1, backgroundColor: 'white', paddingBottom: 65},
  buttonscontainer: {
    justifyContent: 'space-between',
    marginLeft: 5,
    top: 3,
  },
  viewContainer: {width: '100%', alignSelf: 'center'},
  container1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingBottom: 7,
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
    paddingHorizontal: 10,
  },
  content: {
    backgroundColor: 'white',
  },
  modalText: {
    flex: 4,
    fontSize: NotificationTextSize,
    color: 'black',
  },
  imageContainer: {
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 10,
    marginLeft: 5,
  },
  approvebuttonstyle: {
    backgroundColor: PageTitleColor,
    marginBottom: 10,
    borderRadius: 10,
    padding: 5,
  },
  rejectbuttonstyle: {
    backgroundColor: button1backgroundColor,
    borderRadius: 10,
    padding: 5,
  },
  buttontextstyle: {color: 'white', textAlign: 'center'},
  emptyView: {paddingVertical: 10, alignSelf: 'center'},
});
