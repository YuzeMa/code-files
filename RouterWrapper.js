import React from 'react';
import { Router, Route, Switch, Redirect } from 'dva/router';
import { connect } from 'dva';
import { LocaleProvider } from 'antd';
import { IntlProvider, addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import zh from 'react-intl/locale-data/zh';
import antEnUS from 'antd/lib/locale-provider/en_US';
import antZhCN from 'antd/lib/locale-provider/zh_CN';
import BasicLayout from './layouts/BasicLayout';
import UserLayout from './layouts/UserLayout';
import StoreLayout from './layouts/StoreLayout';
import AuthorizedRoute from './routes/AuthorizedRoute';

import UnAuthorizedErrorPage from './routes/Exception/403';

import getChineseTranslation from './locales/zhCN';
import getEnglishTranslation from './locales/enUS';

addLocaleData([...en, ...zh]);

const Locale = {
  zhCN: 'zh-CN',
};

@connect(state => ({
  language: state.global.language,
  company: state.global.company,
}))
class RouterWrapper extends React.PureComponent {
  render() {
    const { history, language, company } = this.props;
    let translation;
    if (language === Locale.zhCN) {
      translation = getChineseTranslation(company);
    } else {
      translation = getEnglishTranslation(company);
    }
    return (
      <LocaleProvider locale={language === Locale.zhCN ? antZhCN : antEnUS}>
        <IntlProvider
          locale={language === Locale.zhCN ? 'zh' : 'en'}
          messages={translation}
        >
          <Router history={history}>
            <Switch>
              <Route path="/user" component={UserLayout} />
              <AuthorizedRoute path="/admin" component={BasicLayout} />
              <AuthorizedRoute
                path="/store/:storeId"
                component={StoreLayout}
              />
              <Route path="/403" component={UnAuthorizedErrorPage} />
              <Redirect exact from="/" to="/user/login" />
            </Switch>
          </Router>
        </IntlProvider>
      </LocaleProvider>
    );
  }
}

export default RouterWrapper;
