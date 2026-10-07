import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import DashboardHeader2 from '../components/DashboardHeader2';
import {card1Color, card2Color, otherTextColor} from '../resources/styling';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {useDispatch, useSelector} from 'react-redux';
import {SearchGroupAction} from '../redux/slices/SearchPublicGroupSlice';
import {SafeAreaView} from 'react-native';

const SearchGroup = ({navigation}) => {
  const [searchState, setSearchState] = useState({
    query: '',
    results: [],
    page: 1,
    isFetchingMore: false,
    hasMoreData: true,
    isLoading: true,
  });

  const dispatch = useDispatch();
  const {data} = useSelector(state => state.searchgroup);

  useEffect(() => {
    fetchGroups(1);
  }, []);

  useEffect(() => {
    if (!data?.response) {
      setSearchState(prev => ({
        ...prev,
        results: [],
      }));
      return;
    }

    const newResults = data.response || [];

    setSearchState(prev => ({
      ...prev,
      results: prev.isFetchingMore
        ? [...prev.results, ...newResults]
        : newResults,
      hasMoreData: newResults.length > 0,
      isLoading: false,
      isFetchingMore: false,
    }));
  }, [data]);

  const fetchGroups = useCallback(
    currentPage => {
      dispatch(
        SearchGroupAction({search: searchState.query, page: currentPage}),
      );
    },
    [dispatch, searchState.query],
  );

  const submitSearch = useCallback(() => {
    setSearchState(prev => ({...prev, page: 1}));
    fetchGroups(1);
  }, [fetchGroups]);

  const loadMoreGroups = useCallback(() => {
    if (!searchState.isFetchingMore && searchState.hasMoreData) {
      const nextPage = searchState.page + 1;
      setSearchState(prev => ({
        ...prev,
        page: nextPage,
        isFetchingMore: true,
      }));
      fetchGroups(nextPage);
    }
  }, [
    searchState.isFetchingMore,
    searchState.hasMoreData,
    searchState.page,
    fetchGroups,
  ]);

  const handleSearchChange = useCallback(text => {
    setSearchState(prev => ({...prev, query: text}));
  }, []);

  const renderGroupItem = useCallback(
    ({item, index}) => {
      const backgroundColor = [card1Color, card2Color][index % 2];

      return (
        <TouchableOpacity
          style={[styles.card, {backgroundColor}]}
          onPress={() => navigation.navigate('Group Details', {id: item.id})}>
          <Image source={{uri: item.photo_url_main}} style={styles.image} />
          <View style={{flexDirection: 'row', marginLeft: 5}}>
            <View>
              <Text style={styles.heading}>Group Name: </Text>
              <Text style={styles.heading}>Distance: </Text>
            </View>
            <View style={{width: '55%'}}>
              <Text
                style={[
                  styles.text,
                  {color: otherTextColor, fontWeight: '500'},
                ]}
                numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.text}>
                {item?.distance !=null ? `${item.distance} Miles` : 'N/A'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation],
  );

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <DashboardHeader2 title="Search Group" isBack={true} />
      <View style={styles.container}>
        <View style={styles.search}>
          <Icon name="search" size={16} color={otherTextColor} />
          <Text style={{color: otherTextColor}}> | </Text>
          <TextInput
            placeholder="Search"
            placeholderTextColor={otherTextColor}
            value={searchState.query}
            onChangeText={handleSearchChange}
            onSubmitEditing={submitSearch}
            returnKeyType="search"
            style={styles.searchInput}
          />
        </View>
        {searchState.isLoading && !searchState.isFetchingMore ? (
          <ActivityIndicator color={otherTextColor} size={30} />
        ) : searchState.results.length > 0 && data?.totalItemCount > 0 ? (
          <FlatList
            data={searchState.results}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderGroupItem}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMoreGroups}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              searchState.isFetchingMore ? (
                <ActivityIndicator size="small" color={otherTextColor} />
              ) : null
            }
          />
        ) : (
          <Text style={styles.noResultsText}>No groups found</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchGroup;

const styles = StyleSheet.create({
  safeAreaContainer: {flex: 1, backgroundColor: 'white'},
  container: {
    marginHorizontal: 20,
    flex: 1,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  searchInput: {
    flex: 1,
    borderColor: otherTextColor,
    color: 'black',
  },
  card: {
    padding: 10,
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
  },
  image: {
    width: 50,
    height: 50,
    alignSelf: 'center',
    borderRadius: 5,
    backgroundColor: 'lightgrey',
  },
  heading: {
    fontWeight: '500',
    color: 'black',
    margin: 2,
  },
  text: {
    color: 'grey',
    margin: 2,
  },
  noResultsText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
