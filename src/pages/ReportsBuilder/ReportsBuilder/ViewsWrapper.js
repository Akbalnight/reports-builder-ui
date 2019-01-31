import React from 'react';
import connect from 'react-redux/es/connect/connect';

import { requestAddFields } from 'Actions/ReportActions';
import { subsystemsSelector, selectedNodesSelector, allowedParentsSelector } from 'Selectors/ReportsBuilder';

import { applyContext } from './Context';

import Views from './Views';

class ViewsWrapper extends React.Component {
    viewsIdFunc = (row) => row.key;

    render () {
        const {
            selectedNodes,
            allowedParents,
            ...rest
        } = this.props;

        return (
            <Views
                selectedNodes={selectedNodes}
                allowedParents={allowedParents}
                idFunc={this.viewsIdFunc}
                onMoveItem={this.props.addFields}
                {...rest}
            />
        )
    }
}

export default applyContext(
    connect((state, ownProps) => {
        return {
            data: subsystemsSelector(state),
            selectedNodes: selectedNodesSelector(ownProps.reportId)(state),
            allowedParents: allowedParentsSelector(ownProps.reportId)(state),
        };
    }, (dispatch, ownProps) => {
        return { 
            addFields: (data) => {
                dispatch(requestAddFields(ownProps.reportId, data));
            } 
        };
    })(ViewsWrapper)
);