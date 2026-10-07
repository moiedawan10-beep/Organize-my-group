import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Linking,
  ToastAndroid,
} from 'react-native';
import {Text} from 'react-native';
import {SafeAreaView} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {userProfileAction} from '../redux/slices/UserProfileSlice';
import DashboardHeader2 from '../components/DashboardHeader2';
import ImageModal from '../components/ImageModal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Clipboard from '@react-native-clipboard/clipboard';

const {height} = Dimensions.get('window');

const UserProfile = ({route}) => {
  const {id} = route.params;
  const [imageFullScreen, setImageFullScreen] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const {loading, user} = useSelector(state => state.userprofile);
  const dispatch = useDispatch();

  const handlePhoneLongPress = phoneNumber => {
    Clipboard.setString(phoneNumber);
    ToastAndroid.show(
      `The phone number ${phoneNumber} has been copied to your clipboard.`,
      ToastAndroid.SHORT,
    );
  };

  useEffect(() => {
    dispatch(userProfileAction(id));
  }, [id]);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const handleImagePress = () => {
    setImageFullScreen(true);
  };

  const handlePhonePress = phoneNumber => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <DashboardHeader2 title="User Profile" isBack={true} />
      {loading ? (
        <ActivityIndicator size={40} color="#4F8EF7" />
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity onPress={handleImagePress}>
            {user?.body?.photo_url_main && (
              <Image
                source={{uri: user?.body?.photo_url_main}}
                resizeMode="cover"
                style={styles.imageUploaded}
              />
            )}
          </TouchableOpacity>

          <Animated.View style={[styles.card, {opacity: fadeAnim}]}>
            <View style={styles.infoSection}>
              <Icon name="account" size={20} color="black" />
              <Text style={styles.inputTitle}>First Name:</Text>
              <Text style={styles.inputValue}>{user?.body?.first_name}</Text>
            </View>

            <View style={styles.infoSection}>
              <Icon name="account-outline" size={20} color="black" />
              <Text style={styles.inputTitle}>Last Name:</Text>
              <Text style={styles.inputValue}>{user?.body?.last_name}</Text>
            </View>

            {user?.body?.email && (
              <View style={styles.infoSection}>
                <Icon name="email" size={20} color="black" />
                <Text style={styles.inputTitle}>Email:</Text>
                <Text style={styles.inputValue}>{user?.body?.email}</Text>
              </View>
            )}

            {user?.body?.phone && (
              <View style={styles.infoSection}>
                <Icon name="phone" size={20} color="black" />
                <Text style={styles.inputTitle}>Phone:</Text>
                <TouchableOpacity
                  onPress={() => handlePhonePress(user?.body?.phone)}
                  onLongPress={() => handlePhoneLongPress(user?.body?.phone)}>
                  <Text style={[styles.inputValue, {color: 'blue'}]}>
                    {user?.body?.phone}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      )}
      {imageFullScreen && (
        <ImageModal
          imageUri={user?.body?.photo_url_main}
          imageFullScreen={imageFullScreen}
          setImageFullScreen={setImageFullScreen}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    marginHorizontal: 20,
    marginTop: height * 0.02,
    paddingBottom: height * 0.05,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    paddingTop: 20,
  },
  imageUploaded: {
    width: 150,
    height: 150,
    borderRadius: 100,
    alignSelf: 'center',
    backgroundColor: '#EFEFEF',
    borderWidth: 1,
    borderColor: 'lightgrey',
  },
  card: {
    padding: 20,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  inputValue: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
});

export default UserProfile;
