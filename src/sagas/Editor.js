import { fork, call, select, put, takeEvery } from 'redux-saga/effects';

import * as types from 'Constants/ReportTypes'
import { 
    applyNewState 
} from 'Actions/ReportActions';

import { 
    fieldsDataSelector, 
    tableNameSelector,
    keyCounterSelector,
    settingsTabSelector,
    filterDataSelector,
    sortDataSelector,
    groupDataSelector,
    totalDataSelector,
    dataAxisSelector,
    valueAxisSelector,
    reportTypeSelector
} from 'Selectors/ReportsBuilder';

import { 
    getSelectedViews,
    getViewsAllowedParents,
    getNextDefaultColor,
    buildFullColumnName,
    chartsWithOneAxis
} from 'Pages/ReportsBuilder/Services/Editor';

const getEditorState = (reportId) => (store) => store.reports.editors[reportId];

const prepareFieldsData = (editorState, subsystems, fieldsData) => {
    if (editorState.viewsSelected.includes(fieldsData.key))
        return null;

    let keyCounter = editorState.keyCounter;

    let toAdd;
    let tableName;
    if (fieldsData.children) {
        toAdd = fieldsData.children.filter(child => !editorState.viewsSelected.includes(child.key));
        tableName = fieldsData.name;
    } else {
        toAdd = [fieldsData];
        tableName = fieldsData.parent.name;
    }

    const newFieldsData = [
        ...editorState.fieldsData,
        ...toAdd.map(child => ({
            id: buildFullColumnName(child.parent.name, child.column),
            table: child.parent.name,
            parent: child.parent,
            key: keyCounter++,
            fieldKey: child.key,
            type: child.type,
            column: child.column,
            title: child.title,
            canWhere: child.canWhere,
            canOrder: child.canOrder,
            canGroup: child.canGroup,
            canAggregate: child.canAggregate
        }))
    ];

    return {
        ...editorState,
        keyCounter,
        tableName,
        isChanged: true,
        fieldsData: newFieldsData,
        viewsAllowedParents: getViewsAllowedParents(subsystems, newFieldsData),
        viewsSelected: getSelectedViews(newFieldsData),
    }
}

const prepareRemoveField = (data) => {
    const newFieldsData = data.fieldsData.filter(row => row.key !== data.key);
    let newState = {
        tableName: newFieldsData.length ? data.tableName : undefined,
        fieldsData: newFieldsData,
        viewsAllowedParents: getViewsAllowedParents(data.subsystems, newFieldsData),
        viewsSelected: getSelectedViews(newFieldsData)
    };

    const toRemove = data.fieldsData.find(row => row.key === data.key);
    if (toRemove) {
        newState = {
            ...newState,
            filterData: data.filterData.filter(row => row.id !== toRemove.id),
            sortData: data.sortData.filter(row => row.id !== toRemove.id),
            groupData: data.groupData.filter(row => row.id !== toRemove.id),
            totalData: data.totalData.filter(row => row.id !== toRemove.id),
            isChanged: true
        }
    }

    return newState;
}

const prepareChangeField = (data) => {
    let newState = {
        fieldsData: data.fieldsData.map(item => item.key === data.row.key ? data.row : item)
    };

    const toUpdate = data.fieldsData.find(item => item.key === data.row.key);
    if (toUpdate) {
        const updateTitle = (row, id, title) => {
            if (row.id !== id)
                return row;

            return { ...row, title };
        }

        newState = {
            ...newState,
            filterData: data.filterData.map(item => updateTitle(item, toUpdate.id, data.row.title)),
            sortData: data.sortData.map(item => updateTitle(item, toUpdate.id, data.row.title)),
            groupData: data.groupData.map(item => updateTitle(item, toUpdate.id, data.row.title)),
            totalData: data.totalData.map(item => updateTitle(item, toUpdate.id, data.row.title)),
            isChanged: true
        }
    }

    return newState;
}

