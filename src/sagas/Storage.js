import { fork, call, select, put, takeEvery } from 'redux-saga/effects';

import * as types from 'Constants/ReportTypes'

import { 
    load,
    requestReportsList,
    applyNewState
} from 'Actions/ReportActions';

import { 
    reportDataSelector,
    subsystemsSelector
} from 'Selectors/ReportsBuilder';

import { getReport, storeReport } from 'Pages/ReportsBuilder/network';
import { clearChangedKey } from 'Pages/ReportsBuilder/Services/IsChanged';

import { 
    getViewsAllowedParents,
    parseFullColumnName,
    findViewsTable,
    getSelectedViews,
    generalOrderTypes,
    generalAggregationTypes,
    allCompareTypes,
    buildFullColumnName,
    aggregationType,
    processStoringResult
} from 'Pages/ReportsBuilder/Services/Editor';

const orderTitle = (type) => {
    const orderRow = generalOrderTypes.find(item => item.type === type);
    return orderRow && orderRow.title;
};

const aggregationTitle = (func) => {
    const aggregationRow = generalAggregationTypes.find(item => item.type === func);
    return aggregationRow && aggregationRow.title;
};

const operatorTitle = (func) => {
    const operatorRow = allCompareTypes.find(item => item.type === func);
    return operatorRow && operatorRow.title;
}

const createFilterValue = (value, type) => {
    return value;
}

const loadRowsConverter = (rows) => {
    if (!rows || rows.isAll) return [];
    return [
        typeof (rows.from) === 'number' ? rows.from : undefined,
        typeof (rows.to) === 'number' ? rows.to : undefined
    ];
}

const generateStateChartNames = (cd) => {
    return {
        title: cd.names.chart,
        valueAxis: cd.names.yAxis,
        dataAxis: cd.names.xAxis
    }
};

const generateStateChartDataAxis = (cd, fd) => {
    if (!cd.dataAxis)
        return {};

    const dataAxisField = fd.find(item => item.title === cd.dataAxis.key) || {};
    return  {
        dataKey: cd.dataAxis.key,
        dataType: dataAxisField.type,
        dataTitle: dataAxisField.title
    }
};

const generateStateChartValueAxis = (cd, fd, keyCounter) => {
    if (!cd.valueAxis)
        return [];

    return cd.valueAxis.map(item => ({
        key: keyCounter++,
        chartType: item.type,
        dataAxisKey: item.dataKey,
        dataKey: item.key,
        dataKey2: item.key2,
        color: item.color,
        color2: item.color2,
        name: item.name,
        rows: loadRowsConverter(item.rows)
    }));
};

const generateStateChartSettings = (cd) => {
    return {
        isLegendVisible: !!cd.general.showLegend,
        isCalculatedXRange: !!cd.general.calculatedXRange,
        isCalculatedYRange: !!cd.general.calculatedYRange,
        isShowedDotValues: !!cd.general.showDotValues
    };
};

const generateStateChartData = (cd, fd, keyCounter) => {
    if (cd && cd.version === 1) {
        return {
            chartNames: generateStateChartNames(cd, fd, keyCounter),
            dataAxis: generateStateChartDataAxis(cd, fd, keyCounter),
            valueAxis: generateStateChartValueAxis(cd, fd, keyCounter),
            ...generateStateChartSettings(cd, fd, keyCounter)
        };
    }

    return {};
};

const generateReduxData = (data) => {
    const rd = data.reportData;
    const qd = rd.queryDescriptor;
    const cd = rd.description;

    let keyCounter = data.keyCounter;

    const fieldsData = qd.select.map(row => {
        const {column, table} = parseFullColumnName(row.column);
        const td = findViewsTable(data.viewsData, table).children;
        const field = td.find(f => f.column === column);

        return {
            id: row.column,
            parent: field.parent,
            key: keyCounter++,
            fieldKey: field.key,
            type: field.type,
            column,
            table,
            title: row.title,
            sort: !!row.sortable,
            filter: !!row.filterable,
            canWhere: field.canWhere,
            canOrder: field.canOrder,
            canGroup: field.canGroup,
            canAggregate: field.canAggregate
        }
    });

    return {
        ...generateStateChartData(cd, fieldsData, keyCounter),
        isReportInitialized: true,
        reportId: rd.id,
        reportName: rd.title,
        reportType: rd.type,
        isChartView: rd.type !== 'table',
        isPublic: rd.isPublic,
        isFavorite: rd.isFavorite,
        fieldsData,
        viewsSelected: getSelectedViews(fieldsData),
        viewsAllowedParents: getViewsAllowedParents(data.viewsData, fieldsData),
        filterData: qd.where ? qd.where.map(row => {
            const {column, table} = parseFullColumnName(row.column)
            const field = fieldsData.find(f => f.id === row.column);

            return {
                id: row.column,
                key: keyCounter++,
                column,
                table,
                type: field.type,
                title: row.title,
                func: operatorTitle(row.operator),
                value: createFilterValue(row.value, field.type)
            }
        }) : [],
        sortData: qd.orderBy ? qd.orderBy.map(row => {
            return {
                ...parseFullColumnName(row.column),
                id: row.column,
                key: keyCounter++,
                title: row.title,
                order: orderTitle(row.order)
            }
        }) : [],
        groupData: qd.groupBy ? qd.groupBy.map(row => {
            return {
                ...parseFullColumnName(row.column),
                id: row.column,
                key: keyCounter++,
                title: row.title,
            }
        }) : [],
        totalData: qd.aggregations ? qd.aggregations.map(row => {
            return {
                ...parseFullColumnName(row.column),
                id: row.column,
                key: keyCounter++,
                title: row.title,
                func: aggregationTitle(row.function)
            }
        }) : [],
        keyCounter
    };
}

