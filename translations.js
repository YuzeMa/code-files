import { defineMessages } from 'react-intl';
import _ from 'lodash';
import flatten from 'flat';
import getEnglishTranslation from './enUS';

const englishTranslation = getEnglishTranslation('linkPos');

function addKeyToFlattenObject(flattenObject, newKey) {
  return _.mapKeys(flattenObject, (value, key) => {
    return `${key}.${newKey}`;
  });
}

function mapTranslationToDefineMessages(translation) {
  const valueEqualToKey = _.mapValues(translation, (value, key) => { return key; });
  return flatten.unflatten({
    ...addKeyToFlattenObject(translation, 'defaultMessage'),
    ...addKeyToFlattenObject(valueEqualToKey, 'id'),
  });
}

const defineMessagesObj = mapTranslationToDefineMessages(englishTranslation);

export const translations = defineMessages(defineMessagesObj);
