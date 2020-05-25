import {
    Modal,
    notification,
} from 'antd';

export const stringCompareTypes = [{
    type: 'contains',
    title: 'Содержит'
}, {
    type: 'not contains',
    title: 'Не содержит'
}];

export const generalCompareTypes = [{
    type: '=',
    title: 'Равно'
}, {
    type: '<',
    title: 'Меньше'
}, {
    type: '>',
    title: 'Больше'
}, {
    type: '<=',
    title: 'Меньше или равно'
}, {
    type: '>=',
    title: 'Больше или равно'
}, {
    type: 'between',
    title: 'Между'
}, {
    type: 'not between',
    title: 'Не между'
}, {
    type: 'is not null',
    title: 'Задано'
}, {
    type: 'is null',
    title: 'Не задано'
}];

export const allCompareTypes = [...stringCompareTypes, ...generalCompareTypes];

export const generalOrderTypes = [{
    type: 'ASC',
    title: 'По возрастанию'
}, {
    type: 'DESC',
    title: 'По убыванию'
}];

export const generalAggregationTypes = [{
    type: 'SUM',
    title: 'Сумма'
}, {
    type: 'AVG',
    title: 'Среднее'
}, {
    type: 'MIN',
    title: 'Минимум'
}, {
    type: 'MAX',
    title: 'Максимум'
}, {
    type: 'COUNT',
    title: 'Колличество'
}];

export const defaultColors = [
    '#004DCF',
    '#B80000',
    '#FCCB00',
    '#008B02',
    '#DB3E00',
    '#006B76',
    '#1273DE',
    '#5300EB',
    '#EB9694',
    '#FAD0C3',
    '#FEF3BD',
    '#C1E1C5',
    '#BEDADC',
    '#C4DEF6',
    '#BED3F3',
    '#D4C4FB'
];

export const chartsCount = {
    pie: 1,
    cascade: 1,
    combo: 2
};
export const calculateXFor = ['linear', 'scatter', 'hbar'];
export const calculateYFor = ['linear', 'scatter', 'bar', 'combo'];

export const chartLineTypes = [{
    type: 'line',
    title: 'Линия'
}, {
    type: 'bar',
    title: 'Столбец'
}, {
    type: 'area',
    title: 'Заливка'
}];

export const compareFuncHasParam = (func) => !['Задано', 'Не задано'].includes(func);
export const compareFuncHasParamBetween = (func) => ['Между', 'Не между'].includes(func);

export const chartIcons = {
    table: {icon: 'table'},
    linear: {icon: 'line-chart'},
    bar: {icon: 'bar-chart'},
    hbar: {icon: 'bar-chart', className: 'rbu-builder-item-title-hbar-icon'},
    scatter: {icon: 'dot-chart'},
    pie: {icon: 'pie-chart'},
    cascade: {icon: 'bar-chart'},
    combo: {icon: 'area-chart'},
}

export const getCurrentChartIconSafe = (reportType) => {
    const iconDescription = chartIcons[reportType];
    if (iconDescription)
        return iconDescription;

    return {
        icon: 'question'
    }
}

export const findViewsTable = (tree, name) => {
    for (let node of tree) {
        if (node.isFirstParent) {
            if (node.name === name)
                return node;
        } else {
            const resultNode = findViewsTable(node.children, name);
            if (resultNode) return resultNode;
        }
    }
}

export const getViewsAllowedParents = (viewsData, rows) => {
    const views = [];

    const push = (value) => {
        if (!views.includes(value))
            views.push(value);
    }

    rows.forEach(row => {
        if (row.parent && row.parent.parent && row.parent.parent.join) {
            const p = row.parent;
            push(p.key);
            const join = p.parent.join;
            if (join) {
                join.forEach(item => {
                    if (item.includes(p.name)) {
                        item.forEach(name => {
                            const td = findViewsTable(viewsData, name);
                            push(td.key);
                        });
                    }
                });
            }
        }
    });
    return views;
}

export const getSelectedViews = (rows) => {
    return rows.map(row => row.fieldKey);
}

export const canFieldMove = (tab) => (row) => {
    switch (tab) {
        case 'filter': return row.canWhere;
        case 'sort': return row.canOrder;
        case 'group': return row.canGroup;
        case 'total': return row.canAggregate;
        default: return false;
    }
}

export const buildFullColumnName = (table, column) => {
    if (!column.includes('.'))
        return `${table}.${column}`;
    return column;
}

export const aggregationType = (row) => {
    const aggregationRow = generalAggregationTypes.find(item => item.title === row.func);
    return aggregationRow && aggregationRow.type;
};

