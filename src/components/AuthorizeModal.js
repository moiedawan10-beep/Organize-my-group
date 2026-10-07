import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  ToastAndroid,
  Alert,
  SafeAreaView,
} from 'react-native';
import WebView from 'react-native-webview';
import {PageTitleColor} from '../resources/styling';
import Theme from '../constants/Theme';

const AuthorizeModal = ({
  visible,
  onClose,
  onSave,
  onAmountSave,
  maxGuest,
  authorize,
  amount,
  webviewVisible,
  handleWebViewNavigation,
  stripeUrl,
  closeWebView,
}) => {
  const [guests, setGuests] = useState([{firstName: '', lastName: ''}]);
  const [bringingGuestFlag, setBringingGuestFlag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amountt, setAmount] = useState(0);
  const [textError, setTextError] = useState('');

  useEffect(() => {
    setAmount(amount);
  }, [amount]);

  useEffect(() => {
    if (bringingGuestFlag) {
      let totalGuests = guests.length + 1;
      setAmount(amount * totalGuests);
    } else {
      setAmount(amount);
    }
  }, [guests, bringingGuestFlag]);

  const addGuest = () => {
    setGuests([...guests, {firstName: '', lastName: ''}]);
  };

  const removeGuest = index => {
    const updatedGuests = guests.filter((_, i) => i !== index);
    setGuests(updatedGuests);
  };

  const updateGuest = (index, field, value) => {
    const updatedGuests = [...guests];
    updatedGuests[index][field] = value;
    setGuests(updatedGuests);
  };

  const handleClose = () => {
    setGuests([{firstName: '', lastName: ''}]);
    setAmount(amount);
    setBringingGuestFlag(false);
    onClose();
  };

  const handleAuthorize = async () => {
    if (bringingGuestFlag) {
      const invalidGuest = guests.find(
        guest => !guest.firstName || !guest.lastName,
      );
      if (invalidGuest) {
        setTextError('All guests must have both a first name and last name.');
        return;
      }
    }

    setLoading(true);
    let guest = bringingGuestFlag ? guests : [{firstName: '', lastName: ''}];
    try {
      await authorize(guest, amountt);
      onSave(guest);
      onAmountSave(amountt);
    } catch (error) {
      console.error('Authorization failed:', error);
    } finally {
      setLoading(false);
      setGuests([{firstName: '', lastName: ''}]);
      setBringingGuestFlag(false);
      setAmount(amount);
    }
  };

  const handleBringingGuest = () => {
    setBringingGuestFlag(!bringingGuestFlag);
    setTextError('');

    let totalGuests = bringingGuestFlag ? 1 : guests.length;
    setAmount(amount * totalGuests);
  };

  const renderGuestInput = ({item, index}) => (
    <View style={styles.guestRow}>
      <TextInput
        style={[
          styles.input,
          !item.firstName && bringingGuestFlag && styles.errorInput,
        ]}
        placeholder="First Name"
        placeholderTextColor={'#999'}
        value={item.firstName}
        onChangeText={text => updateGuest(index, 'firstName', text)}
      />
      <TextInput
        style={[
          styles.input,
          !item.lastName && bringingGuestFlag && styles.errorInput,
        ]}
        placeholder="Last Name"
        placeholderTextColor={'#999'}
        value={item.lastName}
        onChangeText={text => updateGuest(index, 'lastName', text)}
      />
      {index === guests.length - 1 ? (
        <TouchableOpacity
          style={[styles.iconButton, styles.addButton]}
          onPress={addGuest}
          disabled={maxGuest > 0 && guests.length === maxGuest}>
          <Icon name="plus" size={15} color="white" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.iconButton, styles.removeButton]}
          onPress={() => removeGuest(index)}>
          <Icon name="minus" size={15} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );

  const validateGuests = guests.some(
    guest => !guest.firstName || !guest.lastName,
  );
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Join Event</Text>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkboxWrapper}
              onPress={handleBringingGuest}>
              <View style={styles.checkbox}>
                {bringingGuestFlag && (
                  <Image
                    source={require('../assets/tick.png')}
                    resizeMode="contain"
                    style={styles.checkmark}
                  />
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              Are you bringing any guests?
            </Text>
          </View>

          {bringingGuestFlag && (
            <FlatList
              data={guests}
              keyExtractor={(_, index) => index.toString()}
              style={styles.guestList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              renderItem={renderGuestInput}
            />
          )}

          {textError && validateGuests && (
            <Text style={styles.errorText}>{textError}</Text>
          )}
          <Text style={styles.authorizationText}>
            Please authorize payment of $
            {parseFloat(amountt).toFixed(2) || '0.00'} to join event.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.button, styles.closeButton]}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAuthorize}
              style={[styles.button, styles.authorizeButton]}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.buttonText}>Finalize Registration</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {webviewVisible && (
        <Modal
          visible={webviewVisible}
          animationType="slide"
          transparent={true}>
          <SafeAreaView style={styles.container}>
            <View style={styles.webviewContainer}>
              <WebView
                source={{uri: stripeUrl}}
                onNavigationStateChange={handleWebViewNavigation}
              />
              <TouchableOpacity
                onPress={closeWebView}
                style={styles.webviewCloseButton}>
                <Text style={styles.webviewCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </Modal>
  );
};

export default AuthorizeModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  errorInput: {
    borderColor: 'red',
    borderWidth: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  checkboxWrapper: {
    alignItems: 'center',
    marginRight: 12,
  },
  checkbox: {
    borderWidth: 2,
    borderColor: PageTitleColor,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  checkmark: {
    width: 14,
    height: 14,
  },
  checkboxLabel: {
    color: '#333',
    fontSize: 16,
  },
  guestList: {
    maxHeight: 230,
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    fontSize: 14,
    height: 48,
  },
  iconButton: {
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: PageTitleColor,
  },
  removeButton: {
    backgroundColor: '#ff4444',
  },
  authorizationText: {
    color: '#333',
    fontSize: 16,
    marginVertical: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: Theme.COLORS.OTHER_BACKGROUND_COLOR,
  },
  authorizeButton: {
    backgroundColor: '#E53935',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  webviewContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  webviewCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
  },
  webviewCloseText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    padding: 10,
  },
});