const prepareAddSetting = (data) => {
    let newItem;
    switch (data.settingsTab) {
        case 'filter': {
            newItem = {
                'id': data.row.id,
                'key': data.keyCounter,
                'column': data.row.column,
                'type': data.row.type,
                'title': data.row.title,
                'table': data.row.table
            };
            return {
                filterData: [...data.filterData, newItem],
                keyCounter: data.keyCounter + 1,
                isChanged: true
            };
        }
        case 'sort': {
            if (!data.sortData.find(item => item.id === data.row.id)) {
                newItem = {
                    'id': data.row.id,
                    'key': data.keyCounter,
                    'column': data.row.column,
                    'title': data.row.title,
                    'table': data.row.table
                };
                return {
                    sortData: [...data.sortData, newItem],
                    keyCounter: data.keyCounter + 1,
                    isChanged: true
                };
            }
            return {};
        }
        case 'group': {
            if (!data.groupData.find(item => item.id === data.row.id)) {
                newItem = {
                    'id': data.row.id,
                    'key': data.keyCounter,
                    'column': data.row.column,
                    'title': data.row.title,
                    'table': data.row.table
                };
                return {
                    groupData: [...data.groupData, newItem],
                    keyCounter: data.keyCounter + 1,
                    isChanged: true
                };
            }
            return {};
        }
        case 'total': {
            if (!data.totalData.find(item => item.id === data.row.id)) {
                newItem = {
                    'id': data.row.id,
                    'key': data.keyCounter,
                    'column': data.row.column,
                    'title': data.row.title,
                    'table': data.row.table
                };
                return {
                    totalData: [...data.totalData, newItem],
                    keyCounter: data.keyCounter + 1,
                    isChanged: true
                };
            }
            return {};
        }
        default:
            return {};
    }
}

const prepareReorderFields = (data) => {
    const newFieldsData = [...data.fieldsData];
    newFieldsData.sort((a, b) =>
        data.keys.indexOf(a.key) - data.keys.indexOf(b.key)
    );

    return {
        fieldsData: newFieldsData,
        isChanged: true
    };
}

const prepareDataAxisKey= (data) => {
    const axisInfo = data.fieldsData.find(item => item.title === data.key);
    return {
        dataAxis: {
            ...data.dataAxis,
            dataKey: data.key,
            dataType: axisInfo.type,
            dataTitle: axisInfo.title
        },
        isChanged: true
    };
}

function* addFieldsHandler(action) {
    const { reportId, fieldsData } = action.payload;
    const subsystems = yield select(state => state.reports.subsystems);
    const editorState = yield select(getEditorState(reportId));
    const newEditorState = prepareFieldsData(editorState, subsystems, fieldsData);

    yield put(applyNewState(reportId, newEditorState));
}

function* addFieldsSaga() {
    yield takeEvery(types.ADD_FIELDS_REQUESTED, addFieldsHandler);
}

function* removeFieldHandler(action) {
    const { reportId, key } = action.payload;
    const newEditorState = prepareRemoveField({
        subsystems: yield select(state => state.reports.subsystems),
        fieldsData: yield select(fieldsDataSelector(reportId)),
        tableName: yield select(tableNameSelector(reportId)),
        filterData: yield select(filterDataSelector(reportId)),
        sortData: yield select(sortDataSelector(reportId)),
        groupData: yield select(groupDataSelector(reportId)),
        totalData: yield select(totalDataSelector(reportId)),
        key
    });
    yield put(applyNewState(reportId, newEditorState));
}

function* removeFieldSaga() {
    yield takeEvery(types.REMOVE_FIELD_REQUESTED, removeFieldHandler);
}

function* changeFieldHandler(action) {
    const { reportId, row } = action.payload;
    const newEditorState = prepareChangeField({
        fieldsData: yield select(fieldsDataSelector(reportId)),
        filterData: yield select(filterDataSelector(reportId)),
        sortData: yield select(sortDataSelector(reportId)),
        groupData: yield select(groupDataSelector(reportId)),
        totalData: yield select(totalDataSelector(reportId)),
        row
    });
    yield put(applyNewState(reportId, newEditorState));
}

function* changeFieldSaga() {
    yield takeEvery(types.CHANGE_FIELD_REQUESTED, changeFieldHandler);
}

function* reorderFieldsHandler(action) {
    const { reportId, keys } = action.payload;
    const newEditorState = prepareReorderFields({
        fieldsData: yield select(fieldsDataSelector(reportId)),
        keys
    });
    yield put(applyNewState(reportId, newEditorState));
}

