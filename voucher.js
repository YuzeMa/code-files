import { queryVoucherListInStore } from '../services/voucher';

export default {
  namespace: 'voucher',

  state: {
    data: {
      list: [],
      single: {},
      pagination: {},
    },
    loading: false,
    submitting: false,
  },

  effects: {
    *fetchList({ payload }, { call, put }) {
      try {
        yield put({
          type: 'changeLoading',
          payload: true,
        });
        const response = yield call(queryVoucherListInStore, {
          ...payload,
          params: {
            pageIdx: 'pageIdx' in payload ? payload.pageIdx - 1 : 0,
            pageSize: 'pageSize' in payload ? payload.pageSize : 10,
          },
        });
        yield put({
          type: 'saveList',
          payload: response,
        });
      } catch (error) {
        // i tried
      } finally {
        yield put({
          type: 'changeLoading',
          payload: false,
        });
      }
    },
  },

  reducers: {
    saveList(state, action) {
      return {
        ...state,
        data: {
          ...state.data,
          list: action.payload.records,
          pagination: {
            current: action.payload.pageIdx + 1,
            total: action.payload.totalCount,
            pageSize: action.payload.pageSize,
          },
        },
      };
    },
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
  },
};
