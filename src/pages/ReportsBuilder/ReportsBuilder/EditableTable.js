import React from 'react';
import { PropTypes } from 'prop-types';
import classNames from 'classnames';

import { Table, Icon, Input, Select, Tooltip, Form, DatePicker } from 'antd';

import { AttachDragAndDrop, DraggableBodyRow } from 'Utils/DragAndDrop';

import moment from 'moment';

const FormItem = Form.Item;

const DraggableBodyRowSettings = DraggableBodyRow('row2');

const EditableContext = React.createContext();
const EditableRow = ({ form, sortable, moveRow, ...props }) => (
    <EditableContext.Provider value={form}>
        {sortable
            ? <DraggableBodyRowSettings moveRow={moveRow} {...props} />
            : <tr {...props}/>}
    </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

const TextEditor = React.forwardRef(({
    editorSource,
    forwardedRef,
    onSave,
    editorPopupStatusChange,
    ...rest}) => (
    <Input
        {...rest}
        ref={forwardedRef}
        onPressEnter={onSave}
        style={{width: '100%'}}
    />
));

const DatePickerEditor = ({
    editorSource,
    ref,
    value,
    onChange,
    onSave,
    editorPopupStatusChange,
    ...rest}) => {
    const dateFormat = 'DD.MM.YYYY';
    value = moment(value, dateFormat);
    if (!value.isValid())
        value = moment();

    const defaultValue = moment();
    editorPopupStatusChange(true);
    return (<DatePicker
        autoFocus={true}
        open={true}
        format={dateFormat}
        value={value}
        defaultValue={defaultValue}
        size="small"
        onOpenChange={editorPopupStatusChange}
        onChange={(e1, e2) => {
            onChange(e2);
            onSave();
        }}
        style={{width: '100%'}}
        {...rest}
    />);
};

const SelectEditor = ({
    editorSource,
    ref,
    onChange,
    onSave,
    editorPopupStatusChange,
    ...rest
}) => {
    if (typeof editorSource !== 'function') editorSource = () => [];
    editorPopupStatusChange(true);
    return (<Select
        autoFocus={true}
        open={true}
        size="small"
        onDropdownVisibleChange={editorPopupStatusChange}
        onChange={(e) => {
            onChange(e);
            onSave();
        }}
        style={{width: '100%'}}
        {...rest}
    >
    {editorSource().map(item => <Select.Option key={item} value={item}>{item}</Select.Option>)}
    </Select>);
}

const editors = {
    'string': TextEditor,
    'numeric': TextEditor,
    'date': DatePickerEditor,
    'select': SelectEditor
}

const Editor = React.forwardRef(({editor, editorSource, row, ...rest}) => {
    const Component = editors[typeof editor === 'function' ? editor(row) : editor];
    if (Component)
        return <Component editorSource={editorSource} {...rest} />;
    return <div>В реализации</div>;
});

class EditableCell extends React.Component {
    state = {
        editing: false,
    }

    isEditorPopupShowed = true;

    componentDidMount() {
        if (this.props.editor) {
            document.addEventListener('click', this.handleClickOutside, true);
        }
    }

    componentWillUnmount() {
        if (this.props.editor) {
            document.removeEventListener('click', this.handleClickOutside, true);
        }
    }

    toggleEdit = () => {
        const editing = !this.state.editing;

        this.isEditorPopupShowed = false;
        this.setState({ editing }, () => {
            if (editing && this.input) {
                this.input.focus();
            }
        });
    }

    handleClickOutside = (e) => {
        const { editing } = this.state;

        if (editing && !this.isEditorPopupShowed && this.cell !== e.target && !this.cell.contains(e.target)) {
            this.save();
        }
    }

    editorPopupStatusChange = (isShowed) => {
        this.isEditorPopupShowed = isShowed;
    }

    save = () => {
        const { dataIndex, record, handleSave } = this.props;
        this.form.validateFields((error, values) => {
            if (error) {
                return;
            }

            const newValue = values[dataIndex];

            this.toggleEdit();
            handleSave({ ...record, [dataIndex]: newValue});
        });
    }

    tooltipRender = (contentRender, tooltipData, children) => {
        if (!contentRender)
            return children;

        return <Tooltip title={contentRender(tooltipData)}>{children}</Tooltip>;
    }

    render() {
        const { editing } = this.state;
        const {
            editor,
            editorSource,
            dataIndex,
            title,
            tooltipContentRender,
            placeholder,
            record,
            index,
            handleSave,
            ...restProps
        } = this.props;

        const isEmpty = placeholder && (Array.isArray(restProps.children) && (typeof restProps.children[2] === 'undefined' || restProps.children[2] === ''));
        const cellClasses = classNames('rbu-be-editable-cell', {'rbu-be-editable-cell-placeholder': isEmpty});
        return (
            <td ref={node => (this.cell = node)} {...restProps}><div className="rbu-be-editable-cell-wrapper">
                {editor ? (
                    <EditableContext.Consumer>
                        {(form) => {
                            this.form = form;
                            return (
                                editing ? (
                                    <FormItem style={{ margin: 0 }}>
                                        {form.getFieldDecorator(dataIndex, {
                                            rules: [],
                                            initialValue: record[dataIndex],
                                        })
                                        (
                                            <Editor
                                                className="rbu-be-s-editor"
                                                row={record}
                                                editor={editor}
                                                editorSource={editorSource}
                                                forwardedRef={node => this.input = node}
                                                onSave={this.save}
                                                editorPopupStatusChange={this.editorPopupStatusChange}
                                            />
                                        )}
                                    </FormItem>
                                ) : (
                                    <div
                                        className={cellClasses}
                                        style={{ paddingRight: 24, minHeight: 18 }}
                                        onClick={this.toggleEdit}
                                    >
                                        {isEmpty ? placeholder : restProps.children}
                                    </div>
                                )
                            );
                        }}
                    </EditableContext.Consumer>
                ) : (
                    this.tooltipRender(tooltipContentRender, {table: record && record.table, value: record && record[dataIndex]}, 
                        <div className={cellClasses}>
                            {isEmpty ? placeholder : restProps.children}
                        </div>
                    )
                )}
            </div></td>
        );
    }
}

class EditableTable extends React.Component {
    static propTypes = {
        columns: PropTypes.array,
        dataSource: PropTypes.array,
        sortable: PropTypes.bool,
        onChange: PropTypes.func,
        onDelete: PropTypes.func,
        onOrderChange: PropTypes.func
    }

    handleDelete = (key) => {
        this.props.onDelete && this.props.onDelete(key);
    }

    handleSave = (row) => {
        this.props.onChange && this.props.onChange(row);
    }

    handleReorder = () => {
        this.props.onReorder && this.props.onReorder();
    }

    moveRow = (dragIndex, hoverIndex) => {
        const dataSource = [...this.props.dataSource];
        const dragRow = dataSource[dragIndex];
        dataSource.splice(dragIndex, 1);
        dataSource.splice(hoverIndex, 0, dragRow);
        this.props.onOrderChange && this.props.onOrderChange(dataSource.map(entry => entry.key));
    }

    render() {
        if (!this.props.columns) return <div></div>;

        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell,
            },
        };
        const columnWidth = (98 / this.props.columns.length) + '%';
        const columns = this.props.columns.map((col) => {
            if (!col.editor) {
                return {
                    ...col,
                    onCell: record => ({
                        record,
                        dataIndex: col.dataIndex,
                        tooltipContentRender: col.tooltip,
                        width: columnWidth
                    }),
                    onHeaderCell: column => ({
                        width: columnWidth
                    })
                };
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    editor: col.editor,
                    editorSource: col.editorSource,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    tooltipContentRender: col.tooltip,
                    placeholder: col.placeholder,
                    handleSave: this.handleSave,
                    width: columnWidth
                }),
                onHeaderCell: column => ({
                    width: columnWidth
                })
            };
        });
        columns.push({
            className: 'rbu-builder-action-column',
            actions: true,
            render: (text, record) => {
                return (
                    <Tooltip title="Удалить"><a href="javascript:;" onClick={() => this.handleDelete(record.key)}><Icon type="close" /></a></Tooltip>
                );
            },
            width: '2%'
        });
        return (
            <Table
                components={components}
                rowClassName={() => 'rbu-be-editable-row'}
                dataSource={this.props.dataSource}
                columns={columns}
                pagination={false}
                scroll={{ y: true }}
                onRow={(record, index) => ({
                    index,
                    sortable: this.props.sortable,
                    moveRow: this.moveRow
                })}
                locale={{emptyText: 'Нет данных'}}
            />
        );
    }
}

export default AttachDragAndDrop(EditableTable);