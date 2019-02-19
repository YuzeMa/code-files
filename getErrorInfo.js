import React from 'react';
import { Icon, Popover } from 'antd';
import { FormattedMessage } from 'react-intl';
import { translations } from '../../locales/translations';
import { fieldLabels } from './fieldLabels';
import styles from '../../routes/Forms/style.less';

export const getErrorInfo = (form) => {
  const { getFieldsError } = form;
  const errors = getFieldsError();
  let errorCount = 0;

  // determine the key of value whether contain object, if argument is array return false
  const keyContainObject = (KeyList) => {
    if (KeyList.length) {
      return false;
    }
    let allCount = 0;
    let arrayCount = 0;
    for (const key in KeyList) {
      if (Object.prototype.hasOwnProperty.call(KeyList, key)) {
        if (typeof (KeyList[key]) === 'object') {
          allCount += 1;
        }
        if (KeyList[key] instanceof Array) {
          arrayCount += 1;
        }
      }
    }
    const objectCount = allCount - arrayCount;
    return objectCount > 0;
  };
  // count errors in current level of keyList
  const countErrors = (errorsList) => {
    for (const key in errorsList) {
      if (errorsList[key] instanceof Array) {
        errorCount += 1;
      }
    }
  };
  // count total errors in getFieldsError()
  const countTotalErrors = (KeyList) => {
    countErrors(KeyList);
    if (keyContainObject(KeyList)) {
      for (const key in KeyList) {
        // filter undefined
        if (Object.prototype.hasOwnProperty.call(KeyList, key)
              && KeyList[key]) {
          countTotalErrors(KeyList[key]);
        }
      }
    }
  };

  countTotalErrors(errors);

  if (!errors || errorCount === 0) {
    return null;
  }

  const errorList = (KeyList, endingKey) => {
    const html = Object.keys(KeyList).map((key) => {
      // filter out the value of key is undefined
      if (!KeyList[key]) {
        return null;
      // filter for array, the value of key is array which contain error message
      } else if (KeyList[key] instanceof Array) {
        let endKey = endingKey;
        endKey += '.';
        endKey += key;
        const keyArray = endKey.split('.');
        keyArray.shift();
        const fieldKey = keyArray[0];
        const scrollTo = keyArray.join('.');
        return (
          <li key={key} className={styles.errorListItem} onClick={() => scrollToField(scrollTo)}>
            <Icon type="cross-circle-o" className={styles.errorIcon} />
            <div className={styles.errorMessage}>{fieldLabels[fieldKey]}</div>
            <div className={styles.errorField}>{KeyList[key][0]}</div>
          </li>
        );
      // filter for object, loop through the function again if the value of key is object
      } else {
        let endKey = endingKey;
        endKey += '.';
        endKey += key;
        const result = errorList(KeyList[key], endKey);
        return result;
      }
    });
    return html;
  };


  // jump to error field
  const scrollToField = (fieldKey) => {
    const labelNode = document.querySelector(`label[for="${fieldKey}"]`);
    if (labelNode) {
      labelNode.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' });
    }
  };

  return (
    <span className={styles.errorIcon}>
      <Popover
        title={<FormattedMessage {...translations.profile.formErrorMessage} />}
        content={errorList(errors)}
        overlayClassName={styles.errorPopover}
        trigger="click"
        getPopupContainer={trigger => trigger.parentNode}
      >
        <Icon type="exclamation-circle" />
        {errorCount}
      </Popover>
    </span>
  );
};
