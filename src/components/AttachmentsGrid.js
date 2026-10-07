import React, {useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';

const MAX_PREVIEW_IMAGES = 2;

const AttachmentsGrid = ({attachments = [], onPressImage}) => {
  const [expanded, setExpanded] = useState(false);

  if (!attachments || attachments.length === 0) return null;

  const visibleAttachments = expanded
    ? attachments
    : attachments.slice(0, MAX_PREVIEW_IMAGES);
  const remainingCount = attachments.length - MAX_PREVIEW_IMAGES;

  return (
    <View style={styles.container}>
      {visibleAttachments.map((attachment, index) => {
        const isLastWithMore =
          !expanded && index === MAX_PREVIEW_IMAGES - 1 && remainingCount > 0;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => {
              if (isLastWithMore) {
                setExpanded(true);
              } else {
                onPressImage?.(attachment.photo_url_main, index);
              }
            }}>
            <View style={styles.imageWrapper}>
              <FastImage
                source={{uri: attachment.photo_url_main}}
                style={styles.image}
                resizeMode={FastImage.resizeMode.cover}
              />
              {isLastWithMore && (
                <View style={styles.overlay}>
                  <Text style={styles.overlayText}>+{remainingCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 5,
    marginBottom: 5,
  },
  image: {
    width: 130,
    height: 130,
    borderRadius: 8,
    // backgroundColor: 'lightgrey',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default React.memo(AttachmentsGrid);
