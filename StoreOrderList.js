import React, { PureComponent } from 'react';
import { connect } from 'dva';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Form, Select, Button, Modal, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import { injectIntl, FormattedMessage } from 'react-intl';
import { translations } from '../../locales/translations';
import StandardTable from '../../components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { centToDollar } from '../../utils/PriceConverter';
import { formatSubmitValue } from './utils';
import { renderSelectOptionsInObject } from '../../utils/componentUtils';
import { startOfToday, endOfToday } from '../../utils/TimeUtil';
import { typeOptions, statusOptions, paymentStatusOptions, deliveryProviderOptions } from './asset';

import styles from '../List/TableList.less';

const { RangePicker } = DatePicker;
const { confirm } = Modal;
const FormItem = Form.Item;

@connect(state => ({
  currentStore: state.store.currentStore,
  order: state.order,
}))
@Form.create()
@injectIntl
export default class StoreOrderList extends PureComponent {
  constructor(props) {
    super(props);
    const {
      location: {
        state,
      },
    } = props;
    let defaultState = {
      selectedRows: [],
      formValues: {},
      currentIdx: 1,
      currentPageSize: 10,
    };
    if (state) {
      const {
        pagination: {
          currentIdx,
          currentPageSize,
        },
      } = state;
      defaultState = {
        ...defaultState,
        currentIdx,
        currentPageSize,
      };
    }
    this.state = { ...defaultState };
  }

  componentDidMount() {
    const {
      dispatch,
      currentStore,
      location: {
        state,
      },
      form: {
        setFieldsValue,
      },
    } = this.props;
    if (state) {
      const {
        pagination: {
          currentIdx,
          currentPageSize,
        },
        formValues,
      } = state;
      setFieldsValue({
        ...formValues,
      });
      dispatch({
        type: 'order/fetchList',
        payload: {
          ...formatSubmitValue(formValues),
          storeId: currentStore.id,
          pageIdx: currentIdx,
          pageSize: currentPageSize,
        },
      });
    } else {
      dispatch({
        type: 'order/fetchList',
        payload: {
          storeId: currentStore.id,
        },
      });
    }
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch, currentStore } = this.props;
    const { formValues } = this.state;
    const { current, pageSize } = pagination;

    this.setState({
      currentIdx: current,
      currentPageSize: pageSize,
    });

