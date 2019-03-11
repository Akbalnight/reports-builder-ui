import { 
    findViewsTable, 
    buildFullColumnName,
    allCompareTypes,
    aggregationType,
    parseFullColumnName
} from './Editor.js';

import { parseDate } from '../utils.js';

const getFilterValue = (viewsData, filter) => {
    const td = findViewsTable(viewsData, filter.table);
    const cd = td.children.find(c => c.column === filter.column);
    if (cd.type === 'numeric') {
        return +filter.value || null;
    } else if (cd.type === 'date') {
        const date = parseDate(filter.value, 'DD.MM.YYYY');
        return date.isValid() ? date.format() : null;
    }
        
    return filter.value || null;
}

const getFilterValueExecute = (viewsData, filter) => {
    const {table, column} = parseFullColumnName(filter.column, filter.table);

    return getFilterValue(viewsData, {
        table,
        column,
        value: filter.value
    });
}

const allowedEmptyFunctions = [
    'Равно', '='
];
const isEmptyAllowed = (func, value) => {
    if (value)
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
            value: getFilterValueExecute(viewsData, filter)
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