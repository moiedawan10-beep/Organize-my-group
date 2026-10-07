import React, {useState} from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Text,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {otherTextColor} from '../resources/styling';
const ImageModal = ({imageUri, imageFullScreen, setImageFullScreen}) => {
  const [loading, setLoading] = useState(false);
  if (!imageUri) {
    return (
      <Modal transparent={false} visible={imageFullScreen}>
        <View style={styles.modalContainer}>
          <Text style={{color: 'white'}}>No image available</Text>
        </View>
      </Modal>
    );
  }
  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <Modal
        transparent={false}
        visible={imageFullScreen}
        onRequestClose={() => setImageFullScreen(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setImageFullScreen(false)}>
            <Icon name="close" size={30} color="white" />
          </TouchableOpacity>
          <View style={styles.imageWrapper}>
            <FastImage
              source={{uri: imageUri}}
              style={styles.fullScreenImage}
              resizeMode="contain"
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
            />
            {loading && (
              <ActivityIndicator
                size="large"
                color={otherTextColor}
                style={styles.loader}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeAreaContainer: {flex: 1},
  modalContainer: {flex: 1, backgroundColor: 'white'},
  imageWrapper: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  fullScreenImage: {width: '100%', height: '100%'},
  loader: {position: 'absolute'},
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 2,
    backgroundColor: 'lightgrey',
    borderRadius: 20,
    padding: 5,
  },
});
export default ImageModal;
