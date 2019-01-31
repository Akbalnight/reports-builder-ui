import React from 'react';
import connect from 'react-redux/es/connect/connect';

import { 
    requestReportsList, 
    changeSettingsTab ,
    requestSave
} from 'Actions/ReportActions';

import { 
    reportTypeSelector, 
    reportNameSelector,
    isChangedSelector,
    editorStateSelector
} from 'Selectors/ReportsBuilder';

import { wrapContext, applyContext } from './Context';

import Editor from './Editor';

class EditorWrapper extends React.Component {
    render () {
        return (
            <Editor {...this.props} />
        )
    }
}

export default wrapContext(
    applyContext(
        connect((state, ownProps) => {
            return {
                reportType: reportTypeSelector(ownProps.reportId)(state),
                reportName: reportNameSelector(ownProps.reportId)(state),
                isChanged: isChangedSelector(ownProps.reportId)(state),
                editorState: editorStateSelector(ownProps.reportId)(state),
            };
        }, (dispatch, ownProps) => {
            return { 
                changeSettingsTab: (data) => dispatch(changeSettingsTab(ownProps.reportId, data)),
                requestReportsList: () => dispatch(requestReportsList()),
                requestSave: () => dispatch(requestSave(ownProps.reportId)),
                onCancel: () => {
                    let key = 'report-builder';
                    if (ownProps.reportId) {
                        key += '-' + ownProps.reportId;
                    }

                    ownProps.onCancel(key);

                    //dispatch(closeTab(key));
                    //dispatch(changeTab('reports'));
                }
            };
        })(EditorWrapper))
    );