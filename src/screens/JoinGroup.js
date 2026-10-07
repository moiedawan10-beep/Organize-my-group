import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useMemo, useState} from 'react';
import DashboardHeader2 from '../components/DashboardHeader2';
import {useDispatch, useSelector} from 'react-redux';
import {SearchPrivateGroupAction} from '../redux/slices/SearchPrivateGroupSlice';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Theme from '../constants/Theme';
import {otherTextColor} from '../resources/styling';
import {SafeAreaView} from 'react-native';

const {height} = Dimensions.get('window');

const JoinGroup = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {data} = useSelector(state => state.searchprivategroup);
  const [state, setState] = useState({
    search: '',
    flag: null,
    isSearching: false,
  });

  const updateState = useCallback(updates => {
    setState(prev => ({...prev, ...updates}));
  }, []);

  React.useEffect(() => {
    if (data?.response?.length > 0) {
      updateState({
        flag: true,
        isSearching: false,
      });
    } else {
      updateState({
        flag: false,
        isSearching: false,
      });
    }
  }, [data, updateState]);

  const submitSearch = useCallback(async () => {
    if (state.search?.length > 0) {
      updateState({
        isSearching: true,
        search: '',
      });
      dispatch(SearchPrivateGroupAction(state.search));
    }
  }, [dispatch, state.search, updateState]);

  const viewGroup = useCallback(() => {
    navigation.navigate('Group Details', {id: data?.response[0]?.id});
    updateState({flag: null});
  }, [navigation, data, updateState]);

  useFocusEffect(
    useCallback(() => {
      updateState({flag: null});
    }, [updateState]),
  );

  const groupTitle = useMemo(() => {
    const title = data?.response[0]?.title;
    if (!title) return '';
    return title.length > 15 ? title.slice(0, 10) + '...' : title;
  }, [data]);

  const styles = useMemo(() => createStyles(), []);

  console.log(data, 'dataa');

  const renderGroupCard = useMemo(() => {
    if (state.flag === true) {
      return (
        <TouchableOpacity style={styles.card} onPress={viewGroup}>
          <Image
            source={{uri: data?.response[0]?.photo_url}}
            style={styles.groupImage}
          />
          <View style={styles.groupInfoContainer}>
            <View>
              <Text style={styles.heading}>Group Name: </Text>
              <Text style={styles.heading}>Distance: </Text>
            </View>
            <View>
              <Text style={styles.groupTitle}>{groupTitle}</Text>
              <Text style={styles.distanceText}>
                {data?.response[0]?.distance != null
                  ? `${data.response[0].distance} Miles`
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
    if (state.flag === false) {
      return <Text style={styles.errorText}>Group not found</Text>;
    }
    return null;
  }, [state.flag, styles, viewGroup, data, groupTitle]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <DashboardHeader2 title="Join a Group" isBack={true} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView style={styles.keyboardView}>
          <View style={styles.container}>
            <Text style={[styles.title, styles.centerText]}>
              Enter Group Code
            </Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputField}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter Here"
                  placeholderTextColor="lightgrey"
                  value={state.search}
                  onChangeText={text => updateState({search: text})}
                  onSubmitEditing={submitSearch}
                  returnKeyType="search"
                />
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={submitSearch}
                  disabled={state.isSearching}>
                  {state.isSearching ? (
                    <ActivityIndicator size="small" color={otherTextColor} />
                  ) : (
                    <Icon name="search" size={25} color={otherTextColor} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            {renderGroupCard}
            <Text style={styles.orText}>OR</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Search Group')}>
              <Text style={styles.buttonText}>Search For Public Group</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default React.memo(JoinGroup);

const createStyles = () =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: 'white',
    },
    scrollContent: {
      paddingBottom: 10,
    },
    keyboardView: {
      flex: 1,
    },
    container: {
      flex: 1,
      marginHorizontal: 20,
      marginTop: height * 0.25,
    },
    centerText: {
      alignSelf: 'center',
    },
    inputContainer: {
      marginTop: 20,
    },
    card: {
      padding: 10,
      marginVertical: 10,
      borderRadius: 10,
      flexDirection: 'row',
      backgroundColor: Theme.COLORS.CARD_1_BACKGROUND,
    },
    groupImage: {
      width: 60,
      height: 60,
      borderRadius: 10,
      backgroundColor: 'lightgrey',
    },
    groupInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    heading: {
      fontWeight: '500',
      color: Theme.COLORS.BLACK,
      margin: 2,
      marginLeft: 10,
    },
    title: {
      color: Theme.COLORS.BLACK,
      fontSize: Theme.SIZES.INPUT_TITLE_SIZE,
      fontWeight: '500',
    },
    inputField: {
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      height: 48,
      borderRadius: 10,
      paddingLeft: 15,
      borderColor: Theme.COLORS.INPUT,
    },
    textInput: {
      width: '80%',
      color: Theme.COLORS.BLACK,
    },
    searchButton: {
      padding: 10,
    },
    groupTitle: {
      color: Theme.COLORS.OTHER_BACKGROUND_COLOR,
      fontWeight: '500',
      flexWrap: 'wrap',
      fontSize: Theme.SIZES.EVENT_DETAIL_TEXT_SIZE,
    },
    distanceText: {
      color: 'grey',
      fontSize: Theme.SIZES.EVENT_DETAIL_TEXT_SIZE,
    },
    errorText: {
      color: Theme.COLORS.ERROR,
      marginLeft: 10,
    },
    orText: {
      textAlign: 'center',
      color: Theme.COLORS.OTHER_BACKGROUND_COLOR,
      fontWeight: '500',
      marginTop: 30,
      fontSize: Theme.SIZES.EVENT_DETAIL_TEXT_SIZE,
    },
    button: {
      borderRadius: 10,
      marginTop: 30,
      backgroundColor: Theme.COLORS.BUTTON_1_BACKGROUND,
    },
    buttonText: {
      textAlign: 'center',
      fontSize: Theme.SIZES.BUTTON_TEXT_SIZE,
      padding: 10,
      color: Theme.COLORS.BUTTON_1_TEXT,
      fontWeight: 'bold',
    },
  });
