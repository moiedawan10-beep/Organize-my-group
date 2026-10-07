import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import {WebView} from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Theme from '../constants/Theme';
import {useDispatch} from 'react-redux';
import {otherTextColor} from '../resources/styling';
import {AddFunds} from '../redux/slices/AddFundSlice';
import CustomAlertModal from './CustomAlertModal';
const AuthorizePayment = ({
  visible,
  onClose,
  onSuccess,
  isWallet = false,
  data = {},
}) => {
  const [loading, setLoading] = useState(false);
  const [webviewVisible, setWebviewVisible] = useState(false);
  const [stripeUrl, setStripeUrl] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loader, setLoader] = useState(false);
  const [walletAmount, setWalletAmount] = useState();
  const [addFundsFlag, setAddFundsFlag] = useState(false);
  const [walletAmountModal, setWalletAmountModal] = useState(false);
  const [walletError, setWalletError] = useState('');

  const dispatch = useDispatch();

  const getAccessToken = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      return accessToken;
    } catch (error) {
      console.error('Error retrieving access token from AsyncStorage:', error);
      throw error;
    }
  };

  const authorize = async () => {
    setLoader(true);
    const accessToken = await getAccessToken();
    const apiUrl = 'https://dev.organizemygroup.com/api/stripe/authorize';
    const requestData = {
      resource_type: 'group',
      // resource_id: 20,
    };
    try {
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setLoading(false);
      setSessionId(response?.data?.body?.session_id);
      const {url} = response.data.body;
      if (url) {
        setStripeUrl(url);
        setWebviewVisible(true);
      } else {
        Alert.alert('Try Again', 'Authorization URL not found.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Authorization error:', error);
      Alert.alert('Try Again', 'Failed to fetch the Stripe authorization URL.');
    } finally {
      setLoader(false);
    }
  };

  const createPayloadForStripe = () => {
    if (isWallet) {
      return {
        session_id: sessionId,
        resource_id: data?.body?.id,
        resource_type: 'group',
        amount: walletAmount,
      };
    } else {
      return {
        session_id: sessionId,
        resource_type: 'group',
      };
    }
  };

  const handleWebViewNavigationStateChange = async state => {
    const accessToken = await getAccessToken();
    const {url} = state;
    if (
      url.includes('https://dev.organizemygroup.com/stripe/authorize/return')
    ) {
      if (sessionId) {
        setWebviewVisible(false);
        onClose();
        const payload = createPayloadForStripe();
        try {
          const response = await fetch(
            'https://dev.organizemygroup.com/api/stripe/authorize/return',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify(payload),
            },
          );
          if (!response.ok) throw new Error('Network response was not ok');
          const result = await response.json();
          onSuccess(true);
        } catch (error) {
          console.error('Error completing Stripe connect:', error);
          Alert.alert(
            'Try Again',
            'Failed to complete the Stripe authorization.',
          );
        }
      }
    } else if (url.includes('cancel')) {
      setWebviewVisible(false);
      onClose();
    }
  };

  const handleAddFunds = async () => {
    if (!walletAmount || isNaN(walletAmount)) {
      Alert.alert('Error', 'Please enter a valid amount.');
      setAddFundsFlag(false);
      return;
    }
    setLoading(true);
    if (data?.body?.payment_method <= 0) {
      const accessToken = await getAccessToken();
      const apiUrl = 'https://dev.organizemygroup.com/api/stripe/authorize';
      const requestData = {
        amount: parseFloat(walletAmount),
        resource_type: 'user',
        resource_id: data?.body?.id,
      };
      try {
        const response = await axios.post(apiUrl, requestData, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setLoading(false);
        setSessionId(response?.data?.body?.session_id);
        const {url} = response.data.body;
        if (url) {
          setStripeUrl(url);
          setWebviewVisible(true);
        } else {
          Alert.alert('Try Again', 'Authorization URL not found.');
        }
      } catch (error) {
        setLoading(false);
        console.error('Authorization error:', error);
        Alert.alert(
          'Try Again',
          'Failed to fetch the Stripe authorization URL.',
        );
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      const payload = {
        amount: parseFloat(walletAmount),
        payment_method: data?.body?.payment_method,
        resource_type: 'group',
        resource_id: data?.body?.id || '',
      };
      try {
        const action = await dispatch(AddFunds(payload));
        if (AddFunds.fulfilled.match(action)) {
          setWalletAmount('');
          setWalletAmountModal(false);
          onClose();
          onSuccess(true);
        } else if (AddFunds.rejected.match(action)) {
          const errorMessage = action.payload || 'Failed to add funds.';
          Alert.alert('Error', errorMessage);
        }
      } catch (err) {
        console.error('Unexpected error in handleAddFunds:', err);
        Alert.alert('Error', 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleModalClose = () => {
    setAddFundsFlag(false);
  };

  const renderWalletModal = () => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalView}>
        <View style={styles.modalBody}>
          <Text style={styles.textStyle}>Add Funds</Text>
          <Text style={styles.amountText}>
            Enter the amount to add to your text/email balance.
          </Text>
          <TextInput
            placeholder="Enter amount..."
            placeholderTextColor="grey"
            keyboardType="numeric"
            value={walletAmount}
            onChangeText={text => {
              setWalletAmount(text);
              const validNumberRegex = /^(?!0\d)\d*\.?\d*$/;
              if (
                !text ||
                !validNumberRegex.test(text) ||
                parseFloat(text) <= 0
              ) {
                setWalletError('Please enter a valid amount.');
              } else {
                setWalletError('');
              }
            }}
            style={[
              styles.walletInput,
              {borderColor: walletError ? 'red' : '#ccc'},
            ]}
          />

          {walletError ? (
            <Text style={styles.errorText}>{walletError}</Text>
          ) : null}

          <View style={styles.fundButtonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.fundCloseButton}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={loading || !!walletError}
              onPress={() => setAddFundsFlag(true)}
              style={styles.fundAddButton}>
              {loading ? (
                <ActivityIndicator color={'white'} size={'small'} />
              ) : (
                <Text style={styles.closeText}>{'Add Funds'}</Text>
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
          <SafeAreaView style={styles.safeAreaContainer}>
            <View style={styles.container}>
              <WebView
                source={{uri: stripeUrl}}
                onNavigationStateChange={handleWebViewNavigationStateChange}
              />
              <TouchableOpacity
                onPress={() => setWebviewVisible(false)}
                style={styles.fundWebClosetext}>
                <Text style={styles.webCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </Modal>
  );

  return (
    <>
      {isWallet ? (
        renderWalletModal()
      ) : (
        <Modal
          visible={visible}
          animationType="slide"
          transparent={true}
          onRequestClose={onClose}>
          <View style={styles.modalView}>
            <View style={styles.modalBody}>
              <Text style={styles.methodHeader}>Add Payment Method</Text>
              <Text style={{color: 'black'}}>
                Please authorize payment method to be used in events.
              </Text>
              <View style={styles.popUpContainer}>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.addMethodCloseButton}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={authorize}
                  disabled={loader}
                  style={styles.methodAddButton}>
                  <Text style={styles.closeText}>
                    {loader ? (
                      <ActivityIndicator color="white" size={17} />
                    ) : (
                      'Add New Payment Method'
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {webviewVisible && (
            <Modal
              visible={webviewVisible}
              animationType="slide"
              transparent={true}>
              <SafeAreaView style={styles.safeAreaContainer}>
                <View style={styles.container}>
                  <WebView
                    source={{uri: stripeUrl}}
                    onNavigationStateChange={handleWebViewNavigationStateChange}
                  />
                  <TouchableOpacity
                    onPress={() => setWebviewVisible(false)}
                    style={styles.webviewCloseButton}>
                    <Text style={styles.webCloseText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </Modal>
          )}
        </Modal>
      )}
      {addFundsFlag && (
        <CustomAlertModal
          visible={addFundsFlag}
          onClose={handleModalClose}
          onOperation={handleAddFunds}
          onCancel={handleModalClose}
          title="Add Funds"
          subtitle={
            <Text>
              Are you sure you want to add{' '}
              <Text style={{color: otherTextColor}}>${walletAmount}</Text> to
              your Text/Email Balance?
            </Text>
          }
          operationButtonLabel="Confirm"
          cancelButtonLabel="Cancel"
          IconName="cash-plus"
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {flex: 1, backgroundColor: 'white'},
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: Theme.COLORS.OTHER_BACKGROUND_COLOR,
    padding: 12,
    borderRadius: 10,
    width: 'auto',
  },
  authorizeButton: {
    backgroundColor: Theme.COLORS.BUTTON_1_BACKGROUND,
    padding: 10,
    borderRadius: 10,
    width: '65%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  webviewCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 2,
    borderRadius: 15,
  },
  webviewCloseText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  walletInput: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    color: 'black',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBody: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  fundCloseButton: {
    backgroundColor: Theme.COLORS.OTHER_BACKGROUND_COLOR,
    padding: 10,
    borderRadius: 10,
    width: '40%',
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fundAddButton: {
    backgroundColor: Theme.COLORS.BUTTON_1_BACKGROUND,
    padding: 10,
    borderRadius: 10,
    width: '40%',
  },
  fundWebClosetext: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
  },
  addMethodCloseButton: {
    marginTop: 10,
    backgroundColor: Theme.COLORS.OTHER_BACKGROUND_COLOR,
    padding: 10,
    borderRadius: 10,
  },
  methodAddButton: {
    marginTop: 10,
    backgroundColor: Theme.COLORS.BUTTON_1_BACKGROUND,
    padding: 10,
    borderRadius: 10,
    width: 'auto',
  },
  popUpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  methodHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  textStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  amountText: {
    color: 'black',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  fundButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  webCloseText: {
    fontSize: 10,
    color: 'white',
    padding: 5,
  },
});

export default AuthorizePayment;