function* reorderFieldsSaga() {
    yield takeEvery(types.REORDER_FIELDS_REQUESTED, reorderFieldsHandler);
}

function* addSettingHandler(action) {
    const { reportId, row } = action.payload;
    const newEditorState = prepareAddSetting({
        keyCounter: yield select(keyCounterSelector(reportId)),
        settingsTab: yield select(settingsTabSelector(reportId)),
        filterData: yield select(filterDataSelector(reportId)),
        sortData: yield select(sortDataSelector(reportId)),
        groupData: yield select(groupDataSelector(reportId)),
        totalData: yield select(totalDataSelector(reportId)),
        row
    });
    yield put(applyNewState(reportId, newEditorState));
}

function* addSettingSaga() {
    yield takeEvery(types.ADD_SETTING_REQUESTED, addSettingHandler);
}

function* filterChangeHandler(action) {
    const { reportId, row } = action.payload;
    const filterData = yield select(filterDataSelector(reportId));
    const newEditorState = {
        filterData: filterData.map(item => item.key === row.key ? row : item),
        isChanged: true
    };
    yield put(applyNewState(reportId, newEditorState));
}

function* filterChangeSaga() {
    yield takeEvery(types.CHANGE_FILTER_REQUESTED, filterChangeHandler);
}

function* filterRemoveHandler(action) {
    const { reportId, key } = action.payload;
    const filterData = yield select(filterDataSelector(reportId));
    const newEditorState = {
        filterData: filterData.filter(item => item.key !== key),
        isChanged: true
    };
    yield put(applyNewState(reportId, newEditorState));
}

function* filterRemoveSaga() {
    yield takeEvery(types.REMOVE_FILTER_REQUESTED, filterRemoveHandler);
}

function* sortChangeHandler(action) {
    const { reportId, row } = action.payload;
    const sortData = yield select(sortDataSelector(reportId));
    const newEditorState = {
        sortData: sortData.map(item => item.key === row.key ? row : item),
        isChanged: true
    };
    yield put(applyNewState(reportId, newEditorState));
}

function* sortChangeSaga() {
    yield takeEvery(types.CHANGE_SORT_REQUESTED, sortChangeHandler);
}

function* sortRemoveHandler(action) {
    const { reportId, key } = action.payload;
    const sortData = yield select(sortDataSelector(reportId));
    const newEditorState = {
        sortData: sortData.filter(item => item.key !== key),
        isChanged: true
    };
    yield put(applyNewState(reportId, newEditorState));
}

function* sortRemoveSaga() {
    yield takeEvery(types.REMOVE_SORT_REQUESTED, sortRemoveHandler);
}

function* sortReorderHandler(action) {
    const { reportId, keys } = action.payload;
    const sortData = yield select(sortDataSelector(reportId));

    const newSortData = [...sortData];
    newSortData.sort((a, b) =>
        keys.indexOf(a.key) - keys.indexOf(b.key)
    );

    const newEditorState = {
        sortData: newSortData,
        isChanged: true
    };
    yield put(applyNewState(reportId, newEditorState));
}

function* sortReorderSaga() {
    yield takeEvery(types.REORDER_SORT_REQUESTED, sortReorderHandler);
}

function* groupRemoveHandler(action) {
    const { reportId, key } = action.payload;
    const groupData = yield select(groupDataSelector(reportId));
    const newEditorState = {
        groupData: groupData.filter(item => item.key !== key),
        isChanged: true
    };
    yield put(applyNewState(reportId, newEditorState));
}

function* groupRemoveSaga() {
    yield takeEvery(types.REMOVE_GROUP_REQUESTED, groupRemoveHandler);
}

function* groupReorderHandler(action) {
    const { reportId, keys } = action.payload;
    const groupData = yield select(groupDataSelector(reportId));

    const newGroupData = [...groupData];
    newGroupData.sort((a, b) =>
        keys.indexOf(a.key) - keys.indexOf(b.key)
    );

    const newEditorState = {
        groupData: newGroupData,
        isChanged: true
    };
    yield put(applyNewState(reportId, newEditorState));
}

function* groupReorderSaga() {
    yield takeEvery(types.REORDER_GROUP_REQUESTED, groupReorderHandler);
}

