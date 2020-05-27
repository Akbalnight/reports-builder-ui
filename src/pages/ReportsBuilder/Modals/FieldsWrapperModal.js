import React from 'react';
import connect from 'react-redux/es/connect/connect';

import {
    requestRemoveField,
    requestChangeField,
    requestReorderFields,
    requestAddSetting
} from 'Actions/ReportActions';
import { fieldsDataSelector, settingsTabSelector } from 'Selectors/ReportsBuilder';

import { applyContext } from '../ReportsBuilder/Context';

import Fields from './FieldsModal';
import { canFieldMove } from '../Services/Editor';

class FieldsWrapperModal extends React.Component {
    viewsIdFunc = (row) => row.key;

    render () {
        const {
            data,
            settingsTab,
            deleteField,
            changeField,
            reorderFields,
            addSetting,
            addNameTable
        } = this.props;

        return (
            <Fields
                dataSource={data}
                canMove={canFieldMove(settingsTab)}
                onDelete={deleteField}
                onRowChanged={changeField}
                onOrderChange={reorderFields}
                onDoubleClick={addSetting}
                addNameTable={addNameTable}/>
        )
    }
}

export default applyContext(
    connect((state, ownProps) => {
        return {
            data: fieldsDataSelector(ownProps.reportId)(state),
            settingsTab: settingsTabSelector(ownProps.reportId)(state)
        };
    }, (dispatch, ownProps) => {
        return {
            deleteField: (data) => dispatch(requestRemoveField(ownProps.reportId, data)),
            changeField: (data) => dispatch(requestChangeField(ownProps.reportId, data)),
            reorderFields: (data) => dispatch(requestReorderFields(ownProps.reportId, data)),
            addSetting: (data) => dispatch(requestAddSetting(ownProps.reportId, data))
        };
    })(FieldsWrapperModal)
);
