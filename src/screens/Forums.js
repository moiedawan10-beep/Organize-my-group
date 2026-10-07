import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ToastAndroid,
  Platform,
  Image,
} from 'react-native';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import DashboardHeader2 from '../components/DashboardHeader2';
import {useNavigation, useRoute} from '@react-navigation/native';
import PictureIcon from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useDispatch, useSelector} from 'react-redux';
import {otherTextColor, PageTitleColor} from '../resources/styling';
import {GetForum} from '../redux/slices/ForumGetSlice';
import {CreateForum} from '../redux/slices/ForumCreateSlice';
import moment from 'moment';
import CustomAlertModal from '../components/CustomAlertModal';
import {DeleteForum} from '../redux/slices/ForumDeleteSlice';
import ImageModal from '../components/ImageModal';
import {AllMembersAction} from '../redux/slices/AllmembersSlice';
import {
  MentionInput,
} from 'react-native-controlled-mentions';
import {DeleteForumMedia} from '../redux/slices/DeleteAttachmentsSlice';
import FastImage from 'react-native-fast-image';
import ImagePicker from 'react-native-image-crop-picker';
import {uploadAttachments} from '../redux/slices/UploadAttachmentsSlice';
import RNFetchBlob from 'rn-fetch-blob';
import {renderMessageTextWithMentions} from '../constants/utils';
import AttachmentsGrid from '../components/AttachmentsGrid';

const {height} = Dimensions.get('window');

