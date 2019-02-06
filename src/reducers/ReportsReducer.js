import * as types from 'Constants/ReportTypes';

const initialState = {
    subsystems: null,
    editors: {}
};

const createNewEditorData = () => ({
    keyCounter: 0,
    isReportInitialized: false,
    
    isChanged: false,

    // General
    tableName: null,
    reportType: '',
    reportName: '',
    isPublic: false,
    isFavorite: false,

    // Views
    viewsSelected: [],
    viewsAllowedParents: [],

    // Fields
    fieldsData: [],

    // Settings
    settingsTab: 'filter',
    filterData: [],
    sortData: [],
    groupData: [],
    totalData: [],

    // Chart
    chartData: [],
    chartNames: {
        title: '',
        dataAxis: '',
        valueAxis: ''
    },

    valueAxis: [],
    dataAxis: {
        dataKey: '',
        dataType: '',
        dataTitle: ''
    },
    isLegendVisible: false,
    isCalculatedXRange: false,
    isCalculatedYRange: false,
    isShowedDotValues: false
});

const reports = (state = initialState, action) => {
    switch (action.type) {
        case types.SET_SUBSYSTEMS:
            return {
                ...state,
                subsystems: action.payload
            }
        case types.SET_SUBSYSTEMS_LOADING_STATE:
            return {
                ...state,
                isSubsystemsLoading: !!action.payload
            }
        case types.INITIALIZE_EDITOR:
            return {
                ...state,
                editors: {
                    ...state.editors,
                    [action.payload.reportId]: {
                        ...createNewEditorData(),
                        isReportInitialized: true
                    }
                }
            };
        case types.LOAD:
            return {
                ...state,
                editors: {
                    ...state.editors,
                    [action.payload.reportId]: {
                        ...createNewEditorData(),
                        ...action.payload.reportData
                    }
                }
            };
        case types.CLEAR_EDITOR:
            return {
                ...state,
                editors: Object
                    .entries(state.editors)
                    .filter(([i]) => i != action.payload.reportId)
                    .map(([i, e]) => ({[i]: e}))
                    .reduce((a, c) => ({...a, ...c}), {})
            };
        case types.APPLY_NEW_STATE: {
            const newEditorState = action.payload.editorState;

            if (!newEditorState)
                return state;

            return {
                ...state,
                editors: {
                    ...state.editors,
                    [action.payload.reportId]: {
                        ...state.editors[action.payload.reportId],
                        ...newEditorState
                    }
                }
            }
        }
        case types.APPLY_CHART_NAME: {
            const newChartNames = action.payload.chartNames;

            if (!newChartNames)
                return state;

            return {
                ...state,
                editors: {
                    ...state.editors,
                    [action.payload.reportId]: {
                        ...state.editors[action.payload.reportId],
                        chartNames: {
                            ...state.editors[action.payload.reportId].chartNames,
                            ...newChartNames
                        }
                    }
                }
            }
        }
        case types.CHANGE_SETTINGS_TAB:
            return {
                ...state,
                editors: {
                    ...state.editors,
                    [action.payload.reportId]: {
                        ...state.editors[action.payload.reportId],
                        settingsTab: action.payload.settingsTab
                    }
                }
            }
        case types.SET_CHART_DATA:
            return {
                ...state,
                editors: {
                    ...state.editors,
                    [action.payload.reportId]: {
                        ...state.editors[action.payload.reportId],
                        chartData: action.payload.chartData
                    }
                }
            }
        default:
            return state;
    }
};

export default reports;