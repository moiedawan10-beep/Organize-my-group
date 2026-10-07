import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import React, {useEffect, useCallback, memo, useMemo} from 'react';
import DashboardHeader2 from '../components/DashboardHeader2';
import {useDispatch, useSelector} from 'react-redux';
import {UpcomingEventsAction} from '../redux/slices/UpcomingEventsSlice';
import moment from 'moment';
import {useNavigation, useRoute} from '@react-navigation/native';
import Theme from '../constants/Theme';
import {otherTextColor} from '../resources/styling';
import FastImage from 'react-native-fast-image';

const {height} = Dimensions.get('window');

const EventCard = memo(({item, index, onEventPress, onGroupPress}) => {
  const colors = useMemo(
    () => [Theme.COLORS.CARD_1_BACKGROUND, Theme.COLORS.CARD_2_BACKGROUND],
    [],
  );

  const backgroundColor = colors[index % 2];
  const formattedTime = useMemo(
    () => moment(item.start_time, 'HH:mm:ss').format('hh:mm A'),
    [item.start_time],
  );
  const formattedDate = useMemo(
    () => moment(item.date, 'YYYY-MM-DD').format('MM/DD/YYYY'),
    [item.date],
  );

  return (
    <TouchableOpacity
      style={[styles.container, {backgroundColor}]}
      onPress={() => onEventPress(item.id)}>
      <View style={styles.cardView}>
        <FastImage
          source={{
            uri: item?.photo_url_main,
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
          }}
          style={styles.eventImage}
          resizeMode={FastImage.resizeMode.cover}
        />
        <TouchableOpacity onPress={() => onGroupPress(item.resource_id)}>
          <Text
            style={[styles.imgtitle, {color: otherTextColor}]}
            numberOfLines={1}
            minimumFontScale={0.5}>
            {item.resource_title}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.detailsContainer}>
        <View style={{flex: 1}}>
          <Text style={styles.heading}>Date:</Text>
          <Text style={styles.heading}>Event:</Text>
          <Text style={styles.heading}>Start Time:</Text>
        </View>
        <View style={{flex: 2}}>
          <Text style={styles.text}>{formattedDate}</Text>
          <Text
            style={[styles.text, {color: Theme.COLORS.OTHER_BACKGROUND_COLOR}]}
            numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.text}>{formattedTime}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const UpcomingEvents = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const groupId = route?.params?.groupId;
  const {events, loading} = useSelector(state => state.upcomingevents);

  const [state, setState] = React.useState({
    currentPage: 0,
    isFetchingMore: false,
    hasMoreData: true,
    eventsData: [],
  });

  const updateState = useCallback(updates => {
    setState(prev => ({...prev, ...updates}));
  }, []);

  const fetchEvents = useCallback(
    async page => {
      const response = await dispatch(
        UpcomingEventsAction({
          ...(groupId && {groupId}),
          nextPage: page,
        }),
      );
      return response?.payload || [];
    },
    [dispatch, groupId],
  );

  const resetAndFetchEvents = useCallback(async () => {
    updateState({
      isFetchingMore: false,
      hasMoreData: true,
      eventsData: [],
      currentPage: 1,
    });

    const data = await fetchEvents(1);
    if (data.length > 0) {
      updateState({eventsData: data});
    }
  }, [fetchEvents, updateState]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', resetAndFetchEvents);
    return unsubscribe;
  }, [navigation, resetAndFetchEvents]);

  const loadMoreEvents = useCallback(async () => {
    if (!state.isFetchingMore && state.hasMoreData) {
      updateState({isFetchingMore: true});
      const nextPage = state.currentPage + 1;
      updateState({currentPage: nextPage});

      const data = await fetchEvents(nextPage);
      if (data.length > 0) {
        updateState({
          eventsData: [...state.eventsData, ...data],
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
    fetchEvents,
    updateState,
  ]);

  const handleEventPress = useCallback(
    id => {
      navigation.navigate('Event Details', {id});
    },
    [navigation],
  );

  const handleGroupPress = useCallback(
    id => {
      navigation.navigate('Group Details', {id});
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({item, index}) => (
      <EventCard
        item={item}
        index={index}
        onEventPress={handleEventPress}
        onGroupPress={handleGroupPress}
      />
    ),
    [handleEventPress, handleGroupPress],
  );

  const keyExtractor = useCallback((_, index) => index.toString(), []);

  const renderFooter = useCallback(
    () =>
      state.isFetchingMore ? (
        <ActivityIndicator size="small" color={otherTextColor} />
      ) : null,
    [state.isFetchingMore],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <DashboardHeader2 title="Upcoming Events" isBack={true} />
      <View style={styles.maincontainer}>
        {loading && state.eventsData.length === 0 ? (
          <ActivityIndicator
            color={Theme.COLORS.OTHER_BACKGROUND_COLOR}
            size={50}
          />
        ) : state.eventsData?.length > 0 ? (
          <FlatList
            data={state.eventsData}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            numColumns={1}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMoreEvents}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{events?.body?.message}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default memo(UpcomingEvents);

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
  eventImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
    borderRadius: 10,
    marginTop: 20,
    backgroundColor: 'lightgrey',
  },
  detailsContainer: {
    flex: 3,
    flexDirection: 'row',
    bottom: 7,
  },
  heading: {
    color: Theme.COLORS.BLACK,
    fontWeight: '500',
    padding: 2,
    fontSize: 12,
  },
  text: {
    color: Theme.COLORS.BLACK,
    fontWeight: '500',
    padding: 2,
    fontSize: 12,
  },
  imgtitle: {
    fontWeight: '500',
    color: Theme.COLORS.BLACK,
    fontSize: 12,
    marginBottom: 10,
    marginTop: -5,
  },
  errorContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    paddingVertical: 10,
  },
  errorText: {
    color: 'red',
  },
  cardView:{flex: 1.4, alignItems: 'center'}
});