const orderType = (row) => {
    const orderRow = generalOrderTypes.find(item => item.title === row.order);
    return orderRow && orderRow.type;
};

const operatorType = (row) => {
    const operatorRow = allCompareTypes.find(item => item.title === row.func);
    return operatorRow && operatorRow.type;
}

const filterValue = (row) => {
    if (!row.value)
        return row.value;
    switch (row.type) {
        case 'date':
            if (!row.value) return null;
            return row.value;
        case 'numeric':
            return +row.value;
        default:
            return row.value.toString();
    }
}

const saveRowsConverter = (rows) => {
    if (!rows || !Array.isArray(rows) || !rows.length)
        return {
            isAll: true
        }

    return {
        from: typeof(rows[0] === 'number') ? rows[0] : false,
        to: typeof(rows[1] === 'number') ? rows[1] : false
    }
}

const generateChartSaveNames = (type, data) => {
    const mainData = {
        chart: data.chartNames.title
    };

    if (type === 'pie')
        return mainData;

    return {
        ...mainData,
        xAxis: data.chartNames.dataAxis,
        yAxis: data.chartNames.valueAxis
    }
};

const generateChartSaveDataAxis = (type, data) => (type === 'pie' || type === 'scatter'
    ? {key: undefined}
    : {key: data.dataAxis.dataKey});

const generateChartSaveValueAxis = (type, data) => (
    data.valueAxis.map(item => {
        const mainData = {
            key: item.dataKey,
            name: item.name,
            rows: saveRowsConverter(item.rows)
        };

        const colorData = {
            color: item.color
        };

        if (type === 'pie')
            return mainData;

        if (type === 'scatter')
            return {
                ...mainData,
                ...colorData,
                dataKey: item.dataAxisKey
            };

        if (type === 'cascade')
            return {
                ...mainData,
                ...colorData,
                key2: item.dataKey2,
                color2: item.color2
            };

        if (type === 'combo')
            return {
                ...mainData,
                ...colorData,
                type: item.chartType,
            };

        return {
            ...mainData,
            ...colorData
        }
    })
);

const generateChartSaveSettings = (type, data) => {
    const mainData = {
        showLegend: data.isLegendVisible,
        showDotValues: data.isShowedDotValues
    };

    if (type === 'pie')
        return mainData;

    return {
        ...mainData,
        calculatedYRange: data.isCalculatedYRange,
        calculatedXRange: data.isCalculatedXRange,
    }
};

const generateChartSaveData = (type, data) => {
    return {
        version: 1,
        names: generateChartSaveNames(type, data),
        dataAxis: generateChartSaveDataAxis(type, data),
        valueAxis: generateChartSaveValueAxis(type, data),
        general: generateChartSaveSettings(type, data)
    }
};

const generateSaveData = (data) => {
    return {
        id: data.reportId,
        name: data.reportName,
        title: data.reportName,
        type: data.reportType,
        isPublic: data.isPublic,
        isFavorite: data.isFavorite,
        createdBy: 'username',
        description: generateChartSaveData(data.reportType, data),
        queryDescriptor: {
            aggregations: data.totalData.map(row => ({
                column: buildFullColumnName(row.table, row.column),
                title: row.title,
                function: aggregationType(row)
            })),
            groupBy: data.groupData.map(row => ({
                column: buildFullColumnName(row.table, row.column),
                title: row.title
            })),
            orderBy: data.sortData.map(row => ({
                column: buildFullColumnName(row.table, row.column),
                title: row.title,
                order: orderType(row)
            })),
            select: data.fieldsData.map(row => ({
                column: buildFullColumnName(row.table, row.column),
                title: row.title,
                sortable: !!row.sort,
                filterable: !!row.filter
            })),
            where: data.filterData.map(row => ({
                column: buildFullColumnName(row.table, row.column),
                title: row.title,
                operator: operatorType(row),
                value: filterValue(row)
            }))
        }
    }
}

function* loadHandler(action) {
    const { reportId } = action.payload;

    try {
        const { data } = yield call(getReport, reportId);
        const reportData = generateReduxData({
            reportData: data,
            keyCounter: 0,
            viewsData: yield select(subsystemsSelector)
        });
        yield put(load(reportId, reportData));
    } catch (e) {
        // error handling
        console.log(e);
    }
}

function* loadSaga() {
    yield takeEvery(types.LOAD_REQUESTED, loadHandler);
}

function* saveHandler(action) {
    const { reportId } = action.payload;

    try {
        const reduxData = yield select(reportDataSelector(reportId));
        const reportData = generateSaveData(reduxData);        
        const { data, textStatus } = yield call(storeReport, reportData);
        if (textStatus === 'success')
            yield put(applyNewState(reportId, {
                reportId: data && data.id
            }));
        yield call(clearChangedKey, reportId);
        yield put(requestReportsList());
        yield call(processStoringResult, textStatus);
    } catch (e) {
        // error handling
        console.log(e);
    }
}

function* saveSaga() {
    yield takeEvery(types.SAVE_REQUESTED, saveHandler);
}

const sagas = [
    fork(loadSaga),
    fork(saveSaga)
];
export default sagas;
