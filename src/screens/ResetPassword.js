import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
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
import {ResetPasswordAction} from '../redux/slices/ResetPasswordSlice';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native';

const {width, height} = Dimensions.get('window');

const ResetPassword = ({route}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const codeRef = useRef(null);
  const [inputValues, setInputValues] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    error: '*',
    texterror: '',
    loading: false,
  });

  useEffect(() => {
    const {email} = route.params;
    setInputValues({...inputValues, email: email});
  }, []);

  const passwordvalidity = password => {
    const specialCharacters = /[!@#$%^&*(),.?":{}|<>]/;
    return password.length >= 8 && specialCharacters.test(password);
  };

  const submitDetails = async () => {
    if (!inputValues.verificationCode || !inputValues.newPassword) {
      setInputValues({...inputValues, error: 'Field required'});
      codeRef.current.focus();
      return;
    }
    if (!passwordvalidity(inputValues.newPassword)) {
      setInputValues({
        ...inputValues,
        texterror:
          'Password must be a minimum of 8 characters and contain at least one special character',
      });
      return;
    }
    setInputValues({...inputValues, texterror: ''});
    const payload = {
      email: inputValues.email,
      code: inputValues.verificationCode,
      password: inputValues.newPassword,
    };
    setInputValues({...inputValues, loading: true});
    const response = await dispatch(ResetPasswordAction(payload));
    if (response?.payload?.status_code === 200) {
      Alert.alert('Successfull', response?.payload?.body?.message);
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    }
    setInputValues({...inputValues, loading: false});
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
            <Text style={styles.inputTitle}>Verification Code:</Text>
            {!inputValues.verificationCode && inputValues.error ? (
              <Text style={styles.errorText}>{inputValues.error}</Text>
            ) : null}
          </View>
          <View style={styles.inputField}>
            <TextInput
              ref={codeRef}
              style={styles.inputStyle}
              placeholder="Enter your code"
              placeholderTextColor="lightgrey"
              keyboardType="numeric"
              maxLength={6}
              value={inputValues.verificationCode}
              onChangeText={text =>
                setInputValues({...inputValues, verificationCode: text})
              }
            />
          </View>

          <View style={[{marginTop: height * 0.05}, styles.TitleBox]}>
            <Text style={styles.inputTitle}>New Password:</Text>
            {!inputValues.newPassword && inputValues.error ? (
              <Text style={styles.errorText}>{inputValues.error}</Text>
            ) : null}
          </View>
          <View style={styles.inputField}>
            <TextInput
              style={styles.inputStyle}
              placeholder="Enter your new password"
              placeholderTextColor="lightgrey"
              value={inputValues.newPassword}
              onChangeText={text =>
                setInputValues({...inputValues, newPassword: text})
              }
            />
          </View>
          {inputValues.texterror ? (
            <Text style={styles.errorText2}>{inputValues.texterror}</Text>
          ) : null}
          {/* CONFIRM BUTTON */}
          <TouchableOpacity
            style={styles.button}
            onPress={inputValues.loading ? null : submitDetails}>
            {inputValues.loading ? (
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

export default ResetPassword;

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
  inputStyle: {width: '100%', color: 'black'},
});
