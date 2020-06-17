import {
    findViewsTable,
    buildFullColumnName,
    allCompareTypes,
    aggregationType,
    parseFullColumnName
} from './Editor.js';

const getFilterValue = (viewsData, filter) => {
    const td = findViewsTable(viewsData, filter.table);
    let cd = '';
   try {
       cd = td.children.find(c => c.column === filter.column);
   } catch (e) {
       return +filter.value || null;
   }
    if (cd.type === 'numeric') {
        return +filter.value || null;
    } else if (cd.type === 'date') {
        return filter.value;
    }
    return filter.value || null;
}

const getFilterValue2 = (viewsData, filter) => {
    const td = findViewsTable(viewsData, filter.table);
    // const cd = td.children.find(c => c.column === filter.column);
    let cd = '';
    try {
        cd = td.children.find(c => c.column === filter.column);
    } catch (e) {
        return +filter.value2 || null;
    }
    if (cd.type === 'numeric') {
        return +filter.value2 || null;
    } else if (cd.type === 'date') {
        return filter.value2;
    }

    return filter.value2 || null;
}

const getFilterValueExecute = (viewsData, filter) => {
    const {table, column} = parseFullColumnName(filter.column, filter.table);

    return getFilterValue(viewsData, {
        table,
        column,
        value: filter.value
    });
}

const getFilterValue2Execute = (viewsData, filter) => {
    const {table, column} = parseFullColumnName(filter.column, filter.table);

    return getFilterValue(viewsData, {
        table,
        column,
        value: filter.value2
    });
}

const allowedEmptyFunctions = [
    'Задано', 'is not null',
    'Не задано', 'is null'
];
const isEmptyAllowed = (func, value) => {
    if (value!==null)
        return true;

    return allowedEmptyFunctions.includes(func)
}


export const prepareFilterForExecute = (viewsData, filters) => {
    if (!filters)
        return [];

    return filters
        .filter(filter => filter.operator && isEmptyAllowed(filter.operator, filter.value))
        .map(filter => ({
            ...filter,
            value: getFilterValueExecute(viewsData, filter),
            value2: getFilterValue2Execute(viewsData, filter)
        }));
}

export const prepareSortingForExecute = (sorting) => {
    return sorting;
}

export const prepareAggregationForExecute = (aggregation) => {
    return aggregation;
}

export const prepareFilterForPreview = (viewsData, filters) => {
    if (!filters)
        return [];

    return filters
        .filter(filter => filter.func && isEmptyAllowed(filter.func, filter.value))
        .map(filter => {
            const {table, column} = parseFullColumnName(filter.column, filter.table);
            return {
                column: buildFullColumnName(table, column),
                operator: allCompareTypes.find(type => type.title === filter.func).type,
                value: getFilterValue(viewsData, {
                    ...filter,
                    table,
                    column
                }),
                value2: getFilterValue2(viewsData, {
                    ...filter,
                    table,
                    column
                })
            }
        });
}

export const prepareSortingForPreview = (sorting) => {
    if (!sorting)
        return [];

    return sorting
        .filter(sort => sort.order)
        .map(sort => ({
            column: buildFullColumnName(sort.table, sort.column),
            order: (sort.order === "По возрастанию" ? "ASC" : "DESC")
        }));
}

export const prepareAggregationForPreview = (aggregation) => {
    if (!aggregation)
        return [];

    return aggregation
        .filter(row => row.func)
        .map(row => ({
            column: buildFullColumnName(row.table, row.column),
            title: row.title,
            function: aggregationType(row)
        }));
}
