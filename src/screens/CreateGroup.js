import {
  Dimensions,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  ToastAndroid,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import DashboardHeader2 from '../components/DashboardHeader2';
import {Text} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useDispatch} from 'react-redux';
import {CreateGroup} from '../redux/slices/CreateGroupSlice';
import {GroupCodeAvailability} from '../redux/slices/GroupCodeAvailabilityCheckSlice';
import Theme from '../constants/Theme';
import {SafeAreaView} from 'react-native';
import {EditGroupAction} from '../redux/slices/EditGroupSlice';
import ImagePickerModal from '../components/ImagePickerModal';
import CustomInput from '../components/CustomInputField';
import CustomRadioGroup from '../components/CustomRadioGroup';

const {height} = Dimensions.get('window');

const CreateGroup1 = ({navigation, route}) => {
  const {data, isEdit, groupId} = route?.params || {};
  const dispatch = useDispatch();

  const [state, setState] = useState({
    imageUri: null,
    name: '',
    groupcode: '',
    zipcode: '',
    description: '',
    error: '*',
    error2: '',
    keywords: [],
    inputValue: '',
    grouptype: 1,
    codeAvailability: '',
    flag: null,
    pickerFlag: false,
    loading: false,
  });

  const updateState = useCallback(updates => {
    setState(prev => ({...prev, ...updates}));
  }, []);

  React.useEffect(() => {
    if (data) {
      updateState({
        imageUri: data?.photo_url_main,
        name: data?.title,
        groupcode: data?.code,
        zipcode: data?.zip_code?.toString() || '',
        description: data?.description,
        keywords: data?.keywords ? data.keywords.split(', ') : [],
        grouptype: data?.privacy === 'public' ? 1 : 0,
      });
    }
  }, [data, updateState]);

  const handleInputChange = useCallback(
    text => {
      if (state.keywords.length >= 5) {
        updateState({error2: 'You can only add up to 5 keywords'});
        return;
      }
      updateState({error2: '', inputValue: text});
      if (text.endsWith(',') || text.endsWith(' ')) {
        const newKeyword = text.trim();
        if (newKeyword && !state.keywords.includes(newKeyword)) {
          updateState({
            keywords: [...state.keywords, newKeyword],
            inputValue: '',
          });
        }
      }
    },
    [state.keywords, updateState],
  );

  const handleKeyPress = useCallback(
    e => {
      if (e.nativeEvent.key === 'Backspace' && state.inputValue === '') {
        updateState({
          keywords: state.keywords.slice(0, -1),
        });
      }
    },
    [state.keywords, state.inputValue, updateState],
  );

  const checkGroupCodeAvailability = useCallback(async () => {
    if (!state.groupcode) {
      updateState({
        codeAvailability: 'Provide Group Code',
        flag: false,
      });
      return;
    }

    const response = await dispatch(
      GroupCodeAvailability({groupcode: state.groupcode}),
    );

    updateState({
      codeAvailability:
        response.payload === 'ERR_BAD_REQUEST' ||
        response.payload === 'ERR_NETWORK'
          ? 'Code Already Taken'
          : 'Code available',
      flag: !(
        response.payload === 'ERR_BAD_REQUEST' ||
        response.payload === 'ERR_NETWORK'
      ),
    });
  }, [dispatch, state.groupcode, updateState]);

  const submitData = useCallback(async () => {
    const {
      name,
      groupcode,
      zipcode,
      keywords,
      imageUri,
      description,
      grouptype,
    } = state;

    if (!name || !groupcode || !zipcode || !keywords.length) {
      updateState({
        error: 'Required field',
        error2: 'Missing required fields',
      });
      return;
    }

    if (name.length < 3) {
      updateState({error2: 'Group Name must be 3 characters or longer'});
      return;
    }

    if (zipcode.length !== 5) {
      updateState({error2: 'Zip Code must be 5 digits long'});
      return;
    }

    if (keywords.length === 0) {
      updateState({error2: 'At least one keyword is required'});
      return;
    }

    updateState({error2: '', loading: true});

    const words = keywords.join(', ');
    const payload = {
      imageUri,
      name,
      groupcode,
      zipcode,
      description,
      groupType: grouptype == 1 ? 'public' : 'private',
      words,
      ...(isEdit && {id: groupId}),
    };

    const response = await dispatch(
      isEdit ? EditGroupAction(payload) : CreateGroup(payload),
    );

    if (response?.payload?.status_code === 200) {
      ToastAndroid.show(
        isEdit ? 'Group Updated Successfully' : 'Group Created Successfully',
        ToastAndroid.SHORT,
      );

      navigation.navigate('Group Details', {
        id: response?.payload?.body?.id,
        isNew: !isEdit,
      });

      updateState({
        name: '',
        groupcode: '',
        zipcode: '',
        description: '',
        selectedValue: 0,
        imageUri: null,
        keywords: [],
        error: '*',
        error2: '',
        codeAvailability: '',
      });
    } else {
      ToastAndroid.show(
        'Something went wrong. Please try again.',
        ToastAndroid.SHORT,
      );
    }

    updateState({loading: false});
  }, [state, dispatch, isEdit, groupId, navigation, updateState]);

  const renderKeywordItem = useCallback(
    ({item}) => (
      <View style={styles.keywordContainer}>
        <Text style={styles.keywordText}>{item}</Text>
      </View>
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <DashboardHeader2
        title={isEdit ? 'Edit Group' : 'Create a Group'}
        isBack={true}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView style={styles.keyboardContainer}>
          {/* Group Image Picker */}
          {state.imageUri ? (
            <TouchableOpacity
              onPress={() => updateState({pickerFlag: true})}
              style={styles.imageupload}>
              <Image
                source={{uri: state.imageUri}}
                resizeMode="cover"
                style={styles.imageuploaded}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.imageupload}
              onPress={() => updateState({pickerFlag: true})}>
              <Icon name="camera-outline" size={30} color="#848484" />
            </TouchableOpacity>
          )}
          <Text style={styles.uploadIconText}>Upload a Group icon</Text>

          {/* Group Name */}
          <CustomInput
            label="Group Name"
            value={state.name}
            onChange={text => updateState({name: text})}
            placeholder="Enter Here"
            required={true}
            showError={!!state.error2}
            maxLength={25}
            lengthCounter={true}
          />

          {/* GROUP CODE */}
          <CustomInput
            label="Group Code"
            value={state.groupcode}
            onChange={text => updateState({groupcode: text})}
            placeholder="Enter Here"
            required={true}
            showError={!!state.error2}
            maxLength={10}
          />

          {/* Check Availability */}
          <View style={styles.availabilityView}>
            <Text
              style={
                state.flag ? styles.codeAvailability : styles.codeUnavailability
              }>
              {state.codeAvailability}
            </Text>
            <View style={styles.v1}>
              <View style={styles.v2}>
                <Text
                  style={
                    styles.subText
                  }>{`${state.groupcode?.length} / 10`}</Text>
              </View>
              <TouchableOpacity
                style={[styles.availabilitybox, {marginLeft: -30}]}
                onPress={checkGroupCodeAvailability}>
                <Text style={styles.availability}>Check availability </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Zip Code */}
          <CustomInput
            label="Primary Zip Code"
            value={state.zipcode}
            onChange={text => {
              const sanitizedText = text.replace(/[^0-9]/g, '');
              updateState({zipcode: sanitizedText});
            }}
            placeholder="Enter Here"
            required={true}
            showError={!!state.error2}
            maxLength={5}
            keyboardType={'numeric'}
          />

          {/* DESCRIPTION */}
          <CustomInput
            label="Group Description"
            value={state.description}
            onChange={text => updateState({description: text})}
            placeholder="Enter Here"
            maxLength={110}
            height={'auto'}
            multiline={true}
            lengthCounter={true}
          />

          {/* Group Type */}
          <CustomRadioGroup
            label="Group Type:"
            GroupType={true}
            value={state.grouptype}
            onChange={val => updateState({grouptype: val})}
          />

          {/* Keywords */}
          <View>
            <View style={styles.TitleBox}>
              <Text style={styles.inputTitle}>Keywords:</Text>
              {state.keywords.length === 0 && state.error ? (
                <Text style={styles.errorText}> {state.error}</Text>
              ) : null}
            </View>
            <View
              style={[styles.inputField, {flexWrap: 'wrap', height: 'auto'}]}>
              <View style={styles.keywordsContainer}>
                <View style={styles.keywordsContainer}>
                  {state?.keywords?.map(item => renderKeywordItem({item}))}
                </View>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder={state.keywords.length === 0 ? 'Add keyword' : ''}
                placeholderTextColor="lightgrey"
                value={state.inputValue}
                onChangeText={handleInputChange}
                onKeyPress={handleKeyPress}
                onSubmitEditing={() => {
                  if (state.inputValue.trim()) {
                    handleInputChange(state.inputValue);
                  }
                }}
              />
            </View>
            <Text style={styles.keywordMinText}>
              Keywords (1 min & 5 max, click spacebar to confirm each word)
            </Text>
            {state.error2 && (
              <Text style={styles.errorText}>{state.error2}</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={state.loading ? null : submitData}>
            {state.loading ? (
              <ActivityIndicator color="white" size={43} />
            ) : (
              <Text style={styles.buttonText}>
                {isEdit ? 'Save Changes' : 'Organize My Group'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Image Picker Modal */}
          {state.pickerFlag && (
            <ImagePickerModal
              visible={state.pickerFlag}
              setVisible={val => setState(prev => ({...prev, pickerFlag: val}))}
              setImageUri={uri => setState(prev => ({...prev, imageUri: uri}))}
            />
          )}
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateGroup1;

const styles = StyleSheet.create({
  safeAreaContainer: {flex: 1, backgroundColor: 'white'},
  keyboardContainer: {flex: 1},
  container: {
    marginHorizontal: 20,
    paddingBottom: height * 0.05,
  },
  text: {
    color: Theme.COLORS.GRAY,
    fontSize: Theme.SIZES.EVENT_DETAIL_TEXT_SIZE,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  button: {
    borderRadius: 10,
    marginTop: 30,
    backgroundColor: Theme.COLORS.BUTTON_1_BACKGROUND,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: Theme.SIZES.BUTTON_TEXT_SIZE,
    padding: 10,
    color: Theme.COLORS.BUTTON_1_TEXT,
    fontWeight: 'bold',
  },
  imageupload: {
    backgroundColor: '#EEEEEE',
    marginTop: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    width: 100,
    height: 100,
    borderColor: 'lightgrey',
    borderWidth: 1,
  },
  uploadIconText: {textAlign: 'center', color: 'black', marginTop: 10},
  v1: {flexDirection: 'row', marginBottom: -15},
  v2: {flexDirection: 'row-reverse', right: 35},
  keywordMinText: {color: 'grey', fontSize: 10},
  subText: {
    color: 'grey',
  },
  availabilityView: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 2,
  },
  imageuploaded: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
  },
  inputTitle: {
    fontSize: Theme.SIZES.INPUT_TITLE_SIZE,
    color: Theme.COLORS.BLACK,
    marginBottom: 2,
  },
  availabilitybox: {
    backgroundColor: Theme.COLORS.LIGHT_GRAY,
    padding: 8,
    borderRadius: 10,
  },
  availability: {
    fontSize: 12,
    color: Theme.COLORS.BLACK,
    textAlign: 'center',
  },
  errorText: {
    color: Theme.COLORS.ERROR,
    marginRight: 20,
  },
  boxescontainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  checkbox: {
    borderWidth: 1,
    borderColor: Theme.COLORS.LIGHT_GRAY,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputField: {
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    height: 48,
    borderRadius: 10,
    paddingLeft: 15,
    borderColor: Theme.COLORS.LIGHT_GRAY,
    color: 'black',
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 5,
  },

  keywordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    padding: 5,
    height: 35,
    margin: 5,
  },
  keywordText: {
    color: Theme.COLORS.BLACK,
    marginRight: 5,
  },
  textInput: {
    flex: 1,
    color: Theme.COLORS.BLACK,
  },
  codeAvailability: {
    color: 'green',
    fontSize: 14,
  },
  codeUnavailability: {
    color: Theme.COLORS.ERROR,
    fontSize: 14,
    width: '60%',
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 150,
    backgroundColor: 'lightgrey',
    justifyContent: 'center',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: -5,
    right: 10,
    backgroundColor: 'transparent',
    padding: 10,
  },
  modaltitle: {
    alignSelf: 'center',
    fontSize: 20,
    position: 'relative',
    top: -15,
    fontWeight: '500',
    color: 'black',
  },
  modalbuttoncontainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalicons: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'grey',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: -5,
    right: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 5,
  },
  TitleBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 20,
    color: 'black',
  },
  inputFiled: {
    width: '100%',
    color: 'black',
    borderWidth: 1,
    borderColor: 'lightgrey',
    borderRadius: 10,
    paddingHorizontal: 20,
  },
});
