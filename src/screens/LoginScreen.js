import React, {useState, useEffect, useRef} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
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
import {useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {client_id, client_secret} from '../constants/configs';
import {loginUser} from '../redux/slices/loginSlice';
import {BASE_URL} from '../constants/endpoints';
import {SafeAreaView} from 'react-native';
import CustomAlertModal from '../components/CustomAlertModal';
import {getMessaging} from '@react-native-firebase/messaging';
import {TextInput as PaperInput} from 'react-native-paper';

const {width, height} = Dimensions.get('window');

const Login = ({navigation}) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState('*');
  const [texterror, setTextError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [responseData, setResposneData] = useState();
  const [firbaseToken, setFirbaseToken] = useState();
  const [timeZone, setTimeZone] = useState('');
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  //Used to get user Timezone
  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimeZone(zone);
  }, []);

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

  const storeTokensAndUserData = async (
    accessToken,
    refreshToken,
    expiresIn,
    user,
  ) => {
    try {
      const expiryDate = new Date(Date.now() + expiresIn * 1000);
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('accessTokenExpiry', expiryDate.toString());
      await AsyncStorage.setItem('userData', JSON.stringify(user));
    } catch (error) {
      console.error('Error storing tokens and user data:', error);
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }
      const payload = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: client_id,
        client_secret: client_secret,
        scope: '',
        pushId: firbaseToken,
        pushType: 'android',
      };
      const response = await fetch(`${BASE_URL}token/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      const data = await response.json();
      await AsyncStorage.setItem('accessToken', data.access_token);
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  };

  useEffect(() => {
    const checkTokenValidity = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
          return;
        }
        const expiryDateString = await AsyncStorage.getItem(
          'accessTokenExpiry',
        );
        if (!expiryDateString) {
          throw new Error('Access token expiry information not found');
        }
        const expiryDate = new Date(expiryDateString);
        if (expiryDate > new Date()) {
          return;
        }
        const refreshedAccessToken = await refreshAccessToken();
        if (refreshedAccessToken) {
        } else {
          console.log('Error Unknown');
        }
      } catch (error) {
        console.error('Error checking token validity:', error);
      }
    };
    checkTokenValidity();
  }, []);

  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const loginNow = async () => {
    if (!email || !password) {
      setError('Field required');
    }
    if (!email.trim()) {
      emailRef.current.focus();
      return;
    }
    if (!password.trim()) {
      passwordRef.current.focus();
      return;
    }
    setError('');
    if (!isValidEmail(email)) {
      setTextError('Please enter valid email address');
      emailRef.current.focus();
      return;
    }
    setTextError('');
    setLoading(true);
    const payload = {
      grant_type: 'password',
      client_id: client_id,
      client_secret: client_secret,
      username: email,
      password: password,
      scope: '',
      timezone: timeZone,
      pushId: firbaseToken,
      pushType: 'android',
    };
    try {
      const response = await dispatch(loginUser(payload));
      if (response?.payload?.body?.access_token) {
        const {access_token, refresh_token, expires_in, user} =
          response.payload.body;
        await storeTokensAndUserData(
          access_token,
          refresh_token,
          expires_in,
          user,
        );
        navigation.reset({
          index: 0,
          routes: [{name: 'Dashboard'}],
        });
      } else if (response.error.message === 'Your account is not verified.') {
        setIsAlertVisible(true);
        setResposneData(response);
      } else if (response.error.message) {
        Alert.alert('Error', response.error.message);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      Alert.alert('Error', error.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backbutton}
          onPress={() => navigation.goBack()}>
          <Icon name="keyboard-arrow-left" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Log In</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <KeyboardAvoidingView style={{flex: 1}}>
            <View style={[{marginTop: height * 0.05}, styles.TitleBox]}>
              <Text style={styles.inputTitle}>Email: </Text>
              {email.length === 0 && error ? (
                <Text style={styles.errorText}>{error}</Text>
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
                onSubmitEditing={() => passwordRef.current.focus()}
              />
            </View>
            <View style={[{marginTop: 20}, styles.TitleBox]}>
              <Text style={styles.inputTitle}>Password: </Text>
              {password.length === 0 && error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}
            </View>
            {/* <View style={[styles.inputField, {marginBottom: 10}]}>
              <TextInput
                ref={passwordRef}
                style={{width: '80%', color: 'black'}}
                placeholder="Enter password"
                placeholderTextColor="lightgrey"
                value={password}
                secureTextEntry={passwordVisible}
                onChangeText={text => setPassword(text)}
                returnKeyType="done"
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
            </View> */}

            <View style={[styles.inputField, {marginBottom: 10}]}>
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
                cursorColor="lightgreen"
              />
              <TouchableOpacity
                style={styles.passwordopacity}
                onPress={() => setPasswordVisible(!passwordVisible)}>
                <Icon
                  name={passwordVisible ? 'visibility' : 'visibility-off'}
                  size={19}
                  color="#555"
                />
              </TouchableOpacity>
            </View>
            {/* REMEMBER & RECOVER */}
            <View style={styles.rememberView}>
              <View style={styles.remeberSubView}>
                {isChecked ? (
                  <TouchableOpacity
                    style={styles.remember}
                    onPress={() => setIsChecked(!isChecked)}>
                    <Icon name="check" size={18} color="white" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.remember2}
                    onPress={() => setIsChecked(!isChecked)}
                  />
                )}
                <Text style={styles.rememberText}> Remember me</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={{color: otherTextColor}}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {texterror ? (
              <Text style={styles.errorText2}>{texterror}</Text>
            ) : null}
            {/* LOGIN BUTTON */}
            <TouchableOpacity
              style={styles.button}
              onPress={loading ? null : loginNow}>
              {loading ? (
                <ActivityIndicator color="white" size={43} />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
            {/* CREATE NEW ACCOUNT */}
            <View style={styles.noAccountView}>
              <Text style={styles.noAccountText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={{color: otherTextColor}}>Create Now!</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
      </View>
      {isAlertVisible && (
        <CustomAlertModal
          visible={isAlertVisible}
          onClose={() => setIsAlertVisible(false)}
          onOperation={() => {
            navigation.navigate('Verify Now', {
              data: responseData,
              isResend: true,
            });
            setIsAlertVisible(false);
          }}
          onCancel={() => setIsAlertVisible(false)}
          title={'Email not verified'}
          subtitle={'Do you want to verify your email address?'}
          operationButtonLabel={'Verify'}
          IconName="email-remove"
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {flex: 1},
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
  inputStyle: {width: '100%', color: 'black'},
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
    paddingLeft: 20,
    borderColor: InputBorderColor,
    color: 'black',
  },
  remember: {
    backgroundColor: '#09CA67',
    borderRadius: 3,
    width: 18,
    height: 18,
  },
  passwordopacity: {
    alignSelf: 'center',
    marginRight: 15,
  },
  remember2: {
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'black',
    width: 18,
    height: 18,
  },
  button: {
    borderRadius: 10,
    marginTop: 40,
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
    marginTop: 25,
  },
  TitleBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    // marginTop: 20,
    color: 'black',
  },
  paperInputStyle: {
    width: '80%',
    color: 'black',
    backgroundColor: 'transparent',
    bottom: 5,
    right: 15,
    fontSize: 14,
  },
  rememberView: {flexDirection: 'row', justifyContent: 'space-between'},
  remeberSubView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rememberText: {color: 'black'},
  noAccountView: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: height * 0.04,
  },
  noAccountText: {color: 'grey'},
});
export default Login;
