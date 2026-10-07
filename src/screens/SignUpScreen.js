import React, {useState, useRef, useEffect} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  PermissionsAndroid,
} from 'react-native';
import {
  button1backgroundColor,
  button1TextColor,
  buttonTextSize,
  InputBorderColor,
  InputTitleSize,
  otherTextColor,
  PageTitleColor,
  PageTitleSize,
} from '../resources/styling';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/Ionicons';
import {signUpUser} from '../redux/slices/signUpSlice';
import {useDispatch, useSelector} from 'react-redux';
import {client_id, client_secret} from '../constants/configs';
import {SafeAreaView} from 'react-native';
import ImageModal from '../components/ImageModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getMessaging} from '@react-native-firebase/messaging';
import {TextInput as PaperInput} from 'react-native-paper';
import ImagePickerModal from '../components/ImagePickerModal';

const {width, height} = Dimensions.get('window');

const SignUpScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneno, setPhoneno] = useState('+1');
  const [zipCode, setZipCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [error, setError] = useState('*');
  const [errorColor, setErrorColor] = useState('red');
  const [texterror, setTextError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [imagePickerFlag, setImagePickerFlag] = useState(false);
  const [imageFullScreen, setImageFullScreen] = useState(false);
  const [timeZone, setTimeZone] = useState('');
  const [firbaseToken, setFirbaseToken] = useState();

  const errorStyle = StyleSheet.flatten([
    styles.errorText,
    {color: errorColor},
  ]);

  //Used to get user Timezone
  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimeZone(zone);
  }, []);

  //REFS
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const phonenoRef = useRef(null);
  const zipCodeRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmpasswordRef = useRef(null);

  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const passwordvalidity = password => {
    const specialCharacters = /[!@#$%^&*(),.?":{}|<>]/;
    return password.length >= 8 && specialCharacters.test(password);
  };

  const getToken = async () => {
    try {
      const token = await getMessaging().getToken();
      setFirbaseToken(token);
      await AsyncStorage.setItem('fcmToken', token);
    } catch (error) {
      console.error('Error getting Firebase token:', error);
    }
  };

  useEffect(() => {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    getToken();
  }, []);

  const signUpNow = async () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneno ||
      !zipCode ||
      !password ||
      !confirmpassword
    ) {
      setError('Field required');
      setErrorColor('red');
    }
    if (!firstName.trim()) {
      firstNameRef.current.focus();
      return;
    }
    if (!lastName.trim()) {
      lastNameRef.current.focus();
      return;
    }
    if (!email.trim()) {
      emailRef.current.focus();
      return;
    }
    if (!phoneno.trim()) {
      phonenoRef.current.focus();
      return;
    }
    if (!zipCode.trim()) {
      zipCodeRef.current.focus();
      return;
    }
    if (!password.trim()) {
      passwordRef.current.focus();
      return;
    }
    if (!confirmpassword.trim()) {
      confirmpasswordRef.current.focus();
      return;
    }
    setError('');
    if (!isValidEmail(email)) {
      setTextError('Please enter valid email address');
      emailRef.current.focus();
      return;
    }
    if (phoneno.length <= 11 || phoneno.length >= 15) {
      setTextError('Please enter valid phone number');
      phonenoRef.current.focus();
      return;
    }
    if (zipCode.length <= 4) {
      setTextError('Zip code must be of 5 digits');
      zipCodeRef.current.focus();
      return;
    }
    if (!passwordvalidity(password)) {
      setTextError(
        'Password must be a minimum of 8 characters and contain at least one special character',
      );
      passwordRef.current.focus();
      return;
    }
    if (!passwordvalidity(confirmpassword)) {
      setTextError(
        'Password must be a minimum of 8 characters and contain at least one special character',
      );
      confirmpasswordRef.current.focus();
      return;
    }
    if (password !== confirmpassword) {
      setTextError(
        'Oops! The passwords you entered don’t match. Please double-check and try again. ',
      );
      confirmpasswordRef.current.focus();
      return;
    }
    setTextError('');
    try {
      setLoading(true);
      const payload = {
        grant_type: 'password',
        client_id: client_id,
        client_secret: client_secret,
        first_name: firstName,
        last_name: lastName,
        email: email,
        username: email,
        phone: phoneno,
        zip_code: zipCode,
        password: password,
        terms: true,
        imageUri: imageUri,
        scope: '',
        timezone: timeZone,
        pushId: firbaseToken,
        pushType: 'android',
      };
      const response = await dispatch(signUpUser(payload));
      if (response?.payload?.body?.message) {
        navigation.navigate('Verify Now', {data: response});
      }
      setLoading(false);
    } catch (error) {
      console.error('Signup error:', error);
      setLoading(false);
    }
  };

  const handleImagePress = () => {
    setImageFullScreen(true);
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backbutton}
          onPress={() => navigation.goBack()}>
          <Icon name="keyboard-arrow-left" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Sign Up</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <KeyboardAvoidingView style={styles.keyBoardStyle}>
            {imageUri ? (
              <TouchableOpacity
                onPress={handleImagePress}
                style={styles.imageupload}>
                <Image
                  source={{uri: imageUri}}
                  resizeMode="cover"
                  style={styles.imageuploaded}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.imageupload}
                onPress={() => setImagePickerFlag(true)}>
                <Icon2 name="camera-outline" size={30} color="#848484" />
              </TouchableOpacity>
            )}

            {imageUri ? (
              <TouchableOpacity onPress={() => setImagePickerFlag(true)}>
                <Text style={styles.changeImageText}>Change Photo</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.uploadText}>Upload a photo</Text>
            )}

            <View style={styles.TitleBox}>
              <Text style={styles.inputTitle}>First Name: </Text>
              {firstName.length === 0 && error ? (
                <Text style={errorStyle}>{error}</Text>
              ) : null}
            </View>
            <View style={styles.inputField}>
              <TextInput
                ref={firstNameRef}
                style={styles.inputStyle}
                placeholder="Enter Here"
                placeholderTextColor="lightgrey"
                value={firstName}
                onChangeText={text => {
                  const filteredText = text.replace(/[^A-Za-z ]/g, '');
                  setFirstName(filteredText);
                }}
                keyboardType="default"
                returnKeyType="next"
                onSubmitEditing={() => lastNameRef.current.focus()}
              />
            </View>

            <View style={styles.TitleBox}>
              <Text style={styles.inputTitle}>Last Name: </Text>
              {lastName.length === 0 && error ? (
                <Text style={errorStyle}>{error}</Text>
              ) : null}
            </View>
            <View style={styles.inputField}>
              <TextInput
                ref={lastNameRef}
                style={styles.inputStyle}
                placeholder="Enter Here"
                placeholderTextColor="lightgrey"
                value={lastName}
                onChangeText={text => {
                  const filteredText = text.replace(/[^A-Za-z ]/g, '');
                  setLastName(filteredText);
                }}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current.focus()}
              />
            </View>

            <View style={styles.TitleBox}>
              <Text style={styles.inputTitle}>Email: </Text>
              {email.length === 0 && error ? (
                <Text style={errorStyle}>{error}</Text>
              ) : null}
            </View>
            <View style={styles.inputField}>
              <TextInput
                ref={emailRef}
                style={styles.inputStyle}
                placeholder="Enter email"
                placeholderTextColor="lightgrey"
                value={email}
                onChangeText={text => setEmail(text)}
                returnKeyType="next"
                onSubmitEditing={() => phonenoRef.current.focus()}
              />
            </View>

            <View style={styles.TitleBox}>
              <Text style={styles.inputTitle}>Phone Number: </Text>
              {phoneno === '+1' && error ? (
                <Text style={errorStyle}>{error}</Text>
              ) : null}
            </View>
            <View style={styles.inputField}>
              <TextInput
                ref={phonenoRef}
                style={styles.inputStyle}
                placeholder="Enter Your Number"
                placeholderTextColor="lightgrey"
                value={phoneno}
                maxLength={12}
                keyboardType="numeric"
                onChangeText={text => {
                  if (
                    text === '' ||
                    text[0] !== '+' ||
                    text[1] !== '1' ||
                    text.length < 2
                  ) {
                    setPhoneno('+1');
                  } else {
                    const sanitizedText = text.replace(/[^0-9+]/g, '');
                    setPhoneno(sanitizedText);
                  }
                }}
                returnKeyType="next"
                onSubmitEditing={() => zipCodeRef.current.focus()}
              />
            </View>
            <View style={styles.TitleBox}>
              <Text style={styles.inputTitle}>Zip Code: </Text>
              {zipCode.length === 0 && error ? (
                <Text style={errorStyle}>{error}</Text>
              ) : null}
            </View>
            <View style={styles.inputField}>
              <TextInput
                ref={zipCodeRef}
                style={styles.inputStyle}
                placeholder="Enter Code"
                placeholderTextColor="lightgrey"
                value={zipCode}
                maxLength={5}
                keyboardType="numeric"
                onChangeText={text => {
                  const sanitizedText = text.replace(/[^0-9]/g, '');
                  setZipCode(sanitizedText);
                }}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current.focus()}
              />
            </View>

            <View style={styles.TitleBox}>
              <Text style={styles.inputTitle}>Password: </Text>
              {password.length === 0 && error ? (
                <Text style={errorStyle}>{error}</Text>
              ) : null}
            </View>
            <View style={styles.inputField}>
              {/* <TextInput
                style={{
                  width: '80%',
                  height: 48,
                  color: 'black',
                  textAlign: 'left',
                  paddingVertical: 0,
                  paddingHorizontal: 0,
                }}
                ref={passwordRef}
                placeholder="Enter Password"
                placeholderTextColor="lightgrey"
                value={password}
                secureTextEntry={passwordVisible}
                onChangeText={text => setPassword(text)}
                keyboardType="default"
                returnKeyType="next"
                onSubmitEditing={() => confirmpasswordRef.current.focus()}
              /> */}
              <PaperInput
                mode="flat"
                ref={passwordRef}
                style={styles.paperInputStyle}
                value={password}
                placeholder="Enter Password"
                placeholderTextColor="lightgrey"
                secureTextEntry={!passwordVisible}
                onChangeText={text => setPassword(text)}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                autoCapitalize="none"
                autoCorrect={false}
                textColor="black"
                onSubmitEditing={() => confirmpasswordRef.current.focus()}
                cursorColor="lightgreen"
              />
              <TouchableOpacity
                style={styles.passwordopacity}
                onPress={() => setPasswordVisible(!passwordVisible)}>
                {passwordVisible ? (
                  <Icon name="visibility" size={19} color="#555" />
                ) : (
                  <Icon name="visibility-off" size={19} color="#555" />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.passwordText}>
              Password must be a minimum of 8 characters and contain at least
              one special character
            </Text>

            <View style={styles.TitleBox}>
              <Text style={styles.inputTitle}>Confirm Password: </Text>
              {confirmpassword.length === 0 && error ? (
                <Text style={errorStyle}>{error}</Text>
              ) : null}
            </View>
            <View style={styles.inputField}>
              {/* <TextInput
                ref={confirmpasswordRef}
                style={{width: '80%', color: 'black'}}
                placeholder="Confirm Password"
                placeholderTextColor="lightgrey"
                value={confirmpassword}
                keyboardType="default"
                secureTextEntry={confirmPasswordVisible}
                onChangeText={text => setConfirmPassword(text)}
                returnKeyType="next"
                onSubmitEditing={() => signUpNow}
              /> */}
              <PaperInput
                mode="flat"
                ref={confirmpasswordRef}
                style={styles.paperInputStyle}
                value={confirmpassword}
                placeholder="Confirm Password"
                placeholderTextColor="lightgrey"
                secureTextEntry={!confirmPasswordVisible}
                onChangeText={text => setConfirmPassword(text)}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                autoCapitalize="none"
                autoCorrect={false}
                textColor="black"
                onSubmitEditing={() => signUpNow}
                cursorColor="lightgreen"
              />
              <TouchableOpacity
                style={styles.passwordopacity}
                onPress={() =>
                  setConfirmPasswordVisible(!confirmPasswordVisible)
                }>
                {confirmPasswordVisible ? (
                  <Icon name="visibility" size={19} color="#555" />
                ) : (
                  <Icon name="visibility-off" size={19} color="#555" />
                )}
              </TouchableOpacity>
            </View>
            {texterror ? (
              <Text style={styles.errorText2}>{texterror}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.button}
              onPress={loading ? null : signUpNow}>
              {loading ? (
                <ActivityIndicator color="white" size={43} />
              ) : (
                <Text style={styles.buttonText}>Submit</Text>
              )}
            </TouchableOpacity>
            <View style={styles.alreadyAccountView}>
              <Text style={{color: 'grey'}}>Already Have An Account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={{color: otherTextColor}}>Login</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </ScrollView>

        {/* Image Picker Modal */}
        {imagePickerFlag && (
          <ImagePickerModal
            visible={imagePickerFlag}
            setVisible={val => setImagePickerFlag(val)}
            setImageUri={uri => setImageUri(uri)}
          />
        )}
        {imageFullScreen && (
          <ImageModal
            imageUri={imageUri}
            imageFullScreen={imageFullScreen}
            setImageFullScreen={setImageFullScreen}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {flex: 1},
  keyBoardStyle: {flex: 1},
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  backbutton: {
    borderWidth: 1,
    width: width * 0.1,
    height: height * 0.05,
    borderColor: 'lightgrey',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: PageTitleColor,
    fontSize: PageTitleSize,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  imageupload: {
    backgroundColor: '#EEEEEE',
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
  passwordopacity: {
    alignSelf: 'center',
    marginRight: 15,
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
  button: {
    borderRadius: 10,
    marginTop: 30,
    backgroundColor: button1backgroundColor,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: buttonTextSize,
    padding: 10,
    color: button1TextColor,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    alignSelf: 'center',
    marginRight: 20,
  },
  errorText2: {
    color: 'red',
    marginLeft: 10,
    marginTop: 20,
  },
  TitleBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 20,
    color: 'black',
  },
  changeImageText: {
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
    color: otherTextColor,
  },
  uploadText: {textAlign: 'center', color: 'black', marginTop: 10},
  inputStyle: {width: '100%', color: 'black'},
  paperInputStyle: {
    width: '80%',
    height: 48,
    color: 'black',
    textAlign: 'left',
    paddingVertical: 0,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
    fontSize: 14,
  },
  passwordText: {color: 'grey', marginLeft: 5, fontSize: 10},
  alreadyAccountView: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: height * 0.04,
    marginBottom: 30,
  },
});

export default SignUpScreen;
