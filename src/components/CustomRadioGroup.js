import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {InputTitleSize} from '../resources/styling';

const CustomRadioGroup = ({
  label,
  value,
  GroupType = false,
  onChange,
  disabled = false,
  isEditing = false,
  disabledCondition = false,
}) => {
  return (
    <>
      <View style={styles.TitleBox}>
        <Text style={styles.inputTitle}>
          {label}
          {isEditing && (
            <Text style={styles.freeText}>
              {' '}
              (if event is free then not changeable)
            </Text>
          )}
        </Text>
      </View>

      <View style={styles.boxescontainer}>
        {/* YES */}
        <TouchableOpacity
          style={styles.yesButton}
          onPress={() => onChange(1)}
          disabled={disabled}>
          <View style={styles.checkbox}>
            {value === 1 && (
              <Image
                source={require('../assets/tick.png')}
                resizeMode="contain"
                style={styles.tickImage}
              />
            )}
          </View>
          <Text style={styles.buttonText}>{GroupType ? 'Public' : 'Yes'}</Text>
        </TouchableOpacity>

        {/* NO */}
        <TouchableOpacity
          disabled={value === 1 && disabledCondition}
          style={{alignItems: 'center'}}
          onPress={() => onChange(0)}>
          <View style={styles.checkbox}>
            {value === 0 && (
              <Image
                source={require('../assets/tick.png')}
                resizeMode="contain"
                style={styles.tickImage}
              />
            )}
          </View>
          <Text style={styles.buttonText}>{GroupType ? 'Private' : 'No'}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  TitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    color: 'black',
  },
  inputTitle: {
    fontSize: InputTitleSize,
    color: 'black',
    marginBottom: 2,
  },
  checkbox: {
    borderWidth: 1,
    borderColor: 'lightgrey',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxescontainer: {flexDirection: 'row', marginTop: 10},
  freeText: {color: 'red', fontSize: 10},
  yesButton: {alignItems: 'center', marginRight: 20},
  tickImage: {width: 15, height: 15},
  buttonText: {color: 'grey'},
});
export default CustomRadioGroup;
