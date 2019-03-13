import moment from 'moment';

const getLengthSafe = (item) => Array.isArray(item) ? item.length : 0;
const hasChildren = (node) => Array.isArray(node.children) && node.children.length > 0;
const deepCopy = (data) => JSON.parse(JSON.stringify(data));
const _normalizeTree = (tree, parent) => {
    if (Array.isArray(tree.children)) {
        tree.children = _normalizeTree(tree.children, tree);
        tree.parent = parent;
        return tree;
    }

    if (Array.isArray(tree)) {
        return tree.map(node => _normalizeTree(node, parent));
    }

    if (typeof tree !== 'object')
        return {
            title: tree,
            parent
        };
    else
        tree.parent = parent;

    return tree;
}

const _setLeafsAndParentProperties = (nodes) => {
    return nodes.map(node => {
        node.isFirstParent = Array.isArray(node.children) ? _setLeafsAndParentProperties(node.children) : false;
        node.isLeaf = !hasChildren(node);
        return node.isLeaf;
    }).every(isLeaf => isLeaf);
}

const normalizeTree = (tree) => {
    tree = _normalizeTree(tree);
    _setLeafsAndParentProperties(tree);
    return tree;
}

const parseDate = (value) => {
    return moment(value, 'DD.MM.YYYY HH:mm').utcOffset(0);
}

let keyCounter = 0;
const prepareTree = (tree) => {
    const join = Object.entries(tree).find(([key]) => key === 'join');
    if (join) {
        delete tree.join;
    }
    const result = Object.entries(tree).map(([key, value]) => {
        if (Array.isArray(value)) {
            return {
                key: keyCounter++,
                title: key,
                children: value.map(item => ({
                    ...item,
                    canWhere: true,
                    canOrder: true,
                    canGroup: item.type !== 'numeric',
                    canAggregate: item.type === 'numeric',
                    key: keyCounter++
                }))
            }
        } else {
            return {
                ...prepareTree(value),
                key: keyCounter++,
                title: key
            }
        }
    });
    return {children: result, join: join && join[1]};
}

const prepareChartData = (data, valueAxis, dataAxis) => {
    let result = data.map((row, index) => {
        return {
            [dataAxis.dataKey]: row[dataAxis.dataKey],
            ...valueAxis.map((item) => {
                if (!item.rows || 
                    !Array.isArray(item.rows) || 
                    !item.rows.length ||
                    ((!item.rows[0] || index >= item.rows[0] - 1) && 
                    (!item.rows[1] || index <= item.rows[1] - 1)))
                    return {[item.dataKey]: row[item.dataKey]};
                
                return {};
            }).reduce((a, c) => ({...a, ...c}), {})
        }
    });

    if (dataAxis.dataOriginalType === 'date') {
        result = result.map(row => ({
            ...row,
            [dataAxis.dataKey]: parseDate(row[dataAxis.dataKey]).format('X')
        }));
    }

    if (dataAxis.dataKey && dataAxis.dataType === 'number') {
        result.sort((row1, row2) => row1[dataAxis.dataKey] - row2[dataAxis.dataKey]);
    }

    return result;
}

const chartFormatData = (value, dataAxis) => {
    if (dataAxis.dataOriginalType === 'date') {
        return moment.unix(value).format('DD.MM.YYYY HH:mm');
    }

    return value;
}

const charTooltipLabelFormatter = (value, dataAxis) => {
    const formattedValue = chartFormatData(value, dataAxis);
    if (dataAxis.dataTitle) {
        return `${dataAxis.dataTitle}: ${formattedValue}`;
    }

    return formattedValue;
}

const formatDate = (date) => {
    if (!date)
        return "";

    return moment(date).utcOffset(0).format('DD.MM.YYYY HH:mm');
}

const debounce = (func, wait, immediate) => {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

const numberRange = (min, max) => (p, n) => {
    if (p[n] < min || p[n] > max)
        return new Error(`${n} should be between ${min} and ${max}`);
}

const getDataDomain = (reportType, data, axis, isCalculated) => {
    if (isCalculated && axis.dataType === 'number') {
        const d = data.map(row => row[axis.dataKey]);
        const min = Math.min(...d);
        const max = Math.max(...d);

        if (isNaN(min) || isNaN(max) || max - min === 0)
            return [0, 'auto'];

        const rowValues = [20];
        if (reportType === 'bar')
            rowValues.push(d.filter((v, i, self) => self.indexOf(v) === i).length);

        const margins = rowValues.map(v => Math.abs((max - min) / v));

        const margin = Math.min(...margins);

        return [
            Math.trunc((min - margin) * 100) / 100,
            Math.trunc((max + margin) * 100) / 100,
        ];
    }

    return [0, 'auto'];
}

const getValueDomain = (reportType, data, axis, isCalculated) => {
    if (isCalculated) {
        const byAxis = axis.map(a => {
            const vd = data.map(d => d[a.dataKey]);
            return {
                min: Math.min(...vd),
                max: Math.max(...vd)
            }
        });
        const min = Math.min(...byAxis.map(ba => ba.min));
        const max = Math.max(...byAxis.map(ba => ba.max));

        if (isNaN(min) || isNaN(max) || max - min === 0)
            return [0, 'auto'];

        let margin = Math.abs((max - min) / 15);

        return [
            Math.trunc((min - margin) * 100) / 100,
            Math.trunc((max + margin) * 100) / 100,
        ];
    }

    return [0, 'auto'];
}

export {
    getLengthSafe,
    hasChildren,
    deepCopy,
    normalizeTree,
    prepareTree,
    prepareChartData,
    chartFormatData,
    charTooltipLabelFormatter,
    formatDate,
    debounce,
    numberRange,
    parseDate,
    getDataDomain,
    getValueDomain
};