    const values = {
      ...formatSubmitValue(formValues),
      storeId: currentStore.id,
      pageIdx: current,
      pageSize,
    };
    if (sorter.field) {
      values.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'order/fetchList',
      payload: values,
    });
  };

  showConfirm = (e, deleteHelp, confirmDelete) => {
    e.preventDefault();
    const { selectedRows } = this.state;
    if (!selectedRows) return;
    const { dispatch, currentStore } = this.props;
    confirm({
      // title: <FormattedMessage {...translation.confirmDelete} values={{ orderAmount }} />,
      title: confirmDelete,
      content: deleteHelp,
      okType: 'danger',
      onOk() {
        dispatch({
          type: 'order/delete',
          payload: {
            storeId: currentStore.id,
            params: {
              ids: _.map(selectedRows, 'uuid'),
            },
          },
        });
      },
      onCancel() { },
    });
    this.setState({
      selectedRows: [],
    });
  }

  handleFormReset = () => {
    const { form, dispatch, currentStore } = this.props;
    form.resetFields();
    dispatch({
      type: 'order/fetchList',
      payload: { storeId: currentStore.id },
    });
  };

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = (e) => {
    e.preventDefault();
    const { dispatch, form, currentStore } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      this.setState({
        formValues: fieldsValue,
      });

      dispatch({
        type: 'order/fetchList',
        payload: {
          storeId: currentStore.id,
          ...formatSubmitValue(fieldsValue),
        },
      });
    });
  };
  renderForm() {
    const {
      form: {
        getFieldDecorator,
      },
      intl: {
        formatMessage,
      },
    } = this.props;
    const { selectedRows } = this.state;
    const orderAmount = selectedRows.length;
    const deleteHelp = formatMessage({ ...translations.order.deleteHelp });
    const confirmDelete = formatMessage({ ...translations.order.confirmDelete }, { orderAmount });
    const dateRange = formatMessage({ ...translations.global.dateRange });
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label={<FormattedMessage {...translations.order.orderType} />}>
              {getFieldDecorator('type')(
                <Select placeholder={<FormattedMessage {...translations.global.select} />} style={{ width: '100%' }} allowClear>
                  {renderSelectOptionsInObject(typeOptions)}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label={<FormattedMessage {...translations.order.orderStatus} />}>
              {getFieldDecorator('status')(
                <Select placeholder={<FormattedMessage {...translations.global.select} />} style={{ width: '100%' }} allowClear>
                  {renderSelectOptionsInObject(statusOptions)}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label={<FormattedMessage {...translations.order.deliveryCompanies} />}>
              {getFieldDecorator('deliveryProvider')(
                <Select placeholder={<FormattedMessage {...translations.global.select} />} style={{ width: '100%' }} allowClear>
                  {renderSelectOptionsInObject(deliveryProviderOptions)}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label={<FormattedMessage {...translations.order.paymentStatus} />}>
              {getFieldDecorator('paymentStatus')(
                <Select placeholder={<FormattedMessage {...translations.global.select} />} style={{ width: '100%' }} allowClear>
                  {renderSelectOptionsInObject(paymentStatusOptions)}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label={<FormattedMessage {...translations.order.amountFrom} />}>
              {getFieldDecorator('finalPriceFrom')(
                <InputNumber placeholder="$ " />
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label={<FormattedMessage {...translations.order.amountTo} />}>
              {getFieldDecorator('finalPriceTo')(
                <InputNumber placeholder="$ " />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label={<FormattedMessage {...translations.order.orderTime} />}>
              {getFieldDecorator('createdAt')(
                <RangePicker
                  showTime={{
                    defaultValue: [startOfToday, endOfToday],
                  }}
                  format="YYYY-MM-DD HH:mm"
                  placeholder={[dateRange, dateRange]}
                  style={{ width: '100%' }}
                />,
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons} style={{ marginBottom: 24 }}>
              <Button type="primary" htmlType="submit">{<FormattedMessage {...translations.global.button.inquiry} />}</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                {<FormattedMessage {...translations.global.button.reset} />}
              </Button>
              {
                selectedRows.length > 0 && (
                  <span style={{ marginLeft: 8 }}>
                    <Button onClick={e => this.showConfirm(e, deleteHelp, confirmDelete)}>
                      {<FormattedMessage {...translations.global.delete} />}
                    </Button>
                  </span>
                )
              }
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      order: {
        loading: orderLoading,
        data,
      },
      currentStore,
    } = this.props;
    const { statistics } = data;
    const {
      selectedRows,
      currentIdx,
      currentPageSize,
      formValues,
    } = this.state;
    const selectedItemAmount = _.sumBy(selectedRows, item => item.amount);
    const columns = [
      {
        title: <FormattedMessage {...translations.order.orderNumber} />,
        dataIndex: 'orderNumber',
      },
      {
        title: <FormattedMessage {...translations.order.orderType} />,
        dataIndex: 'type',
        render: val => typeOptions[val],
      },
      {
        title: <FormattedMessage {...translations.order.amount} />,
        dataIndex: 'subtotal',
        render: (val, record) => `${record.transactions.currency === 'CNY' ? '¥' : '$'}${centToDollar(val)}`,
      },
      {
        title: <FormattedMessage {...translations.order.paymentStatus} />,
        dataIndex: 'paymentStatus',
        render: val => paymentStatusOptions[val],
      },
      {
        title: <FormattedMessage {...translations.order.orderTime} />,
        dataIndex: 'createdAt',
        sorter: true,
        render: val => <span>{moment(val).format('L HH:mm')}</span>
        ,
      },
      {
        title: <FormattedMessage {...translations.global.action} />,
        dataIndex: 'uuid',
        render: val => (
          <p>
            <Link
              to={{
                pathname: `/store/${currentStore.id}/order/${val}`,
                state: {
                  fromPathname: `/store/${currentStore.id}/order/`,
                  pagination: {
                    currentIdx,
                    currentPageSize,
                  },
                  formValues,
                },
              }}
            >
              <FormattedMessage {...translations.global.view} />
            </Link>
          </p>
        ),
      },
    ];

    return (
      <PageHeaderLayout title={<FormattedMessage {...translations.order.orderReview} />}>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <StandardTable
              totalFinalPrice={centToDollar(statistics && statistics.totalFinalPrice)}
              totalSelectedAmount={centToDollar(selectedItemAmount)}
              rowKey="uuid"
              selectedRows={selectedRows}
              loading={orderLoading}
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
