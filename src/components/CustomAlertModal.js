import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Theme from '../constants/Theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomAlertModal = ({
  visible,
  onClose,
  onOperation,
  onCancel,
  title,
  subtitle,
  operationButtonLabel = 'Next',
  cancelButtonLabel = 'Cancel',
  operationButtonColor = 'red',
  IconName = 'checkmark-outline',
}) => {
  const [loading, setLoading] = useState(false);

  const handleOperation = async () => {
    setLoading(true);
    try {
      await onOperation();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onCancel}>
        <View style={styles.modalContainer}>
          <View style={styles.container}>
            <Icon name={IconName} size={100} color={'black'} />
          </View>
          <Text style={styles.modalTitle}>{title}</Text>
          {subtitle && <Text style={styles.modalSubtitle}>{subtitle}</Text>}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}>
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                {cancelButtonLabel}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={loading}
              style={[
                styles.button,
                styles.operationButton,
                {backgroundColor: operationButtonColor},
              ]}
              onPress={handleOperation}>
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>{operationButtonLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: '#F6F0F0',
    width: '110%',
    height: 150,
    alignItems: 'center',
    borderRadius: 15,
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    width: '85%',
    maxWidth: 350,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'black',
    top: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '49%',
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButtonText: {color: 'white'},
  operationButton: {backgroundColor: 'red'},
  cancelButton: {backgroundColor: Theme.COLORS.OTHER_BACKGROUND_COLOR},
});

export default CustomAlertModal;
