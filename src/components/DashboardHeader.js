import {
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  View,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import React, {useEffect, useState, useCallback, memo} from 'react';
import {
  button1TextColor,
  buttonTextSize,
  headerTitleColor,
  InputBorderColor,
  InputTitleSize,
} from '../resources/styling';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {userInfo} from '../redux/slices/userInfoSlice';
import {NotifcationsAction} from '../redux/slices/NotificationSlice';
import Theme from '../constants/Theme';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import {CheckPasswordAction} from '../redux/slices/CheckPasswordSlice';
import CustomAlertModal from './CustomAlertModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logoutUser} from '../redux/slices/LogoutSlice';
import {TextInput as PaperInput} from 'react-native-paper';

const defaulturl =
  'http://app.organizemygroup.com/default/img/nophoto_user_profile.png';

const DashboardHeader = ({dropdownVisible, toggleDropdown}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {profileImage} = useSelector(state => state.userInfo);
  const {notifications} = useSelector(state => state.MyNotifications);
  const [count, setCount] = useState(null);
  const [viewProfileFlag, setViewProfileFlag] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState(null);

  const fetchNotifications = useCallback(async () => {
    const response = await dispatch(NotifcationsAction());
    setCount(response?.payload?.body?.unread);
  }, [dispatch]);

  const fetchUserInfo = useCallback(async () => {
    await dispatch(userInfo({navigation}));
  }, [dispatch, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchNotifications);
    return unsubscribe;
  }, [navigation, fetchNotifications]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchUserInfo);
    return unsubscribe;
  }, [navigation, fetchUserInfo]);

  const SubmitViewProfileRequest = useCallback(async () => {
    if (!password) {
      setErrorMessage('Please Provide Password');
      return;
    }
    setPasswordLoading(true);
    const response = await dispatch(CheckPasswordAction({password}));
    setPasswordLoading(false);
    if (response?.payload?.status_code) {
      navigation.navigate('Profile', {old_password: password});
      setPassword('');
      setViewProfileFlag(false);
    } else {
      setErrorMessage('Incorrect Password');
    }
  }, [password, dispatch, navigation]);

  const handleLogout = useCallback(async () => {
    try {
      const response = await dispatch(logoutUser());
      if (response !== undefined) {
        await Promise.all([
          AsyncStorage.removeItem('accessToken'),
          AsyncStorage.removeItem('fcmToken'),
        ]);
        navigation.reset({
          index: 0,
          routes: [{name: 'Selection'}],
        });
      }
    } catch (error) {
      console.log('Error', error);
    }
  }, [dispatch, navigation]);

  const showAlert = useCallback(type => {
    setAlertType(type);
    setAlertVisible(true);
  }, []);

  const onLogoutConfirm = useCallback(() => {
    handleLogout();
    setAlertVisible(false);
  }, [handleLogout]);

  const onLogoutCancel = useCallback(() => {
    setAlertVisible(false);
  }, []);

  const resetState = useCallback(() => {
    setViewProfileFlag(false);
    setErrorMessage('');
    setPassword('');
    setAlertVisible(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      return resetState;
    }, [resetState]),
  );

  const handlePasswordChange = useCallback(
    text => {
      setPassword(text);
      if (errorMessage) {
        setErrorMessage('');
      }
    },
    [errorMessage],
  );

  const togglePasswordVisibility = useCallback(() => {
    setPasswordVisible(prev => !prev);
  }, []);

  const handleProfileEdit = useCallback(() => {
    setViewProfileFlag(true);
  }, []);

  const closeViewProfile = useCallback(() => {
    setViewProfileFlag(false);
    setErrorMessage('');
    setPassword('');
  }, []);

  const navigateToNotifications = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={toggleDropdown}>
        {profileImage === defaulturl ? (
          <Icon name="user-circle" size={40} color={headerTitleColor} />
        ) : (
          profileImage && (
            <Image source={{uri: profileImage}} style={styles.profileImage} />
          )
        )}
      </TouchableOpacity>

      {dropdownVisible && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity
            style={styles.dropdownOption}
            onPress={handleProfileEdit}>
            <View style={styles.dropdownRow}>
              <Text style={styles.dropdownText}>Edit Profile</Text>
              <Icon2 name="create" color={'#2CA7D5'} size={15} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownOption}
            onPress={() => showAlert('logout')}>
            <View style={styles.dropdownRow}>
              <Text style={styles.dropdownText}>Logout</Text>
              <Icon2 name="logout" color={'red'} size={15} />
            </View>
          </TouchableOpacity>
        </View>
      )}
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <TouchableOpacity
        style={[styles.backbutton, styles.notificationButton]}
        onPress={navigateToNotifications}>
        <Image
          source={require('../assets/bell.png')}
          style={styles.bellIcon}
          resizeMode="contain"
        />
        <View style={styles.bellPartContainer}>
          <Image
            source={require('../assets/bellpart.png')}
            style={styles.bellPart}
            resizeMode="contain"
          />
        </View>
        {count > 0 && <Text style={styles.dot}>{count}</Text>}
      </TouchableOpacity>
      {viewProfileFlag && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={viewProfileFlag}
          onRequestClose={closeViewProfile}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text style={styles.inputTitle}>Confirm Password:</Text>
              <View style={styles.inputField}>
                <PaperInput
                  mode="flat"
                  value={password}
                  placeholder="Enter Password..."
                  placeholderTextColor="grey"
                  secureTextEntry={!passwordVisible}
                  onChangeText={text => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    bottom: 5,
                    right: 10,
                    fontSize: 14,
                  }}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  cursorColor="lightgreen"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textColor="black"
                />
                <TouchableOpacity
                  style={styles.passwordopacity}
                  onPress={togglePasswordVisibility}>
                  <Icon2
                    name={passwordVisible ? 'visibility' : 'visibility-off'}
                    size={19}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              <View style={styles.deleteGroupModalButtonContainer}>
                <TouchableOpacity
                  onPress={closeViewProfile}
                  style={[styles.button, styles.cancelButton]}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={SubmitViewProfileRequest}
                  style={[styles.button, styles.confirmButton]}>
                  {passwordLoading ? (
                    <ActivityIndicator
                      size={25}
                      color="white"
                      style={styles.loader}
                    />
                  ) : (
                    <Text style={styles.buttonText}>Confirm</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      {alertVisible && (
        <CustomAlertModal
          visible={alertVisible}
          onClose={() => setAlertVisible(false)}
          onOperation={onLogoutConfirm}
          onCancel={onLogoutCancel}
          title="Organize My Group"
          subtitle="Are you sure you want to log out?"
          operationButtonLabel="Yes"
          cancelButtonLabel="No"
          IconName="logout"
        />
      )}
    </View>
  );
};

