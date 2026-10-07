import {Platform, StatusBar, Dimensions} from 'react-native';
import {theme} from 'galio-framework';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {client_id, client_secret} from './configs';
import semver from 'semver';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

export const StatusHeight = StatusBar.currentHeight;
export const HeaderHeight = theme.SIZES.BASE * 4 + StatusHeight;
export const iPhoneX = () =>
  Platform.OS === 'ios' && (height === 812 || width === 812);

// True when `latest` is a newer version than `current`. Missing or malformed
// versions (e.g. before the settings request returns) count as up to date.
export const isOlderVersion = (current, latest) => {
  const a = semver.coerce(current);
  const b = semver.coerce(latest);
  return Boolean(a && b) && semver.lt(a, b);
};

export const renderMessageTextWithMentions = (text, mentions) => {
  // console.log(text, mentions, 'data');
  const sortedMentions = [...mentions].sort(
    (a, b) => b.text.length - a.text.length,
  );
  sortedMentions.forEach(mention => {
    const escapedText = mention.text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const mentionRegex = new RegExp(`\\b${escapedText}\\b`, 'g');
    text = text.replace(mentionRegex, `@[${mention.text}](${mention.id})`);
  });
  const mentionPattern = /@\[(.*?)\]\((\d+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = mentionPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const mentionText = match[1];
    const mentionId = match[2];
    const mentionObj = mentions.find(m => String(m.id) === mentionId);
    if (mentionObj) {
      parts.push({
        isMention: true,
        text: `@${mentionObj.text}`,
        id: mentionObj.id,
        type: mentionObj.type,
      });
    } else {
      parts.push(`@${mentionText}`);
    }
    lastIndex = mentionPattern.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts;
};

