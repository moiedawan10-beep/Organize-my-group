import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useRef, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  button1backgroundColor,
  button1TextColor,
  buttonTextSize,
  InputBorderColor,
  InputTitleSize,
  PageTitleColor,
  PageTitleSize,
} from '../resources/styling';
import {useDispatch} from 'react-redux';
import {ForgotPasswordAction} from '../redux/slices/ForgotPasswordSlice';
import {SafeAreaView} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

const {width, height} = Dimensions.get('window');

const ForgotPassword = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('*');
  const [texterror, setTextError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const emailRef = useRef(null);

  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const submitDetails = async () => {
    if (!email) {
      setError('Field required');
      emailRef.current.focus();
      return;
    }
    setError('');

    if (!isValidEmail(email)) {
      setTextError('Please enter valid email address');
      return;
    }
    setTextError('');
    setLoading(true);
    const response = await dispatch(ForgotPasswordAction(email));
    if (response?.payload?.body?.message === 'Success') {
      navigation.navigate('ResetPassword', {email});
      setTextError('');
      setEmail('');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          {/* BACK BUTTON */}
          <TouchableOpacity
            style={styles.backbutton}
            onPress={() => navigation.goBack()}>
            <Icon name="keyboard-arrow-left" size={30} color="black" />
          </TouchableOpacity>

          {/*  PAGE TITLE */}
          <Text style={styles.title}>Forgot Password</Text>

          <Text style={{color: 'grey'}}>
            Enter the email associated with your account and we'll send an email
            with code to reset your password
          </Text>

          {/* INPUT FIELDS */}
          <View style={[{marginTop: height * 0.05}, styles.TitleBox]}>
            <Text style={styles.inputTitle}>Email:</Text>
            {!email && error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
          </View>

          <View style={styles.inputField}>
            <TextInput
              style={styles.inputStyle}
              ref={emailRef}
              placeholder="Text your email"
              placeholderTextColor="lightgrey"
              value={email}
              onChangeText={text => setEmail(text)}
            />
          </View>

          {texterror ? (
            <Text style={styles.errorText2}>{texterror}</Text>
          ) : null}

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
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPassword;

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
  inputTitle: {
    fontSize: InputTitleSize,
    color: 'black',
    marginBottom: 2,
  },
  inputStyle: {width: '100%', color: 'black'},
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
    // marginBottom:20,
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
    marginLeft: 5,
  },
  errorText2: {
    color: 'red',
    marginLeft: 10,
    marginTop: 10,
  },
  TitleBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    color: 'black',
  },
});
