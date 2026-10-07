import {
  Dimensions,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DashboardHeader2 from '../components/DashboardHeader2';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Text} from 'react-native';
import {
  button1backgroundColor,
  button1TextColor,
  buttonTextSize,
  EventDetailTextSize,
  InputBorderColor,
  InputTitleSize,
  otherTextColor,
} from '../resources/styling';
import Icon2 from 'react-native-vector-icons/Ionicons';
import {useSelector, useDispatch} from 'react-redux';
import {userInfo} from '../redux/slices/userInfoSlice';
import {UpdateProfileAction} from '../redux/slices/UpdateProfileSlice';
import {DeleteUserAction} from '../redux/slices/DeleteUserSlice';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlertModal from '../components/CustomAlertModal';
import {SafeAreaView} from 'react-native';
import ImageModal from '../components/ImageModal';
import MessageModal from '../components/MessageModal';
import {TextInput as PaperInput} from 'react-native-paper';
import ImagePickerModal from '../components/ImagePickerModal';
import CustomInput from '../components/CustomInputField';

const {height} = Dimensions.get('window');

const Profile = ({route}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.userInfo);
  const {old_password} = route.params;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneno, setPhoneno] = useState('');
  const [zipcode, setZipCode] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [profilePickerFlag, setProfilePickerFlag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('*');
  const [texterror, setTextError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
  const [imageFullScreen, setImageFullScreen] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [modalTitle, setModalTitle] = useState('Message');
  const [modalIcon, setModalIcon] = useState('notifications');
  const [iconColor, setIconColor] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [responseMessgae, setResponseMessgae] = useState('');

  const showModal = (title, message, iconName, iconColorProps) => {
    setModalTitle(title);
    setResponseMessgae(message);
    setModalVisible(true);
    setModalIcon(iconName);
    setIconColor(iconColorProps);
  };

  useEffect(() => {
    dispatch(userInfo());
  }, []);

  useEffect(() => {
    if (user && user.body) {
      setFirstName(user.body.first_name || '');
      setLastName(user.body.last_name || '');
      setEmail(user.body.email || '');
      setPhoneno(user.body.phone || '');
      setZipCode(user.body.zip_code || '');
      setImageUri(user.body.photo_url_profile || null);
      setConfirmPassword('');
      setError('*');
      setTextError('');
      setNewPassword('');
    }
  }, [user]);

  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const passwordvalidity = password => {
    const specialCharacters = /[!@#$%^&*(),.?":{}|<>]/;
    return password.length >= 8 && specialCharacters.test(password);
  };

  const submitData = async () => {
    if (!firstName || !lastName || !email || phoneno === '+1' || !zipcode) {
      setError('Required field');
      setTextError('Missing required fields');
      return;
    }
    setError('');
    if (!isValidEmail(email)) {
      setTextError('Please enter valid email address');
      return;
    }
    if (zipcode.length < 5) {
      setTextError('Zip code must be of 5 digits');
      return;
    }
    if (phoneno.length <= 11 || phoneno.length >= 16) {
      setTextError('Please enter valid phone number');
      return;
    }
    if (newPassword !== confirmPassword) {
      setTextError('Passwords do not match');
      return false;
    }
    if (!passwordvalidity(newPassword) && newPassword) {
      setTextError(
        'Password must be a minimum of 8 characters and contain at least one special character',
      );
      return;
    }
    setTextError('');
    setLoading(true);
    const payload = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phoneno,
      zip_code: zipcode,
      imageUri: imageUri,
      newpassword: newPassword,
      old_password: newPassword ? old_password : '',
    };
    const response = await dispatch(UpdateProfileAction(payload));
    if (response?.payload?.status_code === 200) {
      showModal(
        'Success',
        'Profile updated successfully',
        'checkmark-circle-outline',
        '#4CAF50',
      );
      setConfirmPassword('');
      setNewPassword('');
      setError('*');
      setTextError('');
    } else {
      showModal(
        'Failure',
        'Network Error! Please Try Again.',
        'alert-circle-sharp',
        'red',
      );
    }
    setLoading(false);
  };

  const submitDeleteUser = async () => {
    const response = await dispatch(DeleteUserAction(user?.body?.id));
    if (response?.payload?.status_code === 204) {
      Alert.alert('Message', 'Your Accout has been successfully deleted');
      setIsDeleteAlertVisible(false);
      await AsyncStorage.removeItem('accessToken');
      navigation.reset({
        index: 0,
        routes: [{name: 'Selection'}],
      });
    } else {
      setIsDeleteAlertVisible(false);
      showModal(
        'Request Declined',
        response.payload?.body?.message,
        'alert-circle-sharp',
        'red',
      );
    }
  };

  const handleCancel = () => {
    setIsDeleteAlertVisible(false);
  };

  const handleImagePress = () => {
    setImageFullScreen(true);
  };

  const handleOkayPress = () => {
    setModalVisible(false);
  };

  const validatePhoneNumber = text => {
    if (text === '' || text[0] !== '+' || text[1] !== '1' || text.length < 2) {
      setPhoneno('+1');
    } else {
      const sanitizedText = text.replace(/[^0-9+]/g, '');
      setPhoneno(sanitizedText);
    }
  };

  const handleCancelProfile = () => {
    setNewPassword('');
    setConfirmPassword('');
    setNewPasswordVisible(false);
    setConfirmPasswordVisible(false);
    setConfirmPasswordError('');
    setTextError('');
    navigation.navigate('DashboardHome');
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <DashboardHeader2 title="My Profile" isBack={true} />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView style={styles.keyboardStyle}>
          {/* IMAGE */}
          {imageUri ? (
            <TouchableOpacity
              onPress={handleImagePress}
              style={styles.imageupload}>
              <Image
                source={{uri: imageUri}}
                resizeMode="cover"
                style={styles.imageuploaded}
              />
              <View style={styles.cameraIconContainer}>
                <TouchableOpacity
                  onPress={() => setProfilePickerFlag(true)}
                  style={styles.cameraIcon}>
                  <Icon2 name="camera-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.imageupload}
              onPress={() => setProfilePickerFlag(true)}>
              <Icon2 name="camera-outline" size={30} color="#848484" />
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => setProfilePickerFlag(true)}>
            <Text style={styles.deleteText}>Change Profile Image</Text>
          </TouchableOpacity>

          {/* First Name */}
          <CustomInput
            label="First Name"
            value={firstName}
            onChange={text => {
              const filteredText = text.replace(/[^A-Za-z ]/g, '');
              setFirstName(filteredText);
            }}
            required={true}
            showError={!!texterror}
          />

          {/* Last Name */}
          <CustomInput
            label="Last Name"
            value={lastName}
            onChange={text => {
              const filteredText = text.replace(/[^A-Za-z ]/g, '');
              setLastName(filteredText);
            }}
            required={true}
            showError={!!texterror}
          />

          {/* Email */}
          <CustomInput
            label="Email"
            value={email}
            onChange={text => setEmail(text)}
            required={true}
            showError={!!texterror}
          />

          {/* Phone No */}
          <CustomInput
            label="Phone Number"
            value={phoneno}
            maxLength={12}
            keyboardType="number-pad"
            onChange={validatePhoneNumber}
            required={true}
            showError={!!texterror}
          />

          {/* Zip Code */}
          <CustomInput
            label="Zip Code"
            value={String(zipcode)}
            onChange={text => {
              const sanitizedText = text.replace(/[^0-9]/g, '');
              setZipCode(sanitizedText);
            }}
            keyboardType={'numeric'}
            maxLength={5}
            required={true}
            showError={!!texterror}
          />

          {/* NEW PASSWORD FIELD */}
          <View style={styles.passwordView}>
            <Text style={styles.inputTitle}>New Password: </Text>
            <View style={styles.inputField}>
              <PaperInput
                mode="flat"
                value={newPassword}
                placeholder="Enter new password"
                placeholderTextColor="lightgrey"
                secureTextEntry={!newPasswordVisible}
                onChangeText={text => setNewPassword(text)}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                style={styles.passwordInputField}
                autoCapitalize="none"
                autoCorrect={false}
                textColor="black"
                cursorColor="lightgreen"
              />
              <TouchableOpacity
                style={styles.passwordopacity}
                onPress={() => setNewPasswordVisible(!newPasswordVisible)}>
                <Icon
                  name={newPasswordVisible ? 'visibility' : 'visibility-off'}
                  size={19}
                  color="#555"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* CONFIRM NEW PASSWORD FIELD */}
          <View style={styles.passwordView}>
            <Text style={styles.inputTitle}>Confirm New Password: </Text>
            <View style={styles.inputField}>
              <PaperInput
                mode="flat"
                value={confirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="lightgrey"
                secureTextEntry={!confirmPasswordVisible}
                onChangeText={text => setConfirmPassword(text)}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                style={styles.passwordInputField}
                autoCapitalize="none"
                autoCorrect={false}
                textColor="black"
                cursorColor="lightgreen"
              />
              <TouchableOpacity
                style={styles.passwordopacity}
                onPress={() =>
                  setConfirmPasswordVisible(!confirmPasswordVisible)
                }>
                <Icon
                  name={
                    confirmPasswordVisible ? 'visibility' : 'visibility-off'
                  }
                  size={19}
                  color="#555"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* BUTTON */}
          {texterror ? (
            <Text style={styles.errorText2}>{texterror}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.button}
            onPress={loading ? null : submitData}>
            {loading ? (
              <ActivityIndicator color="white" size={43} />
            ) : (
              <Text style={styles.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleCancelProfile}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsDeleteAlertVisible(true)}>
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>

      {/* Image Picker Modal */}
      {profilePickerFlag && (
        <ImagePickerModal
          visible={profilePickerFlag}
          setVisible={val => setProfilePickerFlag(val)}
          setImageUri={uri => setImageUri(uri)}
        />
      )}

      {isDeleteAlertVisible && (
        <CustomAlertModal
          visible={isDeleteAlertVisible}
          onClose={() => setIsDeleteAlertVisible(false)}
          onOperation={submitDeleteUser}
          onCancel={handleCancel}
          title={'Delete User'}
          subtitle={'Are you sure you want to delete user?'}
          operationButtonLabel={'Delete'}
          IconName="account-minus"
        />
      )}
      {imageFullScreen && (
        <ImageModal
          imageUri={imageUri}
          imageFullScreen={imageFullScreen}
          setImageFullScreen={setImageFullScreen}
        />
      )}
      {modalVisible && (
        <MessageModal
          visible={modalVisible}
          title={modalTitle}
          message={responseMessgae}
          onClose={handleOkayPress}
          IconName={modalIcon}
          iconColor={iconColor}
        />
      )}
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  safeAreaContainer: {flex: 1, backgroundColor: 'white'},
  container: {
    marginHorizontal: 20,
    marginTop: height * 0.02,
    paddingBottom: height * 0.05,
  },
  keyboardStyle: {flex: 1},
  title: {
    color: 'black',
    fontSize: 19,
    fontWeight: '500',
  },
  passwordView: {marginTop: 20},
  cameraIconContainer: {
    position: 'absolute',
    bottom: -5,
    right: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 5,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  text: {
    color: 'grey',
    fontSize: EventDetailTextSize,
  },
  button: {
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: button1backgroundColor,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: buttonTextSize,
    padding: 10,
    color: button1TextColor,
    fontWeight: 'bold',
  },
  imageupload: {
    backgroundColor: '#C9C9C9',
    marginTop: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    width: 100,
    height: 100,
  },
  imageuploaded: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
  },
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
    paddingLeft: 15,
    borderColor: InputBorderColor,
    color: 'black',
  },
  errorText: {
    color: 'red',
    alignSelf: 'center',
    marginRight: 20,
  },
  passwordopacity: {
    alignSelf: 'center',
    marginRight: 15,
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 150,
    backgroundColor: 'lightgrey',
    justifyContent: 'center',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: -5,
    right: 10,
    backgroundColor: 'transparent',
    padding: 10,
  },
  modaltitle: {
    alignSelf: 'center',
    fontSize: 20,
    position: 'relative',
    top: -15,
    fontWeight: '500',
    color: 'black',
  },
  modalbuttoncontainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalicons: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'grey',
  },
  errorText2: {
    color: 'red',
    marginVertical: 10,
    marginLeft: 5,
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
  passwordInputField: {
    width: '80%',
    height: 48,
    color: 'black',
    textAlign: 'left',
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginBottom: 10,
    backgroundColor: 'transparent',
    fontSize: 14,
  },
  TitleBox: {
    flexDirection: 'row',
    // flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 20,
    color: 'black',
  },
  deleteText: {
    textAlign: 'center',
    color: otherTextColor,
    marginTop: 10,
    fontWeight: '500',
  },
});
