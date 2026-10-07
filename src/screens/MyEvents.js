import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import React, {useCallback, useMemo} from 'react';
import DashboardHeader2 from '../components/DashboardHeader2';
import {useDispatch, useSelector} from 'react-redux';
import {MyEventsAction} from '../redux/slices/MyEventsSlice';
import {WithdrawEventAction} from '../redux/slices/WithdrawEventSlice';
import moment from 'moment';
import Theme from '../constants/Theme';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import CustomAlertModal from '../components/CustomAlertModal';
import {otherTextColor} from '../resources/styling';
import FastImage from 'react-native-fast-image';

const {height} = Dimensions.get('window');

const MyEvents = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {events, loading} = useSelector(state => state.myevents);
  const [state, setState] = React.useState({
    eventDeleteId: null,
    isWithDrawAlertVisible: false,
    isFetchingMore: false,
    hasMoreData: true,
    eventsData: [],
    currentPage: 0,
    selectedView: 'Future',
  });

  const updateState = useCallback(updates => {
    setState(prev => ({...prev, ...updates}));
  }, []);

  const renderEmptyMessage = useMemo(
    () => <Text style={styles.emptyMessage}>No events to display</Text>,
    [],
  );

  const resetEventState = useCallback(() => {
    updateState({
      isFetchingMore: false,
      hasMoreData: true,
      eventsData: [],
      currentPage: 1,
    });
  }, [updateState]);

  const fetchInitialEvents = useCallback(async () => {
    const response = await dispatch(
      MyEventsAction({currentPage: 1, viewType: state.selectedView}),
    );
    if (response?.payload?.length > 0) {
      updateState({eventsData: response.payload});
    }
  }, [dispatch, state.selectedView, updateState]);

  useFocusEffect(
    useCallback(() => {
      resetEventState();
      fetchInitialEvents();
    }, [state.selectedView, resetEventState, fetchInitialEvents]),
  );

  const loadMoreEvents = useCallback(async () => {
    if (!state.isFetchingMore && state.hasMoreData) {
      updateState({isFetchingMore: true});
      const nextPage = state.currentPage + 1;

      const response = await dispatch(
        MyEventsAction({currentPage: nextPage, viewType: state.selectedView}),
      );

      if (response?.payload?.length > 0) {
        updateState({
          eventsData: [...state.eventsData, ...response.payload],
          currentPage: nextPage,
        });
      } else {
        updateState({hasMoreData: false});
      }
      updateState({isFetchingMore: false});
    }
  }, [
    state.isFetchingMore,
    state.hasMoreData,
    state.currentPage,
    state.eventsData,
    dispatch,
    state.selectedView,
    updateState,
  ]);

  const withdrawEvent = useCallback(
    async id => {
      const response = await dispatch(WithdrawEventAction(id));
      if (response?.payload != undefined) {
        updateState({
          eventsData: state.eventsData.filter(event => event.id !== id),
          isWithDrawAlertVisible: false,
        });
      } else {
        Alert.alert('Warning', "Event Owner can't withdraw the event");
      }
    },
    [dispatch, state.eventsData, updateState],
  );

  const handleRemoveEvent = useCallback(
    memberId => {
      updateState({
        eventDeleteId: memberId,
        isWithDrawAlertVisible: true,
      });
    },
    [updateState],
  );

  const handleCancel = useCallback(() => {
    updateState({isWithDrawAlertVisible: false});
  }, [updateState]);

  const renderItem = useCallback(
    ({item, index}) => {
      const backgroundColor =
        index % 2 === 0
          ? Theme.COLORS.CARD_1_BACKGROUND
          : Theme.COLORS.CARD_2_BACKGROUND;

      const formattedTime = moment(item.start_time, 'HH:mm:ss').format(
        'hh:mm A',
      );
      const formattedDate = moment(item.date, 'YYYY-MM-DD').format(
        'MM/DD/YYYY',
      );
      const isUnannounced = new Date(item.announce_date) > new Date();

      return (
        <TouchableOpacity
          style={[styles.container, {backgroundColor}]}
          onPress={() => navigation.navigate('Event Details', {id: item.id})}>
          <View style={styles.imageSection}>
            <FastImage
              source={{
                uri: item?.photo_url_main,
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.immutable,
              }}
              style={styles.eventImage}
              resizeMode={FastImage.resizeMode.cover}
            />
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Group Details', {id: item.resource_id})
              }>
              <Text
                style={[styles.imgtitle, {color: otherTextColor}]}
                numberOfLines={1}>
                {item.resource_title}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.detailsSection}>
            <View style={styles.labelColumn}>
              <Text style={styles.heading}>Date:</Text>
              <Text style={styles.heading}>Event:</Text>
              <Text style={styles.heading}>Start Time:</Text>
              {isUnannounced && <Text style={styles.heading}>Status:</Text>}
              {!item?.is_owner && <Text style={styles.heading}>Cancel:</Text>}
            </View>
            <View style={styles.valueColumn}>
              <Text style={styles.text}>{formattedDate}</Text>
              <Text style={[styles.text, styles.eventTitle]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.text}>{formattedTime}</Text>
              {isUnannounced && (
                <Text style={styles.unannounced}>Not Yet Announced</Text>
              )}
              {!item?.is_owner && (
                <TouchableOpacity onPress={() => handleRemoveEvent(item.id)}>
                  <Text style={styles.withdrawText}>Withdraw from event</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [handleRemoveEvent, navigation],
  );

  const ListFooterComponent = useMemo(
    () =>
      state.isFetchingMore ? (
        <ActivityIndicator size="small" color={otherTextColor} />
      ) : null,
    [state.isFetchingMore],
  );

  const handleViewChange = useCallback(
    view => {
      updateState({selectedView: view});
    },
    [updateState],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <DashboardHeader2 title="My Events" isBack={true} />
      <View style={styles.maincontainer}>
        <View style={styles.filterOptionsContainer}>
          <TouchableOpacity
            onPress={() => handleViewChange('Past')}
            style={styles.filterOption}>
            <Text
              style={{
                color: state.selectedView === 'Past' ? '#FD397F' : 'black',
                fontWeight: state.selectedView === 'Past' ? 'bold' : '300',
                borderBottomWidth: state.selectedView === 'Past' ? 2 : 0,
                borderBottomColor:
                  state.selectedView === 'Past' ? '#FD397F' : undefined,
              }}>
              Past Events
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleViewChange('Future')}
            style={styles.filterOption}>
            <Text
              style={{
                color: state.selectedView === 'Future' ? '#FD397F' : 'black',
                fontWeight: state.selectedView === 'Future' ? 'bold' : '300',
                borderBottomWidth: state.selectedView === 'Future' ? 2 : 0,
                borderBottomColor:
                  state.selectedView === 'Future' ? '#FD397F' : undefined,
              }}>
              Future Events
            </Text>
          </TouchableOpacity>
        </View>

        {loading && state.eventsData.length === 0 ? (
          <ActivityIndicator
            color={Theme.COLORS.OTHER_BACKGROUND_COLOR}
            size={50}
          />
        ) : state.eventsData?.length > 0 ? (
          <FlatList
            data={state.eventsData}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMoreEvents}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={renderEmptyMessage}
            ListFooterComponent={ListFooterComponent}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{events?.body?.message}</Text>
          </View>
        )}
        {state.isWithDrawAlertVisible && (
          <CustomAlertModal
            visible={state.isWithDrawAlertVisible}
            onClose={() => updateState({isWithDrawAlertVisible: false})}
            onOperation={() => withdrawEvent(state.eventDeleteId)}
            onCancel={handleCancel}
            title="Leave Event"
            subtitle="Are you sure you want to leave event?"
            operationButtonLabel="Leave"
            IconName="location-exit"
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default React.memo(MyEvents);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  maincontainer: {
    paddingHorizontal: 10,
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    marginVertical: 10,
    height: height * 0.18,
    borderRadius: 10,
    alignItems: 'center',
  },
  imageSection: {
    flex: 1.4,
    alignItems: 'center',
  },
  detailsSection: {
    flex: 3.3,
    flexDirection: 'row',
    bottom: 7,
  },
  labelColumn: {
    flex: 1,
  },
  valueColumn: {
    flex: 2,
  },
  eventImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
    borderRadius: 10,
    marginTop: 20,
    backgroundColor: 'lightgrey',
  },
  heading: {
    color: 'black',
    fontWeight: '500',
    padding: 2,
    fontSize: 12,
    paddingHorizontal: 5,
  },
  text: {
    color: 'black',
    fontWeight: '500',
    padding: 2,
    fontSize: 12,
  },
  eventTitle: {
    color: Theme.COLORS.OTHER_BACKGROUND_COLOR,
  },
  imgtitle: {
    fontWeight: '500',
    color: 'black',
    fontSize: 12,
    marginBottom: 10,
    marginTop: -5,
  },
  unannounced: {
    color: '#FD397F',
    fontWeight: 'bold',
    padding: 2,
    fontSize: 12,
  },
  withdrawText: {
    color: Theme.COLORS.BUTTON_1_BACKGROUND,
    fontWeight: '500',
    padding: 2,
    fontSize: 12,
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 5,
    color: 'red',
  },
  errorContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    paddingVertical: 10,
  },
  errorText: {
    color: 'red',
  },
  filterOptionsContainer: {
    paddingVertical: 5,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    width: '100%',
    marginVertical: 5,
    borderRadius: 10,
  },
  filterOption: {
    paddingVertical: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
