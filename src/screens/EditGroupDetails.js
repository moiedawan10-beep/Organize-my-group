import {
  Dimensions,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DashboardHeader2 from '../components/DashboardHeader2';
import {Text} from 'react-native';
import {
  button1backgroundColor,
  button1TextColor,
  buttonTextSize,
  EventDetailTextSize,
  InputBorderColor,
  InputTitleSize,
  otherTextColor,
} from '../resources/styling';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchImageLibrary} from 'react-native-image-picker';
import {useDispatch} from 'react-redux';
import {GroupCodeAvailability} from '../redux/slices/GroupCodeAvailabilityCheckSlice';
import {useNavigation} from '@react-navigation/native';
import {EditGroupAction} from '../redux/slices/EditGroupSlice';
import ImagePicker from 'react-native-image-crop-picker';

const {height} = Dimensions.get('window');

const EditGroupDetails = ({route}) => {
  const navigation = useNavigation();
  const {data} = route.params;
  const [imageUri, setImageUri] = useState(null);
  const [name, setName] = useState('');
  const [groupcode, setGroupCode] = useState('');
  const [zipcode, setZipCode] = useState(data?.zip_code.toString() || '');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [error2, setError2] = useState('');
  const [selectedValue, setSelectedValue] = useState(0);
  const [keywords, setKeywords] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [groupType, setGroupType] = useState('');
  const [codeAvailability, setCodeAvailability] = useState('');
  const [flag, setFlag] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pickerFlag, setPickerFlag] = useState(false);
  let groupId = data?.id;

  const dispatch = useDispatch();

  useEffect(() => {
    if (data) {
      setImageUri(data?.photo_url_main);
      setName(data?.title);
      setGroupCode(data?.code);

      setDescription(data?.description);
      const separatedKeywords = data?.keywords.split(', ');
      setKeywords(separatedKeywords);
      setGroupType(data?.privacy);
      if (data?.privacy === 'public') {
        setSelectedValue(1);
      } else if (data?.privacy === 'private') {
        setSelectedValue(2);
      }
    }
  }, [data]);

  const checkGroupCodeAvailability = async () => {
    if (!groupcode) {
      setCodeAvailability('Provide Group Code');
      setFlag(false);
      return;
    }
    const response = await dispatch(
      GroupCodeAvailability({groupcode, groupId}),
    );
    if (
      response.payload === 'ERR_BAD_REQUEST' ||
      response.payload === 'ERR_NETWORK'
    ) {
      setCodeAvailability('Code Already Taken');
      setFlag(false);
    } else {
      setCodeAvailability('Code available');
      setFlag(true);
    }
  };

  const handleInputChange = text => {
    setInputValue(text);
    if (keywords?.length >= 5) {
      setError2('You can only add up to 5 keywords');
      return;
    } else {
      setError2('');
    }

    if (text.endsWith(',') || text.endsWith(' ')) {
      const newKeyword = text.trim();
      if (newKeyword && !keywords.includes(newKeyword)) {
        setKeywords([...keywords, newKeyword]);
      }
      setInputValue('');
    }
  };

  const handleKeyPress = e => {
    if (e.nativeEvent.key === 'Backspace' && inputValue === '') {
      setKeywords(keywords.slice(0, -1));
    }
  };

  const submitData = async () => {
    if (!name || !groupcode || !zipcode || !selectedValue) {
      setError('*');
      return;
    }
    if (name.length < 3) {
      setError2('Group Name must be 3 characters or long');
      return;
    }
    if (zipcode.length !== 5) {
      setError2('Zip Code must be 5 digits long');
      return;
    }

    setError2('');
    setLoading(true);

    const words = keywords.join(', ');
    const payload = {
      id: data.id,
      imageUri,
      name,
      groupcode,
      zipcode,
      description,
      groupType,
      words,
    };
    const response = await dispatch(EditGroupAction(payload));
    if (response?.payload?.status_code === 200) {
      navigation.navigate('Group Details', {id: payload.id, isUpdated: true});
    }
    setLoading(false);
  };

  const selectImage = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const uri = response.assets[0].uri;
        setImageUri(uri);
      }
    });
  };

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
        setPickerFlag(false);
      })
      .catch(error => {
        if (error.code === 'E_PICKER_CANCELLED') {
          console.log('Image selection cancelled');
        } else {
          Alert.alert('Error', error.message);
        }
      });
  };

  const takePhoto = () => {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
      mediaType: 'photo',
      cropperCircleOverlay: true,
      showCropFrame: false,
      cropperActiveWidgetColor: 'red',
    })
      .then(response => {
        setImageUri(response.path);
        setPickerFlag(false);
      })
      .catch(error => {
        if (error.code === 'E_PICKER_CANCELLED') {
          console.log('Camera operation cancelled');
        } else {
          Alert.alert('Error', error.message);
        }
      });
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <DashboardHeader2 title="Edit Group" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <KeyboardAvoidingView style={{flex: 1}}>
          {/* IMAGE */}
          {imageUri ? (
            <TouchableOpacity
              onPress={() => setPickerFlag(true)}
              style={styles.imageupload}>
              <Image
                source={{uri: imageUri}}
                resizeMode="cover"
                style={styles.imageuploaded}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.imageupload}
              onPress={() => setPickerFlag(true)}>
              <Icon name="camera-outline" size={30} color="#848484" />
            </TouchableOpacity>
          )}
          <Text style={{textAlign: 'center', color: 'black', marginTop: 10}}>
            Change Group icon
          </Text>

          {/* INPUT FIELDS */}
          <View style={styles.TitleBox}>
            <Text style={styles.inputTitle}>Group Name: </Text>
            {name.length === 0 && error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
          </View>
          <View style={styles.inputField}>
            <TextInput
              style={{width: '100%', color: 'black'}}
              placeholder="Enter Here"
              placeholderTextColor="lightgrey"
              value={name}
              maxLength={30}
              onChangeText={text => setName(text)}
            />
          </View>

          <View style={styles.TitleBox}>
            <Text style={styles.inputTitle}>Group Code: </Text>
            {groupcode.length === 0 && error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
          </View>
          <View style={styles.inputField}>
            <TextInput
              style={{width: '100%', color: 'black'}}
              placeholder="Enter Here"
              placeholderTextColor="lightgrey"
              value={groupcode}
              onChangeText={text => setGroupCode(text)}
            />
          </View>
          <View
            style={{
              justifyContent: 'space-between',
              flexDirection: 'row',
              marginTop: 2,
            }}>
            <Text
              style={
                flag ? styles.codeAvailability : styles.codeUnavailability
              }>
              {codeAvailability}
            </Text>
            <TouchableOpacity
              style={styles.availabilitybox}
              onPress={checkGroupCodeAvailability}>
              <Text style={styles.availability}>Check availability </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.TitleBox}>
            <Text style={styles.inputTitle}>Primary Zip Code: </Text>
            {zipcode.length === 0 && error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
          </View>
          <View style={styles.inputField}>
            <TextInput
              style={{width: '80%', color: 'black'}}
              placeholder="Enter Here"
              placeholderTextColor="lightgrey"
              value={zipcode}
              keyboardType="numeric"
              maxLength={5}
              onChangeText={text => setZipCode(text)}
            />
          </View>

          <View style={{marginTop: 20}}>
            <Text style={styles.inputTitle}>Group Description: </Text>
            <View style={styles.inputField}>
              <TextInput
                style={{width: '100%', color: 'black'}}
                placeholder="Enter Here"
                placeholderTextColor="lightgrey"
                value={description}
                maxLength={110}
                onChangeText={text => setDescription(text)}
              />
            </View>
          </View>
          {/* GROUP TYPE */}
          <View style={{marginTop: 20}}>
            <Text style={styles.inputTitle}>Group Type: </Text>
            {/* Public */}
            <View style={styles.boxescontainer}>
              <TouchableOpacity
                style={{alignItems: 'center', marginRight: 20}}
                onPress={() => {
                  setSelectedValue(1), setGroupType('public');
                }}>
                <View style={styles.checkbox}>
                  {selectedValue === 1 && (
                    <Image
                      source={require('../assets/tick.png')}
                      resizeMode="contain"
                      style={{width: 15, height: 15}}
                    />
                  )}
                </View>
                <Text style={{color: 'grey'}}>Public</Text>
              </TouchableOpacity>
              {/* Public */}
              <TouchableOpacity
                style={{alignItems: 'center'}}
                onPress={() => {
                  setSelectedValue(2), setGroupType('private');
                }}>
                <View style={styles.checkbox}>
                  {selectedValue === 2 && (
                    <Image
                      source={require('../assets/tick.png')}
                      resizeMode="contain"
                      style={{width: 15, height: 15}}
                    />
                  )}
                </View>
                <Text style={{color: 'grey'}}>Private</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{marginTop: 20}}>
            <Text style={styles.inputTitle}>Keywords: </Text>
            <View
              style={[styles.inputField, {flexWrap: 'wrap', height: 'auto'}]}>
              <View style={styles.keywordsContainer}>
                <FlatList
                  data={keywords}
                  numColumns={2}
                  keyExtractor={item => item}
                  renderItem={({item}) => (
                    <View style={styles.keywordContainer}>
                      <Text style={styles.keywordText}>{item}</Text>
                    </View>
                  )}
                  contentContainerStyle={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                  }}
                  style={{flexGrow: 0}}
                />
              </View>

              <TextInput
                style={styles.textInput}
                placeholder={keywords.length === 0 ? 'Add keyword' : ''}
                placeholderTextColor="lightgrey"
                value={inputValue}
                onChangeText={handleInputChange}
                onKeyPress={handleKeyPress}
                onSubmitEditing={() => {
                  if (inputValue.trim()) {
                    handleInputChange(inputValue);
                  }
                }}
              />
            </View>
            <Text style={{color: 'grey', fontSize: 10}}>
              Keywords (5 max, click spacebar to confirm each word)
            </Text>
            {error2 && <Text style={styles.errorText}>{error2}</Text>}
          </View>

          {/* BUTTON */}

          <TouchableOpacity
            style={styles.button}
            onPress={loading ? null : submitData}>
            {loading ? (
              <ActivityIndicator color="white" size={43} />
            ) : (
              <Text style={styles.buttonText}>Edit My Group </Text>
            )}
          </TouchableOpacity>

          <Modal transparent={true} visible={pickerFlag}>
            <View style={styles.overlay}>
              <View style={styles.modal}>
                <Text style={styles.modaltitle}>Profile photo</Text>

                <View style={styles.modalbuttoncontainer}>
                  <View style={{alignItems: 'center'}}>
                    <TouchableOpacity
                      onPress={takePhoto}
                      style={styles.modalicons}>
                      <Icon name="camera" color={otherTextColor} size={30} />
                    </TouchableOpacity>
                    <Text style={{color: 'black'}}>Camera</Text>
                  </View>

                  <View style={{alignItems: 'center'}}>
                    <TouchableOpacity
                      onPress={pickImage}
                      style={styles.modalicons}>
                      <Icon name="image" color={otherTextColor} size={30} />
                    </TouchableOpacity>
                    <Text style={{color: 'black'}}>Gallery</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setPickerFlag(false)}>
                  <Text style={{color: 'black', fontSize: 20}}>✖</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditGroupDetails;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: height * 0.02,
    paddingBottom: height * 0.08,
    // flex: 1,
  },
  title: {
    color: 'black',
    fontSize: 19,
    fontWeight: '500',
  },
  text: {
    color: 'grey',
    fontSize: EventDetailTextSize,
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
    backgroundColor: button1backgroundColor,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: buttonTextSize,
    padding: 10,
    color: button1TextColor,
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
  },
  imageuploaded: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
  },
  inputTitle: {
    fontSize: InputTitleSize,
    color: 'black',
    marginBottom: 2,
  },
  availabilitybox: {
    backgroundColor: 'lightgrey',
    padding: 8,
    borderRadius: 10,
  },
  availability: {
    fontSize: 12,
    color: 'black',
  },
  errorText: {
    color: 'red',
    alignSelf: 'baseline',
    marginRight: 20,
  },
  boxescontainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  checkbox: {
    borderWidth: 1,
    borderColor: 'lightgrey',
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
    borderColor: InputBorderColor,
    color: 'black',
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow wrapping
    alignItems: 'center',
    marginBottom: 5, // Avoid crowding
  },
  keywordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    padding: 5,
    height: 35,
    margin: 5, // Added margin to avoid overlap
  },
  keywordText: {
    color: 'black',
    marginRight: 5,
  },
  textInput: {
    flex: 1,
    color: 'black',
  },
  codeAvailability: {
    color: 'green',
    fontWeight: '500',
    fontSize: 14,
  },
  codeUnavailability: {
    color: 'red',
    fontWeight: '500',
    fontSize: 14,
    // borderWidth:1,
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
  TitleBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 20,
    color: 'black',
  },
});
