import {
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import React from 'react';
import {
  button1backgroundColor,
  button1TextColor,
  button2backgroundColor,
  button2TextColor,
  buttonTextSize,
} from '../resources/styling';
import {SafeAreaView} from 'react-native';
const {width} = Dimensions.get('window');

const Selection = ({navigation}) => {
  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            {
              borderWidth: 1,
              borderColor: button2TextColor,
              backgroundColor: button2backgroundColor,
            },
          ]}
          onPress={() => navigation.navigate('Signup')}>
          <Text style={[styles.buttonText, {color: button2TextColor}]}>
            Create Account
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Selection;

const styles = StyleSheet.create({
  safeAreaContainer: {flex: 1, backgroundColor: 'white'},
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.7,
    height: 120,
  },
  button: {
    borderRadius: 10,
    width: width * 0.9,
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
});
