import React from 'react';
import connect from 'react-redux/es/connect/connect';

import {
    setChartData
} from 'Actions/ReportActions';
import {
    subsystemsSelector,
    fieldsDataSelector,
    filterDataSelector,
    sortDataSelector,
    groupDataSelector,
    totalDataSelector,
    tableNameSelector,
    limit50Selector
} from 'Selectors/ReportsBuilder';

import {
    buildFullColumnName,
    showLoadingPreviewError
} from '../Services/Editor';

import {
    prepareFilterForPreview,
    prepareSortingForPreview,
    prepareAggregationForPreview
} from '../Services/Viewer';

import { getPreviewWithTotal } from '../network';
import { formatDate } from '../utils';

import { applyContext } from './Context';

import Viewer from '../ReportViewer';

class ViewerWrapper extends React.Component {
    loadReportPreviewData = (sorting, filtration, paginationCurrent, paginationRows, needPagination, limit, offset) => {
        if (!this.props.fieldsData || !this.props.fieldsData.length) {
            this.props.setChartData([]);
            return Promise.resolve({data: [], total: []});
        }

        const apiParams = {
            "aggregations": [],
            "groupBy": [],
            "orderBy": [],
            "select": [],
            "table": this.props.tableName,
            "where": [],
            "limit": limit,
            "offset": offset
        }
        apiParams.select = this.props.fieldsData.map(f => ({ column: buildFullColumnName(f.table, f.column), filterable: f.filter, sortable: f.sort, title: f.title }));
        apiParams.orderBy = prepareSortingForPreview(sorting);
        apiParams.where = prepareFilterForPreview(this.props.viewsData, filtration);
        apiParams.aggregations = prepareAggregationForPreview(this.props.totalData);
        return getPreviewWithTotal(apiParams)
            .then(
                result => {
                    const totalData = {};
                    if (result.data.total) {
                        const headerTitles = result.data.headers.map(item => item.title);
                        const headerColumns = result.data.headers.map(item => item.column);
                        result.data.total.forEach(column => {
                            const columnIndex = headerColumns.indexOf(column.column);
                            if (columnIndex >= 0)
                                totalData[headerTitles[columnIndex]] = column.value;
                        });
                    }

                    const reportData = {
                        data: (needPagination ? result.data.rows.slice((paginationCurrent - 1) * paginationRows, paginationCurrent * paginationRows) : result.data.rows).map((row) => {
                            const rowObject = {};

                            result.data.headers.forEach((c, i) => {
                                if (c.type === 'date')
                                    rowObject[c.title] = formatDate(row[i]);
                                else
                                    rowObject[c.title] = row[i];
                            });

                            return rowObject;
                        }),
                        total: {
                            count: result.data.rows.length,
                            data: [totalData]
                        }
                    }
                    this.props.setChartData(reportData.data)
                    return reportData;
                }
            )
            .catch(e => {
                showLoadingPreviewError();
                return e;
            });
    }

    render () {
        const {
            fieldsData,
            filterData,
            sortData,
            groupData,
            totalData,
            ...rest
        } = this.props;

        return (
            <Viewer
                columns={fieldsData}
                grouping={groupData}
                filtering={filterData}
                sorting={sortData}
                aggregating={totalData}
//                onSortChange = {this.onSortChanged}
//                onFilterChange = {this.onFilterChanged}
                dataSource={this.loadReportPreviewData}
                serverProcessing={true}
                {...rest}
            />
        )
    }
}

export default applyContext(
    connect((state, ownProps) => {
        return {
            viewsData: subsystemsSelector(state),
            fieldsData: fieldsDataSelector(ownProps.reportId)(state),
            filterData: filterDataSelector(ownProps.reportId)(state),
            sortData: sortDataSelector(ownProps.reportId)(state),
            groupData: groupDataSelector(ownProps.reportId)(state),
            totalData: totalDataSelector(ownProps.reportId)(state),
            limit50: limit50Selector(ownProps.reportId)(state),
            tableName: tableNameSelector(ownProps.reportId)(state)
        };
    }, (dispatch, ownProps) => {
        return {
            setChartData: (data) => dispatch(setChartData(ownProps.reportId, data))
        };
    })(ViewerWrapper)
);
