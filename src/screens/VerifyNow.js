import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  button1backgroundColor,
  button1TextColor,
  buttonTextSize,
  otherTextColor,
  PageTitleColor,
  PageTitleSize,
} from '../resources/styling';
import {useDispatch} from 'react-redux';
import {otpVerify} from '../redux/slices/OtpVerifySlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL, resendCode} from '../constants/endpoints';
import axios from 'axios';
import {SafeAreaView} from 'react-native';

const {width, height} = Dimensions.get('window');

const VerifyNow = ({navigation, route}) => {
  const {data, isResend} = route.params;
  const [codes, setCodes] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [timeLeft, setTimeLeft] = useState(180);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const startTimer = async () => {
    const currentTime = Date.now();
    const endTime = currentTime + 180 * 1000;
    await AsyncStorage.setItem('resendEndTime', endTime.toString());
    setIsActive(true);

    timerRef.current = setInterval(async () => {
      const savedEndTime = await AsyncStorage.getItem('resendEndTime');
      if (savedEndTime) {
        const remainingTime = Math.floor((savedEndTime - Date.now()) / 1000);
        if (remainingTime > 0) {
          setTimeLeft(remainingTime);
        } else {
          clearInterval(timerRef.current);
          setTimeLeft(0);
          setIsActive(false);
        }
      }
    }, 1000);
  };

  const submitDetails = async () => {
    const verificationCode = codes.join('');

    const {
      client_id,
      client_secret,
      email,
      username,
      password,
      grant_type,
      scope,
    } = data.meta.arg;

    if (!client_id || !client_secret || !username || !password) {
      console.error('Missing required fields for OTP verification');
      Alert.alert('Error', 'Missing required fields. Please try again.');
      return;
    }

    const payload = {
      grant_type,
      client_id,
      client_secret,
      username,
      password,
      scope,
      email,
      code: verificationCode,
    };

    setLoading(true);
    try {
      const response = await dispatch(otpVerify(payload));

      const accessToken = response?.payload?.body?.access_token;

      if (accessToken) {
        await AsyncStorage.setItem('accessToken', accessToken);
        ToastAndroid.show('Account successfully verified!', ToastAndroid.SHORT);

        navigation.reset({
          index: 0,
          routes: [{name: 'Dashboard'}],
        });
      } else {
        Alert.alert('Error', 'OTP verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
      Alert.alert(
        'Error',
        'An error occurred during OTP verification. Please try again.',
      );
    }
    setLoading(false);
    setCodes(['', '', '', '', '', '']);
  };

  const handleChange = (text, index) => {
    const newCodes = [...codes];

    if (text.length === 1) {
      newCodes[index] = text;
      setCodes(newCodes);

      if (index < codes.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (text.length > 1) {
      const pastedArray = text.slice(0, 6).split('');
      const updatedCodes = [...codes];
      let count = 0;

      for (let i = index; i < codes.length && count < pastedArray.length; i++) {
        updatedCodes[i] = pastedArray[count];
        count++;
      }

      setCodes(updatedCodes);

      const lastIndex = Math.min(index + count - 1, 5);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleKeyPress = (key, index) => {
    if (key === 'Backspace') {
      const newCodes = [...codes];
      if (codes[index] !== '') {
        newCodes[index] = '';
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        newCodes[index - 1] = '';
      }
      setCodes(newCodes);
    }
  };

  const handleResend = async () => {
    const email = isResend ? data?.meta?.arg?.username : data?.meta?.arg?.email;

    if (!email) {
      Alert.alert('Error', 'Email is missing for resend');
      return;
    }

    try {
      const response = await axios({
        method: 'post',
        url: BASE_URL + resendCode,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          email: email,
        },
      });
      if (response.status === 200) {
        Alert.alert('Success', 'Verification code has been resent!');
        setTimeLeft(180);
        await AsyncStorage.removeItem('resendEndTime');
        startTimer();
      } else {
        Alert.alert('Error', 'Failed to resend the code. Please try again.');
      }
    } catch (error) {
      console.error('Error resending code:', error);
      Alert.alert(
        'Error',
        'An error occurred while resending the code. Please try again.',
      );
    }
  };

  useEffect(() => {
    if (isResend) {
      handleResend();
    }
  }, []);

  const formatTime = time => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0',
    )}`;
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.container}>
        {/* BACK BUTTON */}
        <TouchableOpacity
          style={styles.backbutton}
          onPress={() => navigation.goBack()}>
          <Icon name="keyboard-arrow-left" size={30} color="black" />
        </TouchableOpacity>

        {/*  PAGE TITLE */}
        <Text style={styles.title}>Verify Account</Text>

        <Text style={{color: 'grey'}}>
          Enter the 6 digit number sent via email to verify your account
        </Text>

        <View style={styles.inputContainer}>
          {codes.map((code, index) => (
            <TextInput
              key={index}
              style={styles.input}
              value={code}
              onChangeText={text => handleChange(text, index)}
              keyboardType="numeric"
              ref={ref => (inputRefs.current[index] = ref)}
              onKeyPress={({nativeEvent: {key}}) => handleKeyPress(key, index)}
            />
          ))}
        </View>
        <View style={styles.text}>
          <Text style={styles.codeSentText}>
            A code has been sent to your phone
          </Text>
          {isActive ? (
            <Text style={styles.resendText}>
              Resend in {formatTime(timeLeft)}
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={isActive}>
              <Text style={styles.resendText}> Resend Code </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* CONFIRM BUTTON */}
        <TouchableOpacity
          style={styles.button}
          onPress={loading ? null : submitDetails}>
          {loading ? (
            <ActivityIndicator color="white" size={43} />
          ) : (
            <Text style={styles.buttonText}>Confirm</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default VerifyNow;

const styles = StyleSheet.create({
  safeAreaContainer: {flex: 1, backgroundColor: 'white'},
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
  inputContainer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: 50,
    height: 50,
    borderBottomWidth: 1,
    borderColor: 'gray',
    color: 'black',
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 24,
  },
  text: {
    alignItems: 'center',
  },
  codeSentText: {color: 'grey', marginBottom: 10},
  resendText: {color: otherTextColor, fontWeight: '500'},
});
