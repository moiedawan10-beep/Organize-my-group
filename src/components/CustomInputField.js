import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';

const CustomInput = ({
  label,
  subLabel,
  value,
  onChange,
  placeholder = 'Enter Here',
  editable = true,
  keyboardType = 'default',
  required = false,
  showError = false,
  maxLength,
  multiline = false,
  height = 48,
  backgroundColor,
  color = 'black',
  lengthCounter = false,
}) => {
  const isEmpty = required && showError && (!value || value === '+1');
  return (
    <View>
      <Text style={styles.label}>
        {label}
        {subLabel && (
          <Text style={{color: 'grey', fontSize: 12}}> {subLabel}</Text>
        )}
        {': '}
        {isEmpty ? (
          <Text style={styles.errorText}>Required field</Text>
        ) : (
          required &&
          (!value || value === '+1') && (
            <Text style={styles.requiredMark}>*</Text>
          )
        )}
      </Text>

      <TextInput
        style={[
          styles.inputBox,
          {height: height, backgroundColor: backgroundColor, color: color},
        ]}
        value={value}
        onChangeText={onChange}
        editable={editable}
        keyboardType={keyboardType}
        placeholder={placeholder}
        multiline={multiline}
        placeholderTextColor="lightgrey"
        maxLength={maxLength}
      />
      {lengthCounter && (
        <View style={styles.counterContainer}>
          <Text
            style={{
              color: 'grey',
            }}>{`${value?.length} /${maxLength}`}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  counterContainer: {flexDirection: 'row-reverse', marginBottom: -15},
  label: {fontSize: 16, marginTop: 20, color: 'black'},
  requiredMark: {color: 'red', fontSize: 14},
  inputError: {borderColor: 'red'},
  placeholderText: {color: '#999'},
  valueText: {color: '#333'},
  errorText: {color: 'red', fontSize: 14},
  inputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    maxHeight: 120,
    paddingHorizontal: 15,
    borderRadius: 10,
    color: 'black',
  },
});

export default CustomInput;
