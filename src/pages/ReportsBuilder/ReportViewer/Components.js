import React, { Component } from 'react';
import classNames from 'classnames';

import { Button, Icon, Popover, Input, Select } from 'antd';

import { settings } from 'Settings';

import { allCompareTypes, generalCompareTypes } from '../Services/Editor';

const Option = Select.Option;

class CellFormatter extends Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.value !== this.props.value;
    }

    render() {
        switch (typeof this.props.value) {
            case "number":
                return <div title={this.props.value}>{this.props.value.toFixed(this.props.digitsAfterPoint)}</div>;
            default:
                return <div title={this.props.value}>{this.props.value}</div>;
        }
    }
}

class FilterContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            operation: props.operation,
        }
    }

    valueHandler = (event) => {
        this.setState({ value: event.target.value });
        this.props.onValueChange(event.target.value);
    }

    operationHandler = (event) => {
        this.setState({ operation: event });
        this.props.onOperationChange(event);
    }

    render() {
        const operators = this.props.type === 'string'
            ? allCompareTypes
            : generalCompareTypes;

        return (
            <div className="rbu-viewer-filter-popover-content">
                <div>
                    <Select
                        size="small"
                        defaultValue={this.state.operation}
                        dropdownMatchSelectWidth={false}
                        onChange={this.operationHandler}
                    >
                        {operators.map(item => <Option value={item.title}>{item.title}</Option>)}
                    </Select>
                    <Input type="text" value={this.state.value} onChange={this.valueHandler} />
                </div>
                <div>
                    <Button size="small" onClick={this.props.onSave}>Сохранить</Button>
                    <Button size="small" onClick={this.props.onClear}>Очистить</Button>
                </div>
            </div>
        );
    }
}

class FilterPopover extends Component {
    state = {
        visible: false,
        isLoaded: false
    };

    value = '';
    operation = null;

    constructor(props) {
        super(props);
        this.value = props.value;
        this.operation = props.operation;
    }

    hide = () => {
        this.setState({
            visible: false,
        });
    }

    save = () => {
        this.props.onSave(this.value, this.operation);
        this.hide();
    }

    clear = () => {
        this.props.onClear();
        this.hide();
    }

    handleVisibleChange = (visible) => {
        this.setState({ visible });
    }

    valueHandler = (value) => {
        this.value = value;
    }

    operationHandler = (operation) => {
        this.operation = operation;
    }

    render() {
        return (
            <Popover
                content={
                    <FilterContent
                        value={this.value}
                        operation={this.operation}
                        type={this.props.type}
                        onValueChange={this.valueHandler}
                        onOperationChange={this.operationHandler}
                        onSave={this.save}
                        onClear={this.clear}
                    />}
                title="Фильтр"
                trigger="click"
                visible={this.state.visible}
                onVisibleChange={this.handleVisibleChange}
            >
                <div className="rbu-viewer-header-button">
                    <Icon
                        type="filter"
                    />
                </div>
            </Popover>
        );
    }
}

const ReportViewerHeader = ({
    column, 
    onFilterChange, 
    onSortToggle
}) => (
    <div className="rbu-viewer-header">
        <span>
            {column.name}
        </span>
        <div>
            {column.filterable && <FilterPopover
                onSave={(value, operation) => onFilterChange({
                    id: column.id,
                    column: column.column,
                    table: column.table,
                    field: column.id,
                    title: column.title,
                    type: column.type,
                    value: value,
                    operation: operation
                })}
                onClear={() => onFilterChange({ id: column.id })}
                value={column.filterValue ? column.filterValue.value : ""}
                operation={column.filterValue && column.filterValue.operation ? column.filterValue.operation : "Равно"}
                type={column.type}
            />}
            {column.sortable && <div
                className="rbu-viewer-header-button"
                onClick={() => onSortToggle({
                    id: column.id,
                    column: column.column,
                    table: column.table,
                    title: column.title
                })}>
                <Icon type={column.sortDirection && column.sortDirection.ascOrder ? 'sort-ascending' : 'sort-descending'} />
            </div>}
        </div>
    </div>
)

const getNumbers = (rowNumbersStart, rowNumbersEnd) => {
    const ret = [];
    for (let i = rowNumbersStart; i < rowNumbersEnd; i++) {
        ret.push(<div className="react-grid-HeaderCell" style={{ height: '35px' }} key={i}><span>{i}</span></div>)
    }
    return ret;
}

const NumerationColumn = ({
    rowNumbersStart, 
    rowNumbersEnd,
    height,
    width,
    scrollTop
}) => {
    const numbers = getNumbers(rowNumbersStart, rowNumbersEnd);
    return (
        <div style={{ height: height, width: width, overflow: 'hidden' }}>
            <div className="react-grid-HeaderCell" style={{ display: 'fixed', top: 0, left: 0, height: '36px', border: '1px solid #ddd', borderRight: 'none' }}>
                <span>№</span>
            </div>
            <div style={{ overflow: 'hidden' }}>
                <div style={{ marginTop: -1 * scrollTop }}>
                    {numbers}
                </div>
            </div>
        </div>
    )
}

const Placeholder = ({fetched}) => {
    const classes = classNames('rbu-viewer', {
        'no-data-placeholder': fetched,
        'not-built-placeholder': !fetched
    });

    const imagePath = fetched ? settings.get().noDataImage : settings.get().notBuiltImage;

    return (
        <div className={classes} style={{ 
            display: 'flex', 
            flexGrow: 1, 
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundImage: `url("${imagePath}")` }}>
            {!fetched && <span>Задайте необходимые параметры и нажмите кнопку "Построить отчёт"</span>}
            {fetched && <span>Отчёт не содержит данных</span>}
        </div>
    );
}

export {
    CellFormatter,
    ReportViewerHeader,
    NumerationColumn,
    Placeholder
}