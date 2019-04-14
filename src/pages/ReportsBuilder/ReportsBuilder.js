import React from 'react';
import { PropTypes } from 'prop-types';
import connect from 'react-redux/es/connect/connect';

import { Spin } from 'antd';

import {
    initializeEditor,
    requestLoad,
    clearEditor
} from 'Actions/ReportActions';

import { isReportInitializedSelector } from 'Selectors/ReportsBuilder';

import EditorWrapper from './ReportsBuilder/EditorWrapper';

class ReportsBuilder extends React.Component {
    static propTypes = {
        description: PropTypes.shape({
            id: PropTypes.number
        }),
        isInitialized: PropTypes.bool
    }

    constructor(props) {
        super(props);

        if (props.reportId) {
            props.requestLoad(props.reportId);
        } else if (props.description && props.description.id) {
            props.requestLoad(props.description.id);
        } else {
            props.initializeEditor(0);
        }
    }

    getReportIdSafe = () => this.props.reportId || (this.props.description && this.props.description.id) || 0;

    componentWillUnmount() {
        this.props.clearEditor(this.getReportIdSafe());
    }

    render() {
        return (
            <Spin spinning={!this.props.isInitialized}>
                {this.props.isInitialized 
                    ? <EditorWrapper reportId={this.getReportIdSafe()} onCancel={this.props.onCancel} />
                    : <div className="rbu-loading-dummy"></div>
                }
            </Spin>
        );
    }
}

export default connect((state, ownProps) => ({
    isInitialized: isReportInitializedSelector(ownProps.reportId || (ownProps.description && ownProps.description.id) || 0)(state)
}), { 
    initializeEditor,
    requestLoad,
    clearEditor,
})(ReportsBuilder);
