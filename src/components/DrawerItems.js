import React, {useCallback, useEffect, useState} from 'react';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/AntDesign';
import Theme from '../constants/Theme';

import {
  button1TextColor,
  buttonTextSize,
  card3IconColor,
  InputBorderColor,
  InputTitleSize,
} from '../resources/styling';
import {useDispatch} from 'react-redux';
import {CheckPasswordAction} from '../redux/slices/CheckPasswordSlice';

const CustomDrawerContent = ({navigation, currentScreen = 'DashboardHome'}) => {
  const [selectedScreen, setSelectedScreen] = useState(currentScreen);
  const [expandedSections, setExpandedSections] = useState({
    events: true,
    groups: true,
  });
  const [viewProfileFlag, setViewProfileFlag] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    const currentRoute = currentScreen;
    setSelectedScreen(currentRoute);
  }, [currentScreen]);

  const handleScreenPress = screenName => {
    setSelectedScreen(screenName);
    navigation.reset({
      index: 0,
      routes: [{name: screenName}],
    });
  };

  const toggleSection = sectionName => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const getLabelStyle = screenName => {
    return selectedScreen === screenName
      ? {backgroundColor: '#e1f2ec'}
      : {color: 'black'};
  };

  const handleProfileEdit = useCallback(() => {
    setViewProfileFlag(true);
  }, []);

  const closeViewProfile = useCallback(() => {
    setViewProfileFlag(false);
    setErrorMessage('');
    setPassword('');
  }, []);

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

  const iconSize = 30;

  return (
    <DrawerContentScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={{fontWeight: 'bold', fontSize: 20, color: 'black'}}>
          Organize My Group
        </Text>
      </View>

      {/* Home */}
      <DrawerItem
        label="Home"
        onPress={() => handleScreenPress('DashboardHome')}
        style={styles.item}
        labelStyle={[
          styles.drawerLabel,
          getLabelStyle('DashboardHome'),
          {right: 24},
        ]}
        icon={() => <Icon name="home" size={iconSize} color={card3IconColor} />}
      />

      {/* Events Dropdown */}
      <TouchableOpacity
        style={styles.dropdownHeader}
        onPress={() => toggleSection('events')}>
        <View style={{flexDirection: 'row', left: 5}}>
          <Image
            source={require('../assets/card/icon-events.png')}
            style={{width: 22, height: 22, top: 3}}
            resizeMode="contain"
          />
          <Text style={[styles.drawerLabel, {left: 13, alignSelf: 'center'}]}>
            Events
          </Text>
        </View>
        <Icon
          name={expandedSections.events ? 'expand-less' : 'expand-more'}
          size={iconSize}
          color={card3IconColor}
        />
      </TouchableOpacity>
      {expandedSections.events && (
        <View style={styles.subMenu}>
          <DrawerItem
            label="My Events"
            onPress={() => handleScreenPress('My Events')}
            style={styles.subItem}
            labelStyle={[
              styles.drawerLabel,
              getLabelStyle('My Events'),
              {fontSize: 14, paddingHorizontal: 10, right: 20},
            ]}
            icon={() => (
              <Image
                source={require('../assets/card/icon-events.png')}
                style={{width: 22, height: 22}}
                resizeMode="contain"
              />
            )}
          />
          <DrawerItem
            label="Upcoming Events"
            onPress={() => handleScreenPress('Upcoming Events')}
            style={styles.subItem}
            labelStyle={[
              styles.drawerLabel,
              getLabelStyle('Upcoming Events'),
              {fontSize: 14, paddingHorizontal: 10, right: 20},
            ]}
            icon={() => (
              <Image
                source={require('../assets/card/icon-upcoming.png')}
                style={{width: 22, height: 22}}
                resizeMode="contain"
              />
            )}
          />
        </View>
      )}

      {/* Groups Dropdown */}
      <TouchableOpacity
        style={styles.dropdownHeader}
        onPress={() => toggleSection('groups')}>
        <View style={{flexDirection: 'row'}}>
          <Image
            source={require('../assets/card/mygroups.png')}
            style={{width: iconSize, height: iconSize}}
            resizeMode="contain"
          />
          <Text style={[styles.drawerLabel, {left: 10, alignSelf: 'center'}]}>
            Groups
          </Text>
        </View>
        <Icon
          name={expandedSections.groups ? 'expand-less' : 'expand-more'}
          size={iconSize}
          color={card3IconColor}
        />
      </TouchableOpacity>
      {expandedSections.groups && (
        <View style={styles.subMenu}>
          <DrawerItem
            label="My Groups"
            onPress={() => handleScreenPress('My Groups')}
            style={styles.subItem}
            labelStyle={[
              styles.drawerLabel,
              getLabelStyle('My Groups'),
              {fontSize: 14, paddingHorizontal: 10, right: 25},
            ]}
            icon={() => (
              <Image
                source={require('../assets/card/mygroups.png')}
                style={{width: iconSize, height: iconSize}}
                resizeMode="contain"
              />
            )}
          />
          <DrawerItem
            label="Join Group"
            onPress={() => handleScreenPress('Join Group')}
            style={styles.subItem}
            labelStyle={[
              styles.drawerLabel,
              getLabelStyle('Join Group'),
              {fontSize: 14, paddingHorizontal: 10, right: 25},
            ]}
            icon={() => (
              <Image
                source={require('../assets/card/icon-joingroup.png')}
                style={{width: iconSize, height: iconSize}}
                resizeMode="contain"
              />
            )}
          />
          <DrawerItem
            label="Create Group"
            onPress={() => handleScreenPress('Create Group')}
            style={styles.item}
            labelStyle={[
              styles.drawerLabel,
              getLabelStyle('Create Group'),
              {fontSize: 14, paddingHorizontal: 10, right: 25},
            ]}
            icon={() => (
              <Image
                source={require('../assets/card/create.png')}
                style={{width: iconSize, height: iconSize}}
                resizeMode="contain"
              />
            )}
          />
        </View>
      )}

      {/* Profile */}
      <DrawerItem
        label="Edit Profile"
        onPress={handleProfileEdit}
        style={styles.item}
        labelStyle={[styles.drawerLabel, getLabelStyle('Profile'), {right: 15}]}
        icon={() => <Icon2 name="user" size={22} color={card3IconColor} />}
      />

      {/* Payments */}
      <DrawerItem
        label="Payment Methods"
        onPress={() => handleScreenPress('Payments')}
        style={styles.item}
        labelStyle={[
          styles.drawerLabel,
          getLabelStyle('Payments'),
          {right: 24},
        ]}
        icon={() => (
          <Image
            source={require('../assets/card/icon-payment.png')}
            style={{width: iconSize, height: iconSize}}
            resizeMode="contain"
          />
        )}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={viewProfileFlag}
        onRequestClose={closeViewProfile}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.inputTitle}>Confirm Password:</Text>
            <View style={styles.inputField}>
              <TextInput
                style={styles.passwordInput}
                placeholderTextColor="grey"
                placeholder="Enter here"
                secureTextEntry={passwordVisible}
                value={password}
                onChangeText={handlePasswordChange}
              />
              <TouchableOpacity
                style={styles.passwordopacity}
                onPress={togglePasswordVisibility}>
                <Icon
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
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
  container: {
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: -30,
  },
  item: {},
  selectedItem: {
    paddingVertical: 1,
    backgroundColor: '#f0f0f0',
  },
  drawerLabel: {
    fontWeight: 'bold',
    borderRadius: 20,
    padding: 5,
    fontSize: 17,
    color: 'black',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  subMenu: {
    marginLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
  },
  subItem: {
    paddingVertical: 0,
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
  passwordopacity: {
    alignSelf: 'center',
    marginRight: 15,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  deleteGroupModalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  loader: {
    padding: 7,
  },
  button: {
    borderRadius: 10,
    marginTop: 20,
    width: '49%',
    // height: '80%',
  },
  cancelButton: {
    // marginTop: 10,
    backgroundColor: Theme.COLORS.OTHER_BACKGROUND_COLOR,
  },
  confirmButton: {
    // marginTop: 10,
    backgroundColor: Theme.COLORS.BUTTON_1_BACKGROUND,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: buttonTextSize,
    padding: 10,
    color: button1TextColor,
    fontWeight: 'bold',
  },
});
