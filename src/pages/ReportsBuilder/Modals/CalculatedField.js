import React, { Component } from 'react';
import {Modal,Input,Button} from 'antd';
import FieldsWrapperModal from './FieldsWrapperModal';

import './FieldsModal.css'

const { TextArea } = Input;

const test = {
    canAggregate: true,
    canGroup: false,
    canOrder: true,
    canWhere: true,
    column: "m1",
    displayName: "M1, т",
    isFirstParent: false,
    isLeaf: true,
    isShown: true,
    name: "m1",
    parent: {
        name: "assd.history_values"},
    requiresQuoting: false,
    title: "M1, т",
    type: "numeric"
};

class CalculatedField extends Component {
    constructor(props){
        super(props);

        this.state = {
            ...props,
            fieldName: 'Вычисляемое поле',
            calField: '',
            param: {
                key: 1000,
                canAggregate: true,
                canGroup: false,
                canOrder: true,
                canWhere: true,
                column: "",
                displayName: "Вычисляемое поле",
                schemeName: "",
                isFirstParent: false,
                isLeaf: true,
                isShown: true,
                name: "",
                requiresQuoting: false,
                title: "",
                type: "numeric",
                parent: {
                    name: ""
                }
            }

        };


    }

    fieldNameHandler = (event) => {
        this.setState({ fieldName: event.target.value });
    }

    calculatedFieldHandler = (event) => {
        this.setState({ calField: event.target.value });
    }

    addNameTable = (record) => {
        this.setState({
            calField: this.state.calField + record.id,
            param: {
                ...this.state.param,
                canAggregate: record.canAggregate,
                canGroup: record.canGroup,
                canOrder: record.canOrder,
                canWhere: record.canWhere,
                type: record.type,
                schemeName: record.schemeName,
                parent: record.parent
            }
        })
    }

    collectParam = () => {
        const newField = {
            ...this.state.param,
            displayName: this.state.fieldName,
            column: this.state.calField,
            title: this.state.fieldName,
            name: this.state.calField
        };
        this.setState({
            calField: '',
            fieldName: 'Вычисляемое поле',
            param: {key: this.state.param.key + 1}
        })

        this.state.addField(newField);
        this.state.toggleModal();
    }

    defaultState = () => {
        this.setState({
            fieldName: 'Вычисляемое поле',
            calField: '',
            param: {
                key: this.state.param.key,
                canAggregate: true,
                canGroup: false,
                canOrder: true,
                canWhere: true,
                column: "",
                displayName: "Вычисляемое поле",
                schemeName: "",
                isFirstParent: false,
                isLeaf: true,
                isShown: true,
                name: "",
                requiresQuoting: false,
                title: "",
                type: "numeric",
                parent: {
                    name: ""
                }
            }
        })
        this.state.toggleModal();
    }

    modalButtonClickHandler = (e) => {
        this.setState({ calField: this.state.calField + e });
    }

    render() {
        return (
            <div className={"calcModal"}>
                <Modal
                    title="Создание вычисляемого поля"
                    visible={this.props.visible}
                    onOk={this.collectParam}
                    onCancel={this.defaultState}
                    maskClosable={false}
                >
                    <div>
                        <p>Наименование поля:</p>
                        <Input type="text" value={this.state.fieldName} onChange={this.fieldNameHandler} />
                        <p/>
                        <p/>
                        <div className="modal-editor-settings">
                            <FieldsWrapperModal addNameTable={this.addNameTable} title="Поля" />
                        </div>
                        <p/>
                        <div className={"modal-button"}>
                            <Button type="primary" onClick={this.modalButtonClickHandler.bind(this, "+")}>{'\u2795'}</Button>
                            <Button type="primary" onClick={this.modalButtonClickHandler.bind(this, "-")}>{'\u2796'}</Button>
                            <Button type="primary" onClick={this.modalButtonClickHandler.bind(this, "*")}>{'\u2716'}</Button>
                            <Button type="primary" onClick={this.modalButtonClickHandler.bind(this, "/")}>{'\u2797'}</Button>
                        </div>
                        <p/>
                        <TextArea rows={4} value={this.state.calField} onChange={this.calculatedFieldHandler} />
                    </div>
                </Modal>
            </div>
        );
    }
}

export default CalculatedField;
