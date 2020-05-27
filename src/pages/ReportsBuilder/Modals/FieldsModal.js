import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Table, Tooltip } from 'antd';

import classNames from 'classnames';
import { AttachDragAndDrop, DraggableBodyRow } from 'Utils/DragAndDrop';

// import './FieldsModal.css'

class EditableCell extends React.Component {
    state = {
        value: this.props.value,
        editable: false
    }
    handleChange = (e) => {
        const value = e.target.value;
        this.setState({ value });
    }
    check = () => {
        this.setState({ editable: false });
        if (this.props.onChange) {
            this.props.onChange(this.state.value);
        }
    }
    edit = () => {
        this.setState({ editable: true });
    }
    render() {
        const { value } = this.state;
        const { table } = this.props;
        const classes = classNames({"rbu-fe-editable-cell": true, "rbu-fe-editable-cell-grey": !this.props.canMove})
        return (
            <div className={classes}>
                {
                        <div className="cell-text-wrapper">
                            <Tooltip title={<div className="rbu-fe-editable-cell-text-tooltip">
                                <div><label>Таблица</label><span>{table}</span></div>
                                <div><label>Поле</label><span>{value}</span></div>
                            </div>}>{value || ' '}</Tooltip>
                        </div>
                }
            </div>
        );
    }
}

class ReportsBuilderFields extends React.Component {

    constructor(props) {
        super(props);
        this.columns = [{
            title: 'Выбор полей доступных для вычисления:',
            dataIndex: 'title',
            render: (text, record) => (
                <EditableCell
                    value={(text == null ? record.key : text)}
                    table={record.table}
                    canMove={this.canMove(record)}
                    onChange={this.onCellChange(record.key, 'title')}
                    onInputMouseOver={this.onInputMouseOver}
                    onInputMouseOut={this.onInputMouseOut}
                />
            ),
        }];
    }

    onCellChange = (key, dataIndex) => {
        return (value) => {
            let newEntry;
            this.props.dataSource.forEach(entry => {
                if (entry.key === key) {
                    newEntry = { ...entry };
                    if (dataIndex === "sort" || dataIndex === "filter") {
                        newEntry[dataIndex] = !newEntry[dataIndex];
                    } else {
                        newEntry[dataIndex] = value;
                    }
                }
            });
            this.props.onRowChanged && this.props.onRowChanged(newEntry);
        }
    };
    moveRow = (dragIndex, hoverIndex) => {
        const dataSource = [...this.props.dataSource];
        const dragRow = dataSource[dragIndex];
        dataSource.splice(dragIndex, 1);
        dataSource.splice(hoverIndex, 0, dragRow);
        this.props.onOrderChange && this.props.onOrderChange(dataSource.map(entry => entry.key));
    }

    components = {
        body: {
            row: DraggableBodyRow('row')
        },
    }
    canMove = (row) => {
        return this.props.canMove
            ? this.props.canMove(row)
            : true;
    }
    onInputMouseOver = (e) => {
      let el = e.target.parentElement;
      while(el && el.nodeName !== "TR") {
        el = el.parentElement;
      }
      this.setState({dragDisabledAt:el.rowIndex});
    }
    onInputMouseOut = (e) => {
      this.setState({dragDisabledAt:-1});
    }

    render() {
        const dataSource = this.props.dataSource.filter(item => item.type === 'numeric');
        const columns = this.columns;
        const components = this.components;

        return (
            <Table dataSource={dataSource} columns={columns} pagination={false} bordered onRow={(record, index) => ({
                index,
                // disableDragAt : this.state && this.state.dragDisabledAt,
                // moveRow: this.moveRow.bind(this),
                onDoubleClick: () => this.props.addNameTable(record)
            })}
                locale={{emptyText: 'Нет данных'}}
            />
        );
    }
}

ReportsBuilderFields.propTypes = {
    dataSource: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ]).isRequired,
            table: PropTypes.string,
            title: PropTypes.string,
            filter: PropTypes.boolean,
            sort: PropTypes.boolean
        })
    ),
    canMove: PropTypes.func,
    onRowChanged: PropTypes.func,
    onOrderChange: PropTypes.func,
    onDoubleClick: PropTypes.func,
    onDelete: PropTypes.func
};
ReportsBuilderFields.defaultProps = {
};

export default AttachDragAndDrop(ReportsBuilderFields)
