import React, {useCallback, useMemo} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  Dimensions,
  LayoutAnimation,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {MyGroupsAction} from '../redux/slices/MyGroupsSlice';
import DashboardHeader2 from '../components/DashboardHeader2';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Theme from '../constants/Theme';
import {SafeAreaView} from 'react-native';
import {FAB} from 'react-native-paper';

const {width, height} = Dimensions.get('window');

const MyGroups = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [groups, setGroups] = React.useState([]);
  const {loading, message} = useSelector(state => state.manageGroups);
  const [isFetchingMore, setIsFetchingMore] = React.useState(false);
  const [hasMoreData, setHasMoreData] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [numColumns, setNumColumns] = React.useState(2);
  const [fabOpen, setFabOpen] = React.useState(false);



  const onStateChange = useCallback(({open}) => {
    setFabOpen(open);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setGroups([]);
      setCurrentPage(0);
      setHasMoreData(true);
      loadMoreGroups();
      return () => {
        setGroups([]);
      };
    }, []),
  );

  const loadMoreGroups = useCallback(async () => {
    if (!isFetchingMore && hasMoreData) {
      setIsFetchingMore(true);
      const nextPage = currentPage + 1;
      const data = await dispatch(MyGroupsAction({currentPage: nextPage}));
      if (data?.payload?.body?.response?.length > 0) {
        setGroups(prevGroups => [...prevGroups, ...data.payload.body.response]);
        setCurrentPage(nextPage);
      } else {
        setHasMoreData(false);
      }
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, hasMoreData, currentPage, dispatch]);

  const getColumnStyles = useMemo(() => {
    return {
      widthPerColumn:
        numColumns === 2
          ? width * 0.42
          : numColumns === 3
          ? width * 0.29
          : width * 0.2,
      heightPerCard:
        numColumns === 2
          ? height * 0.21
          : numColumns === 3
          ? height * 0.18
          : height * 0.14,
      padding: numColumns === 2 ? 10 : numColumns === 3 ? 8 : 5,
      marginHorizontal:
        numColumns === 2 ? 12 : numColumns === 3 ? 7 : numColumns === 4 ? 6 : 2,
      imageWidth: numColumns === 2 ? 80 : numColumns === 3 ? 75 : 55,
      imageHeight: numColumns === 2 ? 80 : numColumns === 3 ? 75 : 55,
      iconSize: numColumns === 2 ? 15 : numColumns === 3 ? 10 : 7,
      titleSize: numColumns === 2 ? 14 : numColumns === 3 ? 10 : 8,
      ApprovalSize: numColumns === 2 ? 12 : numColumns === 3 ? 10 : 6,
    };
  }, [numColumns]);

  const colors = useMemo(
    () => [
      Theme.COLORS.CARD_1_BACKGROUND,
      Theme.COLORS.CARD_2_BACKGROUND,
      Theme.COLORS.CARD_2_BACKGROUND,
      Theme.COLORS.CARD_1_BACKGROUND,
    ],
    [],
  );

  const renderItem = useCallback(
    ({item, index}) => {
      const {
        widthPerColumn,
        heightPerCard,
        padding,
        marginHorizontal,
        imageWidth,
        imageHeight,
        iconSize,
        titleSize,
        ApprovalSize,
      } = getColumnStyles;

      const backgroundColor = colors[index % 4];

      return (
        <TouchableOpacity
          style={[
            styles.container,
            {
              width: widthPerColumn,
              height: heightPerCard,
              padding,
              marginHorizontal,
              backgroundColor,
            },
          ]}
          onPress={() => navigation.navigate('Group Details', {id: item.id})}>
          {!!item.is_owner && (
            <View style={styles.ownerView}>
              <FontAwesome5 name="crown" size={iconSize} color={'red'} />
            </View>
          )}

          <View style={styles.card}>
            <Image
              source={{uri: item.photo_url_main}}
              style={{
                width: imageWidth,
                height: imageHeight,
                marginBottom: 5,
                borderRadius: 6,
                backgroundColor: 'lightgrey',
              }}
            />
          </View>
          <Text style={[styles.text, {fontSize: titleSize}]} numberOfLines={1}>
            {item.title}
          </Text>
          {!!item.is_owner && item.approved === 0 && (
            <Text
              style={{
                color: 'red',
                textAlign: 'center',
                fontSize: ApprovalSize,
              }}>
              {' '}
              Pending Approval
            </Text>
          )}
        </TouchableOpacity>
      );
    },
    [getColumnStyles, colors, navigation],
  );

  const handleColumnChange = useCallback(columns => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setNumColumns(columns);
    setFabOpen(false);
  }, []);

  const fabActions = useMemo(
    () => [
      {
        icon: 'numeric-2',
        onPress: () => handleColumnChange(2),
        color: 'black',
        style: {backgroundColor: 'white'},
      },
      {
        icon: 'numeric-3',
        onPress: () => handleColumnChange(3),
        color: 'black',
        style: {backgroundColor: 'white'},
      },
      {
        icon: 'numeric-4',
        onPress: () => handleColumnChange(4),
        color: 'black',
        style: {backgroundColor: 'white'},
      },
    ],
    [handleColumnChange],
  );

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <DashboardHeader2 title="My Groups" isBack={true} />
      <View style={styles.maincontainer}>
        {loading && groups?.length === 0 ? (
          <ActivityIndicator
            color={Theme.COLORS.OTHER_BACKGROUND_COLOR}
            size={50}
          />
        ) : groups?.length > 0 ? (
          <FlatList
            key={numColumns}
            data={groups}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListStyle}
            onEndReached={loadMoreGroups}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingMore ? (
                <ActivityIndicator
                  size="small"
                  color={Theme.COLORS.OTHER_BACKGROUND_COLOR}
                />
              ) : null
            }
          />
        ) : (
          <View style={styles.createGroupView}>
            <Text style={styles.messageText}>{message}</Text>
            <TouchableOpacity
              style={styles.pressStyle}
              onPress={() => navigation.navigate('Create Group')}>
              <Text style={styles.createText}>Create Group</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

     

      {groups && groups.length > 0 && (
        <FAB.Group
          open={fabOpen}
          visible
          color="black"
          fabStyle={styles.fabButtonstyle}
          backdropColor="rgba(0, 0, 0, 0.5)"
          icon={fabOpen ? 'window-close' : 'view-grid-outline'}
          variant="secondary"
          theme={{roundness: 50, colors: {onTertiary: 'red', onPrimary: 'red'}}}
          actions={fabActions}
          onStateChange={onStateChange}
          onPress={() => {}}
        />
      )}
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  maincontainer: {
    alignSelf: 'center',
  },
  safeAreaContainer: {flex: 1, backgroundColor: 'white'},
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: height * 0.025,
  },
  card: {},
  flatListStyle: {paddingBottom: 150},
  text: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 5,
    color: 'black',
  },
  ownerView: {position: 'absolute', top: 5, left: 5, zIndex: 20},
  createGroupView: {alignSelf: 'center', paddingVertical: 15},
  messageText: {color: 'red'},
  pressStyle: {paddingHorizontal: 10, alignSelf: 'center'},
  createText: {
    color: Theme.COLORS.SKY,
    textDecorationLine: 'underline',
  },
  fabButtonstyle: {
    backgroundColor: 'white',
    height: 45,
    width: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MyGroups;
