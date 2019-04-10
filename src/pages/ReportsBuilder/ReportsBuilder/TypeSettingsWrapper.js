import React from 'react';
import connect from 'react-redux/es/connect/connect';

import { 
    setReportType,
    setReportName,
    setIsPublic,
    setIsFavorite
} from 'Actions/ReportActions';
import { 
    reportTypeSelector, 
    reportNameSelector, 
    isPublicSelector,
    isFavoriteSelector
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
        };
    }, (dispatch, ownProps) => {
        return { 
            setReportType: (data) => dispatch(setReportType(ownProps.reportId, data)),
            setReportName: (data) => dispatch(setReportName(ownProps.reportId, data)),
            setIsPublic: (data) => dispatch(setIsPublic(ownProps.reportId, data)),
            setIsFavorite: (data) => dispatch(setIsFavorite(ownProps.reportId, data))
        };
    })(TypeSettingsWrapper)
);