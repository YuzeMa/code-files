import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Link, Route } from 'dva/router';
import DocumentTitle from 'react-document-title';
import { Icon, Radio } from 'antd';
import { injectIntl, FormattedMessage } from 'react-intl';
import GlobalFooter from '../components/GlobalFooter';
import styles from './UserLayout.less';
import { userNavData } from '../common/adminNav';
import { getRouteData } from '../utils/utils';
import { translations } from '../locales/translations';


@connect(state => ({
  company: state.global.company,
  language: state.global.language,
}))
@injectIntl
export default class UserLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
  }
  getChildContext() {
    const {
      location,
    } = this.props;
    return { location };
  }
  getPageTitle() {
    const {
      intl: {
        formatMessage,
      },
      location,
    } = this.props;
    const { pathname } = location;
    const name = formatMessage({ ...translations.company.name });
    let title = name;
    getRouteData(userNavData, 'UserLayout').forEach((item) => {
      if (item.path === pathname) {
        const subPathStartIndex = pathname.lastIndexOf('/') + 1;
        const subPath = pathname.substring(subPathStartIndex);
        const subTitle = formatMessage({ ...translations.user[subPath] });
        title = `${subTitle} - ${name}`;
      }
    });
    return title;
  }
  changeLang = (e) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/setLanguage',
      payload: e.target.value,
    });
  }
  render() {
    const {
      intl: {
        formatMessage,
      },
      language,
    } = this.props;
    const copyright = <div>{<FormattedMessage {...translations.global.copyRight} />} <Icon type="copyright" /> {new Date().getFullYear()} {<FormattedMessage {...translations.company.name} />}</div>;
    const name = formatMessage(translations.company.name);
    const slogan = formatMessage(translations.company.slogan);
    const logo = formatMessage(translations.company.logo);

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <div className={styles.container}>
          <div className={styles.top}>
            <div className={styles.header}>
              <Link to="/">
                <img alt="logo" src={logo} className={styles.logo} />
                <span className={styles.title}>{name}</span>
              </Link>
            </div>
            <p className={styles.desc}>{slogan}</p>
            <div className={styles.langSelector}>
              <Radio.Group value={language} onChange={this.changeLang}>
                <Radio.Button value="zh-CN">中 文</Radio.Button>
                <Radio.Button value="en-US">English</Radio.Button>
              </Radio.Group>
            </div>
          </div>
          {
            getRouteData(userNavData, 'UserLayout').map(item =>
              (
                <Route
                  exact={item.exact}
                  key={item.path}
                  path={item.path}
                  component={item.component}
                />
              )
            )
          }
          <GlobalFooter className={styles.footer} copyright={copyright} />
        </div>
      </DocumentTitle>
    );
  }
}