export const getNextDefaultColor = (valueAxis, ...additionalColors) => {
    const sc = [...valueAxis.map(a => a.color), ...additionalColors].map(a => a.toLowerCase());
    const colors = defaultColors.filter(c => !sc.includes(c.toLowerCase()));
    if (colors.length)
        return colors[0];

    return defaultColors[0];
}

export const parseFullColumnName = (column, defaultTable) => {
    if (!column) return {};
    const index = column.lastIndexOf('.');
    if (index === -1)
        return {
            column: column,
            table: defaultTable
        };

    return {
        table: column.substr(0, index),
        column: column.substr(index + 1)
    }
}

export const errorDialog = (props) => {
    Modal.error({
        centered: true,
        title: 'Внимание',
        maskClosable: true,
        okText: 'Ок',
        className: 'rbu-builder-editor-modal',
        ...props
    });
}

export const confirmDialog = (props) => {
    Modal.confirm({
        centered: true,
        title: 'Внимание',
        maskClosable: true,
        okText: 'Ок',
        cancelText: 'Отмена',
        className: 'rbu-builder-editor-modal',
        ...props
    });
}

export const showSavingError = () => notification.error({
    message: 'Не удалось сохранить отчёт',
    description: 'В настоящее время не удалсь сохранить отчёт, попробуйте позже.'
});

export const showLoadingPreviewError = () => notification.error({
    message: 'Не удалось загрузить данные',
    description: 'Не удалось загрузить данные.'
});

export const askActionAfterSaving = ({onClose, onCancel}) => Modal.confirm({
    title: 'Отчёт успешно сохранён',
    content: 'Отчёт успешно сохранён.',
    cancelText: 'Продолжить редактирование',
    okText: 'Закрыть редактор',
    onOk: onClose,
    onCancel: onCancel,
    width: 450
});

export const notificationAfterSaving = (icon, title, description) => notification[icon]({
    message: title,
    description: description || title
});

export const VALIDATION_EMPTY_NAME = 'VALIDATION_EMPTY_NAME';
export const VALIDATION_NO_FIELDS = 'VALIDATION_NO_FIELDS';
export const VALIDATION_NO_TYPE='VALIDATION_NO_TYPE';
export const VALIDATION_FILTER_OPERATORS = 'VALIDATION_FILTER_OPERATORS';
export const VALIDATION_SORT_ORDERS = 'VALIDATION_SORT_ORDERS';
export const VALIDATION_TOTAL_OPERATORS = 'VALIDATION_TOTAL_OPERATORS';

export const validateStoringData = (editorState) => {
    if (!editorState.reportName) {
        return VALIDATION_EMPTY_NAME;
    }
    if (!editorState.reportType) {
        return VALIDATION_NO_TYPE;
    }
    if (!editorState.fieldsData.length) {
        return VALIDATION_NO_FIELDS;
    }

    if (editorState.filterData.some(row => !row.func)) {
        return VALIDATION_FILTER_OPERATORS;
    }

    if (editorState.sortData.some(row => !row.order)) {
        return VALIDATION_SORT_ORDERS;
    }

    if (editorState.totalData.some(row => !row.func)) {
        return VALIDATION_TOTAL_OPERATORS;
    }

    return true;
}

const validationErrorMessages = {
    VALIDATION_EMPTY_NAME: 'Название отчёта не может быть пустым.',
    VALIDATION_NO_TYPE: 'Представление отчёта не выбрано.',
    VALIDATION_NO_FIELDS: 'Отчёт должен содержать хотя бы одно поле.',
    VALIDATION_FILTER_OPERATORS: 'Необходимо указать все операторы фильтров.',
    VALIDATION_SORT_ORDERS: 'Необходимо указать порядок сортировки.',
    VALIDATION_TOTAL_OPERATORS: 'Необходимо указать все функции полей итого.',
}

export const showValidationError = (validationError) => {
    if (validationErrorMessages[validationError]) {
        errorDialog({
            content: validationErrorMessages[validationError]
        });
        return true;
    }
    return false;
}

export const processStoringResult = (textStatus) => {
    return new Promise((resolve, reject) => {
        if (textStatus === 'success') {
            notificationAfterSaving('success', 'Отчёт успешно сохранён');
        } else {
            notificationAfterSaving('error', 'Не удалось сохранить отчёт');
        }
        reject();
    });
}

export const findTableAndColumn = (tree, name) => {
    const {table, column} = parseFullColumnName(name);
    const tableDescription = findViewsTable(tree, table);
    if (!tableDescription)
        return undefined;

    const fieldDescription = tableDescription.children.find(f => f.column === column);
    if (!fieldDescription)
        return undefined;

    return {
        table: tableDescription,
        field: fieldDescription
    }
}
