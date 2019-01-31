import React, { Component, Fragment } from 'react';
import { PropTypes } from 'prop-types';
import connect from 'react-redux/es/connect/connect';

import { 
    requestChangeFilter,
    requestRemoveFilter,
    requestChangeSort,
    requestRemoveSort,
    requestReorderSort,
    requestRemoveGroup,
    requestReorderGroup,
    requestChangeTotal,
    requestRemoveTotal
} from 'Actions/ReportActions';
import { 
    filterDataSelector,
    sortDataSelector,
    groupDataSelector,
    totalDataSelector
} from 'Selectors/ReportsBuilder';

import { applyContext } from './Context';

import Settings from './Settings';

class FieldsWrapper extends React.Component {
    viewsIdFunc = (row) => row.key;

    render () {
        const {
            onTabChange,
            filterData,
            sortData,
            groupData,
            totalData,

            changeFilter,
            removeFilter,
            changeSort,
            removeSort,
            reorderSort,
            removeGroup,
            reorderGroup,
            changeTotal,
            removeTotal
        } = this.props;

        return (
            <Settings
                onTabChange={onTabChange}
                filterDataSource={filterData}
                onFilterChange={changeFilter}
                onFilterDelete={removeFilter}
                sortDataSource={sortData}
                onSortChange={changeSort}
                onSortDelete={removeSort}
                onSortOrderChange={reorderSort}
                groupDataSource={groupData}
                onGroupDelete={removeGroup}
                onGroupOrderChange={reorderGroup}
                totalDataSource={totalData}
                onTotalChange={changeTotal}
                onTotalDelete={removeTotal} />
        )
    }
}

export default applyContext(
    connect((state, ownProps) => {
        return {
            filterData: filterDataSelector(ownProps.reportId)(state),
            sortData: sortDataSelector(ownProps.reportId)(state),
            groupData: groupDataSelector(ownProps.reportId)(state),
            totalData: totalDataSelector(ownProps.reportId)(state)
        };
    }, (dispatch, ownProps) => {
        return { 
            changeFilter: (data) => dispatch(requestChangeFilter(ownProps.reportId, data)),
            removeFilter: (data) => dispatch(requestRemoveFilter(ownProps.reportId, data)),
            changeSort: (data) => dispatch(requestChangeSort(ownProps.reportId, data)),
            removeSort: (data) => dispatch(requestRemoveSort(ownProps.reportId, data)),
            reorderSort: (data) => dispatch(requestReorderSort(ownProps.reportId, data)),
            removeGroup: (data) => dispatch(requestRemoveGroup(ownProps.reportId, data)),
            reorderGroup: (data) => dispatch(requestReorderGroup(ownProps.reportId, data)),
            changeTotal: (data) => dispatch(requestChangeTotal(ownProps.reportId, data)),
            removeTotal: (data) => dispatch(requestRemoveTotal(ownProps.reportId, data))
        };
    })(FieldsWrapper)
);