import {
  StyleSheet,
  Image,
  Text,
  Dimensions,
  View,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
const {width, height} = Dimensions.get('window');

const DashboardCard = ({backgroundColor, name, imagesource, onPress}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.card, {backgroundColor}]}>
        <Image
          source={imagesource}
          style={styles.imageStyle}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.text}>{name}</Text>
    </TouchableOpacity>
  );
};

export default DashboardCard;

const styles = StyleSheet.create({
  container: {
    width: width * 0.38,
    alignSelf: 'center',
    marginHorizontal: 10,
    marginBottom: 20,
  },
  card: {
    height: height * 0.15,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  text: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 5,
    color: 'black',
    fontWeight: '500',
  },
  imageStyle: {width: 55, height: 48},
});