export default memo(DashboardHeader);

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    backgroundColor: 'white',
    height: 70,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'lightgrey',
  },
  backbutton: {
    borderWidth: 1,
    width: 48,
    height: 48,
    borderColor: 'lightgrey',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
    backgroundColor: 'red',
    paddingHorizontal: 5,
    borderRadius: 10,
    fontWeight: 'bold',
    right: 7,
    top: 5,
    position: 'absolute',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 55,
    left: 40,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    width: 130,
    zIndex: 999,
  },
  dropdownOption: {
    padding: 7,
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: buttonTextSize,
    padding: 10,
    color: button1TextColor,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: 300,
    borderRadius: 10,
    alignItems: 'center',
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
  passwordInput: {
    width: '90%',
    color: 'black',
  },
  inputTitle: {
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    fontSize: InputTitleSize,
    color: 'black',
    marginBottom: 2,
  },
  deleteGroupModalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  loader: {padding: 7},
  errorText: {color: 'red', marginBottom: 10},
  passwordopacity: {alignSelf: 'center', marginRight: 15},
  dropdownRow: {flexDirection: 'row', justifyContent: 'space-between'},
  dropdownText: {fontSize: 13, color: 'black'},
  button: {borderRadius: 10, marginTop: 20, width: '49%'},
  cancelButton: {backgroundColor: Theme.COLORS.OTHER_BACKGROUND_COLOR},
  confirmButton: {backgroundColor: Theme.COLORS.BUTTON_1_BACKGROUND},
  logo: {width: 120, height: 45},
  notificationButton: {flexDirection: 'row'},
  bellIcon: {width: 23, height: 23, bottom: 3},
  bellPartContainer: {position: 'absolute', bottom: 8},
  bellPart: {width: 10, height: 10},
});
