import React, {useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import {BlurView} from '@react-native-community/blur';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {otherTextColor} from '../resources/styling';

const {width, height} = Dimensions.get('window');

const MessageModal = ({
  visible,
  title,
  message,
  onClose,
  IconName,
  iconColor = '#E53935',
}) => {
  const translateY = useSharedValue(-height);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
      opacity.value = withTiming(1, {duration: 300});
    } else {
      translateY.value = withTiming(-height, {duration: 300});
      opacity.value = withTiming(0, {duration: 200});
    }
  }, [visible]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
    opacity: opacity.value,
  }));

  return (
    <>
      {visible && (
        <BlurView
          style={[StyleSheet.absoluteFill, styles.blurContainer]}
          blurType="light"
          blurAmount={5}
          reducedTransparencyFallbackColor="white"
        />
      )}
      <Animated.View style={[styles.modalContainer, modalStyle]}>
        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name={IconName} size={32} color={iconColor} />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={onClose}>
          <Text style={styles.buttonText}>Okay</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

export default MessageModal;

const styles = StyleSheet.create({
  blurContainer: {backgroundColor: 'rgba(0,0,0,0.4)'},
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
  },
  modalContainer: {
    position: 'absolute',
    top: '10%',
    width: width - 40,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 12,
    padding: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    fontFamily: 'Roboto-Medium',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 24,
    fontFamily: 'Roboto-Regular',
  },
  button: {
    backgroundColor: otherTextColor,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
});