function* totalChangeHandler(action) {
    const { reportId, row } = action.payload;
    const totalData = yield select(totalDataSelector(reportId));
    const newEditorState = {
        totalData: totalData.map(item => item.key === row.key ? row : item),
        isChanged: true
    };
    yield put(applyNewState(reportId, newEditorState));
}

function* totalChangeSaga() {
    yield takeEvery(types.CHANGE_TOTAL_REQUESTED, totalChangeHandler);
}

function* totalRemoveHandler(action) {
    const { reportId, key } = action.payload;
    const totalData = yield select(totalDataSelector(reportId));
    const newEditorState = {
        totalData: totalData.filter(item => item.key !== key),
        isChanged: true
    };
    yield put(applyNewState(reportId, newEditorState));
}

function* totalRemoveSaga() {
    yield takeEvery(types.REMOVE_TOTAL_REQUESTED, totalRemoveHandler);
}

function* setDataAxisKeyHandler(action) {
    const { reportId, key } = action.payload;
    const newEditorState = prepareDataAxisKey({
        fieldsData: yield select(fieldsDataSelector(reportId)),
        dataAxis: yield select(dataAxisSelector(reportId)),
        key
    });
    yield put(applyNewState(reportId, newEditorState));
}

function* setDataAxisKeySaga() {
    yield takeEvery(types.SET_DATA_AXIS_KEY_REQUESTED, setDataAxisKeyHandler);
}

function* addValueAxisHandler(action) {
    const { reportId } = action.payload;
    const keyCounter = yield select(keyCounterSelector(reportId));
    const valueAxis = yield select(valueAxisSelector(reportId));
    const reportType = yield select(reportTypeSelector(reportId));

    const mainColor = getNextDefaultColor(valueAxis);
    const cascadeColors = {};
    if (reportType === 'cascade') {
        cascadeColors.colorNegative = getNextDefaultColor(valueAxis, mainColor);
        cascadeColors.colorInitial = getNextDefaultColor(valueAxis, mainColor, cascadeColors.colorNegative);
        cascadeColors.colorTotal = getNextDefaultColor(valueAxis, mainColor, cascadeColors.colorNegative, cascadeColors.colorInitial);
    }

    const newEditorState = {
        keyCounter: keyCounter + 1,
        valueAxis: [
            ...valueAxis, {
                ...cascadeColors,
                key: keyCounter,
                color: mainColor
            }
        ],
        isChanged: true
    };
    yield put(applyNewState(reportId, newEditorState));
}

function* addValueAxisSaga() {
    yield takeEvery(types.ADD_VALUE_AXIS_REQUESTED, addValueAxisHandler);
}

function* removeValueAxisHandler(action) {
    const { reportId, index } = action.payload;
    const valueAxis = yield select(valueAxisSelector(reportId));
    const newEditorState = {
        valueAxis: valueAxis.filter((_, i) => i !== index),
        isChanged: true
    };
    yield put(applyNewState(reportId, newEditorState));
}

function* removeValueAxisSaga() {
    yield takeEvery(types.REMOVE_VALUE_AXIS_REQUESTED, removeValueAxisHandler);
}

function* changeValueAxisHandler(action) {
    const { reportId, index, data } = action.payload;
    const valueAxis = yield select(valueAxisSelector(reportId));
    const newEditorState = {
        valueAxis: valueAxis.map((d, i) =>
            i === index ? data : d
        ),
        isChanged: true
    };
    yield put(applyNewState(reportId, newEditorState));
}

function* changeValueAxisSaga() {
    yield takeEvery(types.CHANGE_VALUE_AXIS_REQUESTED, changeValueAxisHandler);
}

const sagas = [
    fork(addFieldsSaga), 
    fork(removeFieldSaga), 
    fork(changeFieldSaga), 
    fork(reorderFieldsSaga),
    fork(addSettingSaga),
    fork(filterChangeSaga),
    fork(filterRemoveSaga),
    fork(sortChangeSaga),
    fork(sortRemoveSaga),
    fork(sortReorderSaga),
    fork(groupRemoveSaga),
    fork(groupReorderSaga),
    fork(totalChangeSaga),
    fork(totalRemoveSaga),
    fork(setDataAxisKeySaga),
    fork(addValueAxisSaga),
    fork(removeValueAxisSaga),
    fork(changeValueAxisSaga)
];
export default sagas;
