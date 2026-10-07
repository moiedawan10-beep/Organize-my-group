import {
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  View,
  Modal,
  Switch,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {card3Color, otherTextColor, PageTitleColor} from '../resources/styling';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {NotifcationsAction} from '../redux/slices/NotificationSlice';
import Icon from 'react-native-vector-icons/AntDesign';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import {NotificationSettingAction} from '../redux/slices/NotificationSettingSlice';

const DashboardHeader2 = ({
  title,
  isBack,
  isSetting,
  groupId,
  isAllowNotification,
  isUserNotification,
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {notifications} = useSelector(state => state.MyNotifications);
  const [count, setCount] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [groupNotif, setGroupNotif] = useState(true);
  const [userNotif, setUserNotif] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const response = await dispatch(NotifcationsAction());
      setCount(response?.payload?.body?.unread);
    });
    return unsubscribe;
  }, [navigation, dispatch]);

  useEffect(() => {
    if (isAllowNotification !== undefined) {
      setGroupNotif(isAllowNotification === 1);
    }
    if (isUserNotification !== undefined) {
      setUserNotif(isUserNotification === 1);
    }
  }, [isAllowNotification, isUserNotification]);

  return (
    <>
      <View style={styles.headerContainer}>
        <View style={styles.leftContainer}>
          {isBack ? (
            <TouchableOpacity
              style={styles.iconStyle}
              onPress={() => navigation.goBack()}>
              <Icon name={'arrowleft'} size={20} color={otherTextColor} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              style={styles.iconStyle}>
              <Image
                source={require('../assets/dropdown.png')}
                style={styles.dropDownImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={styles.rightIconsWrapper}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('DashboardHome')}>
            <Image
              source={require('../assets/home.png')}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {isSetting && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowModal(true)}>
              <Icon name="setting" size={25} color={otherTextColor} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Notifications')}>
            <Image
              source={require('../assets/bell.png')}
              style={[styles.iconImage, {bottom: 3}]}
              resizeMode="contain"
            />
            <View style={styles.bellPart}>
              <Image
                source={require('../assets/bellpart.png')}
                style={styles.bellDotImage}
                resizeMode="contain"
              />
            </View>
            {count > 0 && <Text style={styles.dot}>{count}</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal */}
      {showModal && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showModal}
          onRequestClose={() => setShowModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Settings</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <EvilIcons name={'close'} size={25} color={'black'} />
                </TouchableOpacity>
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.allowText}>Allow Group Notification</Text>
                <Switch
                  value={groupNotif}
                  onValueChange={val => {
                    setGroupNotif(val);
                    dispatch(
                      NotificationSettingAction({
                        groupId,
                        allow_notification: val ? 1 : 0,
                        allow_user_notification: userNotif ? 1 : 0,
                      }),
                    );
                  }}
                  thumbColor={otherTextColor}
                  trackColor={{false: card3Color, true: otherTextColor}}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.allowText}>Allow User Notification</Text>
                <Switch
                  value={userNotif}
                  onValueChange={val => {
                    setUserNotif(val);
                    dispatch(
                      NotificationSettingAction({
                        groupId,
                        allow_notification: groupNotif ? 1 : 0,
                        allow_user_notification: val ? 1 : 0,
                      }),
                    );
                  }}
                  thumbColor={otherTextColor}
                  trackColor={{false: card3Color, true: otherTextColor}}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

export default DashboardHeader2;

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
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    color: PageTitleColor,
    fontSize: 20,
    fontWeight: '500',
    marginLeft: 10,
    flexShrink: 1,
  },
  iconButton: {
    borderWidth: 1,
    borderColor: 'lightgrey',
    borderRadius: 30,
    width: 48,
    height: 48,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'black',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  dropDownImage: {width: 24, height: 19},
  modalView: {flexDirection: 'row', justifyContent: 'space-between'},
  allowText: {color: 'black', fontSize: 16},
  leftContainer: {flexDirection: 'row', alignItems: 'center', flex: 1},
  iconStyle: {padding: 5},
  iconImage: {width: 23, height: 23, alignSelf: 'center'},
  bellPart: {position: 'absolute', bottom: 8},
  bellDotImage: {width: 10, height: 10},
  rightIconsWrapper: {flexDirection: 'row', alignItems: 'center', gap: 10},
});
