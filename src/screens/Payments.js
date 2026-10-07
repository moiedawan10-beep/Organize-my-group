import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import React, {useCallback, useMemo, useState} from 'react';
import DashboardHeader2 from '../components/DashboardHeader2';
import {EventDetailHeaderTitle, PageTitleColor} from '../resources/styling';
import AuthorizePayment from '../components/AuthorizePayment';
import {getPaymentsMethod} from '../redux/slices/PaymentsMethodSlice';
import {useDispatch} from 'react-redux';
import Theme from '../constants/Theme';
import MessageModal from '../components/MessageModal';
import {useFocusEffect} from '@react-navigation/native';
import {DeletePaymentsAction} from '../redux/slices/DeletePaymentsMethodSlice';
import CustomAlertModal from '../components/CustomAlertModal';
import {selectPaymentMethodAction} from '../redux/slices/PaymentMethodSelectSlice';

const {height} = Dimensions.get('window');

const Payments = () => {
  const dispatch = useDispatch();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    title: 'Message',
    message: '',
    icon: 'notifications',
    isConfirm: false,
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    paymentMethodId: null,
  });

  const showModal = useCallback((title, message, icon, isConfirm) => {
    setAlert({
      visible: true,
      title,
      message,
      icon,
      isConfirm,
    });
  }, []);

  const onSuccess = useCallback(
    isAuthorized => {
      showModal(
        isAuthorized ? 'Authorization Success' : 'Authorization Failed',
        isAuthorized
          ? 'Your payment method has been successfully authorized.'
          : 'There was an issue with authorizing your payment method. Please try again.',
        isAuthorized ? 'checkmark-circle-outline' : 'close-circle',
        true,
      );
    },
    [showModal],
  );

  const getPaymentsMethodData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dispatch(getPaymentsMethod());
      const data = result?.payload;
      const defaultMethod = Array.isArray(data)
        ? data.find(method => method?.default === 1)
        : null;
      setPaymentMethods(Array.isArray(data) ? data : []);
      setSelectedMethod(defaultMethod?.id || null);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
      setAlert(prev => ({...prev, visible: false}));
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      getPaymentsMethodData();
    }, [getPaymentsMethodData]),
  );

  const toggleCheckbox = useCallback(
    id => {
      setSelectedMethod(id);
      dispatch(selectPaymentMethodAction(id));
    },
    [dispatch],
  );

  const handleDelete = useCallback(async () => {
    const {paymentMethodId} = deleteModal;
    if (paymentMethodId) {
      try {
        await dispatch(DeletePaymentsAction({id: paymentMethodId}));
        if (selectedMethod === paymentMethodId) {
          setSelectedMethod(null);
        }
        getPaymentsMethodData();
      } catch (error) {
        console.error('Error deleting payment method', error);
        alert('Error deleting payment method. Please try again.');
      }
    }
    setDeleteModal({visible: false, paymentMethodId: null});
  }, [dispatch, deleteModal, selectedMethod, getPaymentsMethodData]);

  const cardImages = useMemo(
    () => ({
      visa: require('../assets/Payments/visa.png'),
      amex: require('../assets/Payments/amex.jpg'),
      discover: require('../assets/Payments/discover.png'),
      jcb: require('../assets/Payments/JCB.png'),
      mastercard: require('../assets/Payments/mastercard.png'),
    }),
    [],
  );

  const renderPaymentMethod = useCallback(
    method => (
      <TouchableOpacity
        key={method.id}
        style={styles.checkboxContainer}
        onPress={() => toggleCheckbox(method.id)}
        onLongPress={() =>
          setDeleteModal({
            visible: true,
            paymentMethodId: method.id,
          })
        }>
        <View style={styles.cardView}>
          <Image
            source={cardImages[method.brand] || cardImages.mastercard}
            style={styles.imageStyle}
            resizeMode="contain"
          />
          <Text style={styles.methodText}>
            {' '}
            Credit Card **** **** **** {method.last4}
          </Text>
        </View>
        <View style={styles.checkbox}>
          {selectedMethod === method.id && <View style={styles.checkedDot} />}
        </View>
      </TouchableOpacity>
    ),
    [cardImages, selectedMethod, toggleCheckbox],
  );

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <DashboardHeader2 title="Payment Methods" isBack={true} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.cardTitle}>Credit & Debit Cards</Text>

        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color={Theme.COLORS.OTHER_BACKGROUND_COLOR}
            />
          ) : paymentMethods?.length > 0 ? (
            <>
              <Text
                style={[
                  styles.methodText,
                  {textAlign: 'center', marginBottom: 10},
                ]}>
                {' '}
                Click and hold card to delete
              </Text>
              {paymentMethods.map(renderPaymentMethod)}
            </>
          ) : (
            <Text style={styles.noPaymentText}>No payment methods found.</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.newmethod}
          onPress={() => setIsModalVisible(true)}>
          <Image
            source={require('../assets/Payments/plus.png')}
            style={styles.imageStyle}
            resizeMode="contain"
          />
          <Text style={styles.methodText}> Add New Method</Text>
        </TouchableOpacity>
      </ScrollView>
      {isModalVisible && (
        <AuthorizePayment
          visible={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            getPaymentsMethodData();
          }}
          onSuccess={onSuccess}
        />
      )}
      {alert.visible && (
        <MessageModal
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          onClose={
            alert.isConfirm
              ? getPaymentsMethodData
              : () => setAlert(prev => ({...prev, visible: false}))
          }
          IconName={alert.icon}
          iconColor={Theme.COLORS.SUCCESS}
        />
      )}
      {deleteModal.visible && (
        <CustomAlertModal
          visible={deleteModal.visible}
          onClose={() =>
            setDeleteModal({visible: false, paymentMethodId: null})
          }
          onOperation={handleDelete}
          onCancel={() =>
            setDeleteModal({visible: false, paymentMethodId: null})
          }
          title="Delete Payment Method "
          subtitle="Are you sure you want to delete this payment method?"
          operationButtonLabel="Delete"
          cancelButtonLabel="Cancel"
          IconName="delete"
        />
      )}
    </SafeAreaView>
  );
};

export default Payments;

const styles = StyleSheet.create({
  safeAreaContainer: {flex: 1, backgroundColor: 'white'},
  container: {
    marginTop: height * 0.02,
    paddingBottom: height * 0.06,
    paddingHorizontal: 15,
  },
  card: {
    elevation: 3,
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: EventDetailHeaderTitle,
    fontWeight: '500',
    color: 'black',
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 20,
    borderWidth: 0.5,
    borderColor: Theme.COLORS.LIGHT_GRAY,
    borderRadius: 10,
  },
  methodText: {
    color: 'grey',
    fontSize: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedDot: {
    width: 10,
    height: 10,
    backgroundColor: '#1FA2D2',
    borderRadius: 7.5,
  },
  newmethod: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardView: {flexDirection: 'row', alignItems: 'center'},
  imageStyle: {width: 28, height: 20},
  noPaymentText: {color: PageTitleColor, fontWeight: '500'},
});
