import React from 'react';
import connect from 'react-redux/es/connect/connect';

import { 
    setReportType,
    setReportName,
    setIsPublic
} from 'Actions/ReportActions';
import { reportTypeSelector, reportNameSelector, isPublicSelector } from 'Selectors/ReportsBuilder';

import { applyContext } from './Context';

import TypeSettings from './TypeSettings';

class TypeSettingsWrapper extends React.Component {
    reportNameChangedHandler = (e) => {
        this.props.setReportName(e.target.value);
    }

    isPublicChangedHandler = (e) => {
        this.props.setIsPublic(e.target.checked);
    }

    render () {
        const {
            setReportType,
            setReportName,
            setIsPublic,
            ...rest
        } = this.props;

        return (
            <TypeSettings
                onReportTypeChange={setReportType}
                onReportNameChange={this.reportNameChangedHandler} 
                onIsPublicChange={this.isPublicChangedHandler}
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
        };
    }, (dispatch, ownProps) => {
        return { 
            setReportType: (data) => dispatch(setReportType(ownProps.reportId, data)),
            setReportName: (data) => dispatch(setReportName(ownProps.reportId, data)),
            setIsPublic: (data) => dispatch(setIsPublic(ownProps.reportId, data))
        };
    })(TypeSettingsWrapper)
);