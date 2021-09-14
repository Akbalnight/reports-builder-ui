import * as types from 'Constants/ReportTypes'

// Общее
export const requestSubsystems = () => ({
    type: types.SUBSYSTEMS_FETCH_REQUESTED
});

export const setSubsystems = (subsystems) => ({
    type: types.SET_SUBSYSTEMS,
    payload: subsystems
});

export const setSubsystemsLoading = (state) => ({
    type: types.SET_SUBSYSTEMS_LOADING_STATE,
    payload: state
});

// Реестр отчётов
export const setReportsListLoadingState = (state) => ({
    type: types.SET_REPORTS_LIST_LOADING_STATE,
    payload: state
});
export const requestReportsList = () => ({
    type: types.REPORTS_LIST_FETCH_REQUESTED
});
export const setReportsList = (reportsList) => ({
    type: types.SET_REPORTS_LIST,
    payload: {data: reportsList}
});
export const setReportsError = () => ({
    type: types.SET_REPORTS_LIST,
    payload: {error: 'unknown'}
});

export const requestReportRemove = (key) => (dispatch) =>{
    dispatch({ type: types.REMOVE_REPORT, payload: key });
    dispatch({ type: types.REMOVE_REPORT_REQUESTED, payload: key });
};

export const requestReportUpdate = (report) => ({ type: types.STORE_REPORT_REQUESTED, payload: report });

// Редактор
export const initializeEditor = (reportId) => ({
    type: types.INITIALIZE_EDITOR,
    payload: {reportId}
});

export const requestLoad = (reportId) => ({
    type: types.LOAD_REQUESTED,
    payload: {reportId}
});

export const requestSave = (reportId) => ({
    type: types.SAVE_REQUESTED,
    payload: {reportId}
});

export const load = (reportId, reportData) => ({
    type: types.LOAD,
    payload: {reportId, reportData}
})

export const clearEditor = (reportId) => ({
    type: types.CLEAR_EDITOR,
    payload: {reportId}
})

export const requestAddFields = (reportId, fieldsData) => ({
    type: types.ADD_FIELDS_REQUESTED,
    payload: {reportId, fieldsData}
});

export const applyNewState = (reportId, editorState) => ({
    type: types.APPLY_NEW_STATE,
    payload: {reportId, editorState}
});

export const requestRemoveField = (reportId, key) => ({
    type: types.REMOVE_FIELD_REQUESTED,
    payload: {reportId, key}
});

export const requestChangeField = (reportId, row) => ({
    type: types.CHANGE_FIELD_REQUESTED,
    payload: {reportId, row}
});

export const requestReorderFields = (reportId, keys) => ({
    type: types.REORDER_FIELDS_REQUESTED,
    payload: {reportId, keys}
});

export const requestAddSetting = (reportId, row) => ({
    type: types.ADD_SETTING_REQUESTED,
    payload: {reportId, row}
});

export const changeSettingsTab = (reportId, settingsTab) => ({
    type: types.CHANGE_SETTINGS_TAB,
    payload: {reportId, settingsTab}
});


export const requestChangeFilter = (reportId, row) => ({
    type: types.CHANGE_FILTER_REQUESTED,
    payload: {reportId, row}
});

export const requestRemoveFilter = (reportId, key) => ({
    type: types.REMOVE_FILTER_REQUESTED,
    payload: {reportId, key}
});

export const requestChangeSort = (reportId, row) => ({
    type: types.CHANGE_SORT_REQUESTED,
    payload: {reportId, row}
});

export const requestRemoveSort = (reportId, key) => ({
    type: types.REMOVE_SORT_REQUESTED,
    payload: {reportId, key}
});

export const requestReorderSort = (reportId, keys) => ({
    type: types.REORDER_SORT_REQUESTED,
    payload: {reportId, keys}
});

export const requestRemoveGroup = (reportId, key) => ({
    type: types.REMOVE_GROUP_REQUESTED,
    payload: {reportId, key}
});

export const requestReorderGroup = (reportId, keys) => ({
    type: types.REORDER_GROUP_REQUESTED,
    payload: {reportId, keys}
});

export const requestChangeTotal = (reportId, row) => ({
    type: types.CHANGE_TOTAL_REQUESTED,
    payload: {reportId, row}
});

export const requestRemoveTotal = (reportId, key) => ({
    type: types.REMOVE_TOTAL_REQUESTED,
    payload: {reportId, key}
});

export const setChartData = (reportId, chartData) => ({
    type: types.SET_CHART_DATA,
    payload: {reportId, chartData}
});

export const setReportType = (reportId, reportType) => ({
    type: types.SET_REPORT_TYPE,
    payload: {
        reportId,
        reportType
    }
});

export const setReportName = (reportId, reportName) => ({
    type: types.APPLY_NEW_STATE,
    payload: {
        reportId,
        editorState: {
            reportName,
            isChanged: true
        }
    }
});

export const setIsPublic = (reportId, isPublic) => ({
    type: types.APPLY_NEW_STATE,
    payload: {
        reportId,
        editorState: {
            isPublic,
            isChanged: true
        }
    }
});

export const setLimit50 = (reportId, limit50) => ({
    type: types.APPLY_NEW_STATE,
    payload: {
        reportId,
        editorState: {
            limit50,
            isChanged: true
        }
    }
});

export const setIsFavorite = (reportId, isFavorite) => ({
    type: types.APPLY_NEW_STATE,
    payload: {
        reportId,
        editorState: {
            isFavorite,
            isChanged: true
        }
    }
});

export const setValue = (reportId, paramName, value) => ({
    type: types.APPLY_NEW_STATE,
    payload: {
        reportId,
        editorState: {
            [paramName]: value,
            isChanged: true
        }
    }
});

export const setAxisName = (reportId, chartName, value) => ({
    type: types.APPLY_CHART_NAME,
    payload: {
        reportId,
        chartNames: {
            [chartName]: value
        }
    }
});

export const requestSetAxisDataKey = (reportId, key) => ({
    type: types.SET_DATA_AXIS_KEY_REQUESTED,
    payload: { reportId, key }
});

export const requestAddValueAxis = (reportId) => ({
    type: types.ADD_VALUE_AXIS_REQUESTED,
    payload: { reportId }
});
export const requestRemoveValueAxis = (reportId, index) => ({
    type: types.REMOVE_VALUE_AXIS_REQUESTED,
    payload: { reportId, index }
});
export const requestChangeValueAxis = (reportId, index, data) => ({
    type: types.CHANGE_VALUE_AXIS_REQUESTED,
    payload: { reportId, index, data }
});
