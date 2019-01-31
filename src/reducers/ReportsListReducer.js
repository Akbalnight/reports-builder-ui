import * as types from 'Constants/ReportTypes';

const initialState = {
    list: null,
    isLoading: false,
    isError: false
};

const reportsList = (state = initialState, action) => {
    switch (action.type) {
        case types.SET_REPORTS_LIST_LOADING_STATE:
            return {
                ...state,
                isLoading: !!action.payload
            };
        case types.SET_REPORTS_LIST: {
            if (action.payload.data) {
                return {
                    ...state,
                    isLoading: false,
                    isError: false,
                    list: action.payload.data.map(row => ({
                        ...row,
                        key: row.id
                    }))
                }
            } else if (action.error) {
                return {
                    ...state,
                    isLoading: false,
                    isError: true,
                    list: []
                }
            }

            return state;
        }
        case types.REMOVE_REPORT:
            return {
                ...state,
                list: state.list.filter(item => item.key !== action.payload)
            };
        default:
            return state;
    }
};

export default reportsList;