const Forums = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const {
    resource_id,
    is_member,
    allow_notification,
    allow_user_notification,
    is_Group_Owner,
  } = route?.params;
  const [message, setMessage] = useState('');
  const [forumData, setForumData] = useState([]);
  const [forumId, setForumId] = useState();
  const [messageId, setMessageId] = useState();
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [fullImage, setIsFullImage] = useState(false);
  const [imagePath, setImagePath] = useState('');
  const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [replyToPostId, setReplyToPostId] = useState(null);
  const [quote, setQuote] = useState(false);
  const flatListRef = useRef();
  const hasScrolled = useRef(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState(1);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [scrolledItems, setScrolledItems] = useState(0);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [isUserAtBottom, setIsUserAtBottom] = useState(false);
  const [initialScroll, setInitialScroll] = useState(false);
  const [membersData, setMembersData] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [uploadingIds, setUploadingIds] = useState([]);
  const [uploadedFileIds, setUploadedFileIds] = useState([]);
  const [loadingIndexes, setLoadingIndexes] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const ForumData = async () => {
    setLoading(true);
    const resourceId = resource_id;
    const resourceType = 'group';
    const response = await dispatch(
      GetForum({resourceType, resourceId, forumId, currentPage: 1}),
    );
    if (response) {
      setTotalPageCount(response?.payload?.body?.totalPages);
      setForumId(response?.payload?.body?.forum?.id);
      const newData = response?.payload?.body?.response || [];
      setCurrentPage(1);
      setForumData(newData);
      flatListRef.current?.scrollToEnd({animated: true});
    } else {
      Alert.alert('Network Error!', 'Try Later');
    }
    setLoading(false);
  };

  useEffect(() => {
    ForumData();
    const intervalId = setInterval(() => {
      setInitialScroll(true);
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const ForumDataNew = async () => {
    const resourceId = resource_id;
    const resourceType = 'group';
    const response = await dispatch(
      GetForum({resourceType, resourceId, forumId, currentPage: 1}),
    );
    if (response) {
      setForumId(response?.payload?.body?.forum?.id);
      const newData = response?.payload?.body?.response || [];
      setForumData(prevData => {
        const existingDataIds = new Set(prevData.map(post => post.id));
        const newPosts = newData.filter(post => !existingDataIds.has(post.id));
        const updatedPosts = [...prevData];
        newData.forEach(post => {
          const existingPostIndex = prevData.findIndex(
            existing => existing.id === post.id,
          );
          if (existingPostIndex !== -1) {
            const existingPost = prevData[existingPostIndex];
            const prevRepliesCount = existingPost.replies?.length || 0;
            const newRepliesCount = post.replies?.length || 0;

            if (newRepliesCount > prevRepliesCount) {
              updatedPosts[existingPostIndex] = {
                ...existingPost,
                replies: post.replies,
              };
            }
          }
        });
        updatedPosts.push(...newPosts);
        if (newPosts.length > 0) {
          setNewMessagesCount(prevCount => prevCount + newPosts.length);
        }
        return updatedPosts;
      });
    } else {
      Alert.alert('Network Error!', 'Try Later');
    }
  };

  useEffect(() => {
    let mounted = true;
    const intervalId = setInterval(() => {
      if (mounted) {
        ForumDataNew();
      }
    }, 4000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
      setMediaList([]);
      setUploadingIds([]);
      setUploadedFileIds([]);
      setForumData([]);
    };
  }, [dispatch]);

  const nextForumData = async () => {
    if (currentPage < totalPageCount && !loading) {
      setLoading(true);
      const resourceId = resource_id;
      const resourceType = 'group';
      const response = await dispatch(
        GetForum({
          resourceType,
          resourceId,
          forumId,
          currentPage: currentPage + 1,
        }),
      );
      if (response) {
        const newData = response?.payload?.body?.response || [];
        const allData = [...forumData, ...newData];
        const sortedData = allData.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at),
        );
        setForumData(sortedData);
        if (currentPage < response?.payload?.body?.totalPages) {
          setCurrentPage(currentPage + 1);
        }
      } else {
        Alert.alert('Network Error!', 'Try Later');
      }
      setLoading(false);
    }
  };

  const stripMentionsFromText = text => {
    // console.log(text, 'text data');
    return text.replace(/@\[(.*?)\]\(\d+\)/g, '$1').trim();
  };

  const handleSendMessage = async () => {
    const rawText = replyToPostId ? replyMessage.trim() : message.trim();
    const plainText = stripMentionsFromText(rawText);
    const hasText = plainText !== '';
    const hasAttachments = uploadedFileIds.length > 0;
    if (!hasText && !hasAttachments) {
      return;
    }
    const payload = {
      parent_id: replyToPostId || 0,
      body: plainText,
      type: quote ? 'quote' : replyToPostId ? 'reply' : 'post',
      id: forumId,
      mentions: mentions,
      attachments: uploadedFileIds,
    };
    try {
      setSendLoading(true);
      await dispatch(CreateForum(payload));
      setMessage('');
      setReplyMessage('');
      setQuote(false);
      setReplyToPostId(null);
      setUploadedFileIds([]);
      setUploadingIds([]);
      setMediaList([]);
      ForumData();
      // flatListRef.current?.scrollToEnd({animated: true});
    } catch (error) {
      console.log('Error creating post:', error);
      Alert.alert('Failure', 'Failed to post message!');
    } finally {
      setSendLoading(false);
    }
  };

  const deleteMessage = async id => {
    setIsDeleteAlertVisible(false);
    try {
      const response = await dispatch(DeleteForum(id));
      if (response?.payload?.status_code === 200) {
        ForumData();
        ToastAndroid.show(
          `${
            quote ? 'Quote' : expandedPostId ? 'Reply' : 'Post'
          } deleted successfully!`,
          ToastAndroid.SHORT,
        );
      } else {
        Alert.alert('Failure', 'Failed to delete post!');
      }
    } catch (error) {
      console.error('Error deleting forum post:', error);
      Alert.alert('Error', 'Failed to delete post!');
    }
  };

  const handleFullImage = useCallback(image => {
    if (!image) return;
    setIsFullImage(true);
    setImagePath(image);
  }, []);

  const handleReply = useCallback(post => {
    // console.log('post======');
    if (!post) return;
    setReplyToPostId(post.id ?? null);
    setReplyText(post.body ?? '');
    setReplyMessage('');
    setQuote(false);
  }, []);

  const cancelReply = useCallback(() => {
    // console.log('cancle');
    setReplyToPostId(null);
    setReplyMessage('');
    setQuote(false);
  }, []);

  const handleQuote = useCallback(post => {
    if (!post) return;
    setQuote(true);
    setReplyToPostId(post.id ?? null);
    setReplyText(post.body ?? '');
    setReplyMessage('');
  }, []);

  const formatTimestamp = timestamp => {
    if (!timestamp) return '';

    const now = moment();
    const time = moment(timestamp);
    const diffInSeconds = now.diff(time, 'seconds');

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    return time.fromNow();
  };

  const handlePickImage = async () => {
    try {
      if (mediaList.length >= 15) {
        Alert.alert('Limit reached', 'You can only upload up to 15 images.');
        return;
      }
      const image = await ImagePicker.openPicker({
        mediaType: 'photo',
        cropping: false,
        includeExif: true,
        includeBase64: false,
      });
      const fileType = image.mime;
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/jpg',
      ];
      if (!allowedMimeTypes.includes(fileType)) {
        Alert.alert('Invalid file type', 'Only images and GIFs are allowed.');
        return;
      }
      const actualUri =
        Platform.OS === 'android' && image.path.startsWith('file://')
          ? image.path
          : image.path;
      const tempId = `${Date.now()}-${Math.random()}`;
      const newMedia = {
        id: tempId,
        uri: actualUri,
        mime: fileType,
        uploaded: false,
      };
      setMediaList(prev => [...prev, newMedia]);
      setUploadingIds(prev => [...prev, tempId]);
      const file = {
        uri: actualUri,
        type: fileType,
        name:
          image.filename || `upload-${Date.now()}.${fileType.split('/')[1]}`,
      };
      const response = await dispatch(uploadAttachments({forumId, file}));
      if (response?.payload?.body?.file_id) {
        const uploadedData = response.payload.body;
        setMediaList(prev =>
          prev.map(media =>
            media.id === tempId
              ? {...media, uploaded: true, file: uploadedData}
              : media,
          ),
        );
        setUploadedFileIds(prev => [...prev, uploadedData.id]);
      } else {
        setMediaList(prev => prev.filter(media => media.id !== tempId));
      }
      setUploadingIds(prev => prev.filter(id => id !== tempId));
    } catch (error) {
      console.log('Image pick error:', error);
    }
  };

  const removeMedia = async id => {
    try {
      const mediaToRemove = mediaList.find(m => m.id === id);
      if (!mediaToRemove) return;

      const file = mediaToRemove.file;
      const fileIdToRemove = file?.id ?? file?.file_id;
      const mediaId = fileIdToRemove;
      const forumID = forumId ?? 1;

      if (forumID && mediaId) {
        await dispatch(DeleteForumMedia({forumID, mediaId}));
      }

      setMediaList(prev => prev.filter(media => media.id !== id));
      setUploadedFileIds(prev => prev.filter(fid => fid !== fileIdToRemove));
      setUploadingIds(prev => prev.filter(uploadingId => uploadingId !== id));
    } catch (error) {
      console.error('Error removing media:', error);
      Alert.alert('Error', 'Failed to remove media. Please try again.');
    }
  };

  const onScroll = event => {
    const contentOffsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    const distanceFromBottom = contentHeight - layoutHeight - contentOffsetY;
    if (distanceFromBottom > 10) {
      setIsUserAtBottom(true);
      setScrolledItems(prev => prev + 1);
      if (scrolledItems >= 10 && !showScrollToBottom) {
        setShowScrollToBottom(true);
      }
    } else {
      setIsUserAtBottom(false);
      setShowScrollToBottom(false);
      setNewMessagesCount(0);
    }
    if (contentOffsetY <= 0 && !loading) {
      nextForumData();
    }
  };

  const handleScrollToBottom = () => {
    setNewMessagesCount(0);
    flatListRef.current?.scrollToEnd({animated: true});
    setShowScrollToBottom(false);
  };

  useEffect(() => {
    if (initialScroll == true) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
        hasScrolled.current = true;
      }, 70);
    }
  }, [initialScroll]);

  const handleRepliesExpand = postId => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
    }
  };

  const loadMembers = async () => {
    const response = await dispatch(
      AllMembersAction({id: resource_id, nextPage: 0}),
    );
    setMembersData(response?.payload?.response);
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const renderTextWithMentions = (text, mentions, navigation) => {
    const parts = renderMessageTextWithMentions(text, mentions);

    return parts.map((part, index) => {
      if (typeof part === 'string') {
        return <Text key={index}>{part}</Text>;
      } else if (part.isMention) {
        const isUser = part.type === 'user';

        return (
          <Text
            key={index}
            style={{color: otherTextColor, fontWeight: 'bold'}}
            onPress={() => {
              if (isUser && part.id) {
                navigation.navigate('User Profile', {id: part.id});
              }
            }}>
            {part.text}
          </Text>
        );
      }
      return null;
    });
  };

  const renderAttachments = attachments => (
    <AttachmentsGrid attachments={attachments} onPressImage={handleFullImage} />
  );

  const renderUserInfo = (user, imageStyle) => (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <TouchableOpacity onPress={() => handleFullImage(user.photo_url_main)}>
        <Image source={{uri: user?.photo_url_main}} style={imageStyle} />
      </TouchableOpacity>
      <Text style={styles.username}>
        {user.owner_title.length > 25
          ? user.owner_title.substring(0, 25) + '...'
          : user.owner_title}
      </Text>
    </View>
  );

  const renderItem = ({item}) => {
    // console.log(item, 'item data')
    const replies = item.replies || [];
    const replyCount = replies.length;
    const isQuote = item.type === 'quote';

    return (
      <View style={styles.messageContainer}>
        <View style={styles.messageHeader}>
          {renderUserInfo(item, styles.userImage)}
          <Text style={styles.timestamp}>
            {formatTimestamp(item.created_at)}
          </Text>
        </View>

        {isQuote ? (
          <View style={styles.quoteContainer}>
            {renderAttachments(item?.parent?.attachments)}
            {item?.parent?.body.length > 0 && (
              <Text style={styles.parentMessage}>
                {renderTextWithMentions(
                  item?.parent?.body || 'No content available',
                  item?.parent?.mentions || [],
                  navigation,
                )}
              </Text>
            )}
            <Text style={styles.quoteOwner}>
              -{' '}
              {item?.parent?.owner_title?.length > 25
                ? item.parent.owner_title.substring(0, 25) + '...'
                : item?.parent?.owner_title || 'Unknown User'}
            </Text>
            <Text style={styles.quoteText}>
              {renderTextWithMentions(item.body, item.mentions, navigation)}
            </Text>
            {renderAttachments(item.attachments)}
          </View>
        ) : (
          <View>
            {!isQuote && renderAttachments(item.attachments)}
            <Text style={styles.messageText}>
              {renderTextWithMentions(item.body, item.mentions, navigation)}
            </Text>
          </View>
        )}

        <View style={styles.likeContainer}>
          {replyCount > 0 && (
            <TouchableOpacity onPress={() => handleRepliesExpand(item.id)}>
              <Text style={{color: PageTitleColor, fontSize: 12}}>
                {`replies (${replyCount})`}
              </Text>
            </TouchableOpacity>
          )}

          <View
            style={{
              flexDirection: 'row-reverse',
              position: 'absolute',
              right: 0,
            }}>
            {(is_Group_Owner || item.is_owner) && (
              <TouchableOpacity
                style={styles.likeButton}
                onPress={() => {
                  setMessageId(item.id);
                  if (isQuote) setQuote(true);
                  setExpandedPostId(null);
                  setIsDeleteAlertVisible(true);
                }}>
                <MaterialIcons name="delete" size={15} color={'red'} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => handleReply(item)}>
              <Entypo name="reply" size={17} color={'lightgrey'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => handleQuote(item)}>
              <FontAwesome name="quote-left" size={13} color={'lightgrey'} />
            </TouchableOpacity>
          </View>
        </View>

        {expandedPostId === item.id && replyCount > 0 && (
          <View style={styles.repliesContainer}>
            {replies?.map((reply, index) => (
              <View key={index}>
                <View style={styles.messageHeader}>
                  {renderUserInfo(reply, styles.replyImage)}
                  <Text style={[styles.timestamp, {fontSize: 10}]}>
                    {formatTimestamp(reply.created_at)}
                  </Text>
                </View>
                {renderAttachments(reply.attachments)}
                <View
                  style={{
                    paddingHorizontal: 5,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingBottom: 15,
                    borderLeftWidth: 1,
                    borderLeftColor: 'lightgrey',
                  }}>
                  <Text style={{color: 'grey'}}>
                    {renderTextWithMentions(
                      reply.body,
                      reply.mentions,
                      navigation,
                    )}
                  </Text>
                  {(is_Group_Owner || reply.is_owner) && (
                    <TouchableOpacity
                      style={styles.likeButton}
                      onPress={() => {
                        setMessageId(reply.id);
                        setIsDeleteAlertVisible(true);
                      }}>
                      <MaterialIcons name="delete" size={15} color={'red'} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const formattedMembers = [
    {
      id: resource_id,
      name: 'group',
      type: 'group',
      photo: null,
    },
    ...membersData?.map(member => ({
      id: member.id.toString(),
      name: `${member.first_name} ${member.last_name}`,
      type: 'user',
      photo: member?.photo_url_main || null,
    })),
  ];

  const handleMentionSelect = item => {
    setMentions(prev => {
      const alreadyExists = prev.find(
        m => m.id === item.id && m.type === item.type,
      );
      if (alreadyExists) return prev;
      return [
        ...prev,
        {
          type: item.type,
          id: parseInt(item.id),
          text: item.name,
        },
      ];
    });
  };

  const syncMentions = (text, isReply = false) => {
    const mentionMatches = Array.from(
      text.matchAll(/@\[(.+?)\]\((\d+)\)/g),
    ).map(match => ({
      text: match[1],
      id: parseInt(match[2]),
    }));

    setMentions(prevMentions =>
      prevMentions.filter(m =>
        mentionMatches.some(mm => mm.id === m.id && mm.text === m.text),
      ),
    );
  };

  const _onImageChange = async event => {
    if (isUploading) {
      Alert.alert(
        'Please wait',
        'A file is still uploading. Please wait until it finishes.',
      );
      return;
    }

    try {
      setIsUploading(true);

      const {uri, linkUri, mime} = event.nativeEvent;
      // console.log(mime, linkUri, uri, 'mime');
      const fileUrl = linkUri || uri;

      if (!fileUrl || !fileUrl.startsWith('http')) {
        Alert.alert(
          'Unsupported sticker',
          'This sticker cannot be accessed due to Android system restrictions from the keyboard. You can Pick Gifs&Stickers from Gallery.',
        );
        setIsUploading(false);
        return;
      }

      const fileExt = fileUrl.split('.').pop().split('?')[0];
      const tempPath = `${
        RNFetchBlob.fs.dirs.CacheDir
      }/sticker-${Date.now()}.${fileExt}`;

      const res = await RNFetchBlob.config({
        fileCache: true,
        path: tempPath,
      }).fetch('GET', fileUrl);

      const localFilePath = 'file://' + res.path();
      const tempId = `${Date.now()}-${Math.random()}`;
      const mimeType = mime || (fileExt === 'gif' ? 'image/gif' : 'image/png');

      const newMedia = {
        id: tempId,
        uri: localFilePath,
        mime: mimeType,
        uploaded: false,
      };

      setMediaList(prev => [...prev, newMedia]);
      setUploadingIds(prev => [...prev, tempId]);

      // Upload to backend
      const file = {
        uri: localFilePath,
        type: mimeType,
        name: `upload-${Date.now()}.${fileExt}`,
      };

      const response = await dispatch(uploadAttachments({forumId, file}));

      if (response?.payload?.body?.file_id) {
        const uploadedData = response.payload.body;

        setMediaList(prev =>
          prev.map(media =>
            media.id === tempId
              ? {...media, uploaded: true, file: uploadedData}
              : media,
          ),
        );
        setUploadedFileIds(prev => [...prev, uploadedData.id]);
      } else {
        setMediaList(prev => prev.filter(media => media.id !== tempId));
      }

      setUploadingIds(prev => prev.filter(id => id !== tempId));
    } catch (err) {
      console.error('Sticker Upload Error:', err.message);
      Alert.alert('Upload Error', 'Could not upload sticker or gif.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* Header */}
      <DashboardHeader2
        title="Group Chat"
        isBack={true}
        isSetting={is_member}
        groupId={resource_id}
        isAllowNotification={allow_notification}
        isUserNotification={allow_user_notification}
      />

      <View style={{flex: 1}}>
        {/* Post List  */}
        <FlatList
          ref={flatListRef}
          data={forumData ? [...forumData] : []}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={[styles.container]}
          onScroll={onScroll}
          keyboardShouldPersistTaps="always"
          ListEmptyComponent={
            !loading && (
              <View style={styles.listEmpty}>
                <Icon color="black" name="twitch" size={40} />
                <Text style={styles.messageText}>No Message</Text>
              </View>
            )
          }
          ListHeaderComponent={
            loading && (
              <ActivityIndicator size={'small'} color={otherTextColor} />
            )
          }
        />
        {/* {showScrollToBottom && (
          <TouchableOpacity
            style={styles.scrollToBottomButton}
            onPress={handleScrollToBottom}>
            <Icon name="arrow-down" size={30} color="black" />
            {newMessagesCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{newMessagesCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )} */}
        <View style={styles.inputContainer}>
          {replyToPostId && (
            <View style={styles.replyContainer}>
              <View style={styles.replyBubble}>
                <Text style={styles.replyText}>
                  {quote
                    ? `Quote to ${
                        (forumData.find(post => post.id === replyToPostId)
                          ?.owner_title.length > 25
                          ? forumData
                              .find(post => post.id === replyToPostId)
                              ?.owner_title.slice(0, 25) + '...'
                          : forumData.find(post => post.id === replyToPostId)
                              ?.owner_title) || ''
                      }:`
                    : `Replying to ${
                        (forumData.find(post => post.id === replyToPostId)
                          ?.owner_title.length > 25
                          ? forumData
                              .find(post => post.id === replyToPostId)
                              ?.owner_title.slice(0, 25) + '...'
                          : forumData.find(post => post.id === replyToPostId)
                              ?.owner_title) || ''
                      }:`}
                </Text>

                {/* Text of the quoted/replied message */}
                <Text style={styles.replyMessage}>
                  "
                  {renderMessageTextWithMentions(
                    forumData
                      .find(post => post.id === replyToPostId)
                      ?.body.substring(0, 100) || '',
                    forumData.find(post => post.id === replyToPostId)
                      ?.mentions || [],
                  ).map((part, index) =>
                    typeof part === 'string' ? (
                      <Text key={index}>{part}</Text>
                    ) : part.isMention ? (
                      <Text
                        key={index}
                        style={{color: otherTextColor, fontWeight: 'bold'}}>
                        {part.text}
                      </Text>
                    ) : null,
                  )}
                  ..."
                </Text>

                {/* Show first attachment image if available */}
                {forumData.find(post => post.id === replyToPostId)?.attachments
                  ?.length > 0 && (
                  <FastImage
                    source={{
                      uri: forumData.find(post => post.id === replyToPostId)
                        .attachments[0].photo_url_main,
                    }}
                    style={styles.replyImageStyle}
                    resizeMode="cover"
                  />
                )}
              </View>
              <TouchableOpacity
                style={styles.cancelReplyButton}
                onPress={cancelReply}>
                <MaterialIcons name="cancel" size={20} color={'red'} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.mentionInputContainer}>
            <TouchableOpacity
              onPress={handlePickImage}
              style={styles.galleryIcon}>
              <PictureIcon name="picture" size={35} color={otherTextColor} />
            </TouchableOpacity>
            <View style={{flex: 1}}>
              <FlatList
                data={mediaList}
                keyExtractor={item => item.id.toString()}
                numColumns={3}
                contentContainerStyle={{paddingVertical: 10}}
                columnWrapperStyle={{justifyContent: 'flex-start'}}
                renderItem={({item}) => (
                  <View style={styles.uploadImageContainer}>
                    <View style={{position: 'relative'}}>
                      <FastImage
                        source={{uri: item.uri}}
                        style={styles.uploadImages}
                        resizeMode="cover"
                      />
                      {uploadingIds.includes(item.id) && (
                        <View style={styles.imageLoader}>
                          <ActivityIndicator size="small" color="gray" />
                        </View>
                      )}
                      {!uploadingIds.includes(item.id) && (
                        <TouchableOpacity
                          onPress={() => removeMedia(item.id)}
                          style={styles.cancelImageIcon}>
                          <Text style={styles.cancelImageText}>✕</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              />
              <MentionInput
                value={replyToPostId ? replyMessage : message}
                multiline={true}
                onImageChange={_onImageChange}
                style={[
                  styles.input,
                  {minHeight: 40, maxHeight: 100, textAlignVertical: 'center'},
                ]}
                onChange={text => {
                  if (replyToPostId) {
                    setReplyMessage(text);
                    syncMentions(text, true);
                  } else {
                    setMessage(text);
                    syncMentions(text, false);
                  }
                }}
                partTypes={[
                  {
                    trigger: '@',
                    renderSuggestions: ({keyword, onSuggestionPress}) => {
                      if (keyword === undefined) keyword = '@';
                      const filteredMembers = formattedMembers
                        .filter(user =>
                          user.name
                            .toLowerCase()
                            .includes(keyword.toLowerCase()),
                        )
                        .filter(
                          user =>
                            !mentions.some(
                              m =>
                                m.id === parseInt(user.id) &&
                                m.type === user.type,
                            ),
                        );
                      return (
                        <View
                          style={{backgroundColor: 'white', maxHeight: 150}}>
                          <FlatList
                            data={filteredMembers}
                            keyExtractor={item => item.id}
                            keyboardShouldPersistTaps={'handled'}
                            renderItem={({item}) => (
                              <TouchableOpacity
                                onPress={() => {
                                  onSuggestionPress(item);
                                  handleMentionSelect(item);
                                }}
                                style={styles.suggestionsMainContainer}>
                                {item.photo ? (
                                  <Image
                                    source={{uri: item.photo}}
                                    style={styles.suggestionAvatar}
                                  />
                                ) : (
                                  <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                      {item.name[0]}
                                    </Text>
                                  </View>
                                )}
                                <Text
                                  style={{
                                    fontWeight: 'bold',
                                    color: otherTextColor,
                                  }}>
                                  {item.name.trim().length > 20
                                    ? item.name.trim().substring(0, 20) + '...'
                                    : item.name.trim()}
                                </Text>
                              </TouchableOpacity>
                            )}
                          />
                        </View>
                      );
                    },
                    textStyle: {fontWeight: 'bold', color: otherTextColor},
                  },
                ]}
                placeholder={
                  quote
                    ? 'Quote to post...'
                    : replyToPostId
                    ? 'Reply to post...'
                    : 'Type here...'
                }
                placeholderTextColor={'grey'}
              />
            </View>

            <TouchableOpacity
              style={[styles.sendButton]}
              onPress={handleSendMessage}
              disabled={
                sendLoading ||
                uploadingIds.length > 0 ||
                (!message && !replyMessage && !uploadedFileIds.length > 0)
              }>
              {sendLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Icon name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {isDeleteAlertVisible && (
        <CustomAlertModal
          visible={isDeleteAlertVisible}
          onClose={() => {
            setQuote(false), setIsDeleteAlertVisible(false);
          }}
          onOperation={() => {
            flatListRef.current?.scrollToEnd({animated: true});
            deleteMessage(messageId), setQuote(false);
          }}
          onCancel={() => {
            setQuote(false), setIsDeleteAlertVisible(false);
          }}
          title={`Delete ${
            quote ? 'Quote' : expandedPostId ? 'Reply' : 'Post'
          }`}
          subtitle={`Are you sure you want to delete this ${
            quote ? 'quote' : expandedPostId ? 'reply' : 'post'
          }?`}
          operationButtonLabel={'Delete'}
          IconName="delete"
        />
      )}
      {fullImage && (
        <ImageModal
          imageUri={imagePath}
          imageFullScreen={fullImage}
          setImageFullScreen={setIsFullImage}
        />
      )}
    </SafeAreaView>
  );
};

export default Forums;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    paddingBottom: height * 0.03,
  },
  messageContainer: {
    padding: 15,
    borderRadius: 10,
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  cancelReplyButton: {
    padding: 10,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    marginVertical: 10,
  },
  username: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  messageText: {
    fontSize: 16,
    color: 'black',
  },
  inputContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    bottom: 10,
    width: '100%',
  },

  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
    color: 'black',
    borderWidth: 1,
    borderColor: 'lightgrey',
  },

  sendButton: {
    marginLeft: 10,
    backgroundColor: otherTextColor,
    borderRadius: 35,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  replyImage: {
    width: 30,
    height: 30,
    borderRadius: 20,
    marginRight: 10,
  },
  repliesContainer: {
    paddingTop: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  replyContainer: {
    width: '100%',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 5,
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 10,
    flexDirection: 'row',
    borderRadius: 10,
  },
  replyBubble: {
    backgroundColor: '#E8F0FE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  replyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A73E8',
  },
  replyMessage: {
    fontSize: 12,
    color: '#555',
    marginTop: 3,
  },
  cancelReplyButton: {
    alignItems: 'flex-start',
  },
  quoteContainer: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: 'gray',
    marginVertical: 10,
    borderRadius: 8,
  },
  quoteText: {
    fontStyle: 'italic',
    color: '#333',
    fontSize: 14,
  },
  quoteOwner: {
    textAlign: 'right',
    color: '#555',
    fontSize: 12,
    fontStyle: 'italic',
  },
  parentMessage: {
    marginTop: 10,
    fontSize: 14,
    color: 'black',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 15,
  },
  scrollToBottomButton: {
    position: 'absolute',
    right: 10,
    bottom: '18%',
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 5,
    zIndex: 999,
    elevation: 5,
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 50,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listEmpty: {
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    top: '20%',
  },
  replyImageStyle: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 6,
  },
  mentionInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  galleryIcon: {
    paddingVertical: 6,
    paddingHorizontal: 5,
  },
  uploadImageContainer: {width: '28%', marginRight: '3%', marginBottom: 10},
  uploadImages: {aspectRatio: 1, borderRadius: 8},
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  cancelImageIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 2,
    zIndex: 1,
    width: 20,
  },
  cancelImageText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  suggestionsMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  suggestionAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {color: 'white', bottom: 2, fontWeight: 'bold'},
});
