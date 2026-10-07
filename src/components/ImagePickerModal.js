import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon2 from 'react-native-vector-icons/FontAwesome5';
import ImagePicker from 'react-native-image-crop-picker';
import {otherTextColor} from '../resources/styling';

const ImagePickerModal = ({visible, setVisible, setImageUri}) => {
  const pickImage = () => {
    ImagePicker.openPicker({
      width: 390,
      height: 400,
      cropping: true,
      mediaType: 'photo',
      cropperCircleOverlay: true,
      showCropFrame: false,
      cropperActiveWidgetColor: 'red',
    })
      .then(response => {
        setImageUri(response.path);
        setVisible(false);
      })
      .catch(error => {
        if (error.code !== 'E_PICKER_CANCELLED') {
          Alert.alert('Error', error.message);
        }
      });
  };

  const takePhoto = () => {
    ImagePicker.openCamera({
      width: 390,
      height: 400,
      cropping: true,
      mediaType: 'photo',
      cropperCircleOverlay: true,
      showCropFrame: false,
      cropperActiveWidgetColor: 'red',
    })
      .then(response => {
        setImageUri(response.path);
        setVisible(false);
      })
      .catch(error => {
        if (error.code !== 'E_PICKER_CANCELLED') {
          Alert.alert('Error', error.message);
        }
      });
  };

  return (
    <Modal transparent={true} visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.modaltitle}>Upload Image</Text>
          <View style={styles.modalbuttoncontainer}>
            <View style={styles.cameraContainer}>
              <TouchableOpacity onPress={takePhoto} style={styles.modalicons}>
                <Icon2 name="camera" color={otherTextColor} size={30} />
              </TouchableOpacity>
              <Text style={styles.textColor}>Camera</Text>
            </View>
            <View style={styles.cameraContainer}>
              <TouchableOpacity onPress={pickImage} style={styles.modalicons}>
                <Icon2 name="image" color={otherTextColor} size={30} />
              </TouchableOpacity>
              <Text style={styles.textColor}>Gallery</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setVisible(false)}>
            <Text style={styles.cancelText}>✖</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {alignItems: 'center'},
  textColor: {color: 'black'},
  cancelText: {color: 'black', fontSize: 20},
  closeButton: {position: 'absolute', top: 10, right: 10},
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: 'lightgrey',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 20,
  },
  modaltitle: {
    fontSize: 20,
    fontWeight: '500',
    color: 'black',
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalbuttoncontainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  modalicons: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'grey',
    marginBottom: 5,
  },
});

export default ImagePickerModal;
