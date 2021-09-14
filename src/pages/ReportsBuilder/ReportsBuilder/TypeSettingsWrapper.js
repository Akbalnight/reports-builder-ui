import React from 'react';
import connect from 'react-redux/es/connect/connect';

import {
    setReportType,
    setReportName,
    setIsPublic,
    setIsFavorite,
    setLimit50
} from 'Actions/ReportActions';
import {
    reportTypeSelector,
    reportNameSelector,
    isPublicSelector,
    isFavoriteSelector,
    limit50Selector
} from 'Selectors/ReportsBuilder';

import { applyContext } from './Context';

import TypeSettings from './TypeSettings';

class TypeSettingsWrapper extends React.Component {
    reportNameChangedHandler = (e) => {
        this.props.setReportName(e.target.value);
    }

    isPublicChangedHandler = (e) => {
        this.props.setIsPublic(e.target.checked);
    }

    isFavoriteChangedHandler = (e) => {
        this.props.setIsFavorite(e.target.checked);
    }

    isLimit50Handler = (e) => {
        this.props.setLimit50(e.target.checked);
    }

    render () {
        const {
            setReportType,
            setReportName,
            ...rest
        } = this.props;

        return (
            <TypeSettings
                onReportTypeChange={setReportType}
                onReportNameChange={this.reportNameChangedHandler}
                onIsPublicChange={this.isPublicChangedHandler}
                onIsFavoriteChange={this.isFavoriteChangedHandler}
                onLimit50Change={this.isLimit50Handler}
                {...rest}
            />
        )
    }
}

export default applyContext(
    connect((state, ownProps) => {
        return {
            reportType: reportTypeSelector(ownProps.reportId)(state),
            reportName: reportNameSelector(ownProps.reportId)(state),
            isPublic: isPublicSelector(ownProps.reportId)(state),
            isFavorite: isFavoriteSelector(ownProps.reportId)(state),
            limit50: limit50Selector(ownProps.reportId)(state),
        };
    }, (dispatch, ownProps) => {
        return {
            setReportType: (data) => dispatch(setReportType(ownProps.reportId, data)),
            setReportName: (data) => dispatch(setReportName(ownProps.reportId, data)),
            setIsPublic: (data) => dispatch(setIsPublic(ownProps.reportId, data)),
            setIsFavorite: (data) => dispatch(setIsFavorite(ownProps.reportId, data)),
            setLimit50: (data) => dispatch(setLimit50(ownProps.reportId, data))
        };
    })(TypeSettingsWrapper)
);
