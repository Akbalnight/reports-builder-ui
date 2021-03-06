import React, { Component } from 'react';
import classNames from 'classnames';

import { Button, Icon, Popover, Input, Select, Spin } from 'antd';

import { settings } from 'Settings';

import { allCompareTypes, generalCompareTypes } from '../Services/Editor';

const Option = Select.Option;

class CellFormatter extends Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.value !== this.props.value;
    }

    render() {
        const value = this.props.value;
        const type = typeof value;
        if (type === "number")
            return <div title={value}>{value.toFixed(this.props.digitsAfterPoint)}</div>;

        if (type === "undefined" || value === null)
            return <div title="–">–</div>;

        return <div title={value}>{value}</div>;
    }
}

class FilterContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            value2: props.value2,
            operation: props.operation,
            prevValue: props.value,
            prevOperation: props.operation
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let newState = {};

        if (nextProps.value !== prevState.prevValue) {
            newState = {
                value: nextProps.value,
                prevValue: nextProps.value
            }
        }
        if (nextProps.operation !== prevState.prevOperation) {
            newState = {
                operation: nextProps.operation,
                prevOperation: nextProps.operation
            }
        }

        return newState;
    }

    valueHandler = (event) => {
        this.setState({ value: event.target.value });
        this.props.onValueChange(event.target.value);
    }

    valueHandler2 = (event) => {
        this.setState({ value2: event.target.value });
        this.props.onValueChange2(event.target.value);
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
                    <Input type="text" value={this.state.value2} onChange={this.valueHandler2} hidden={!(this.state.operation === 'Между'||this.state.operation === 'Не между')}  />
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
    value = '';
    value2 = '';
    operation = null;

    constructor(props) {
        super(props);
        this.value = props.value;
        this.value2 = props.value2;
        this.operation = props.operation;
        this.state = {
            self: this,
            visible: false,
            isLoaded: false
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let newState = {};

        if (nextProps.value !== prevState.prevValue) {
            prevState.self.value = nextProps.value;

            newState = {
                ...newState,
                prevValue: nextProps.value
            }
        }
        if (nextProps.operation !== prevState.prevOperation) {
            prevState.self.operation = nextProps.operation;

            newState = {
                ...newState,
                prevOperation: nextProps.operation
            }
        }

        return newState;
    }

    hide = () => {
        this.setState({
            visible: false,
        });
    }

    save = () => {
        this.props.onSave(this.value, this.value2, this.operation);
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

    valueHandler2 = (value) => {
        this.value2 = value;
    }

    operationHandler = (operation) => {
        this.operation = operation;
    }

    render() {
        const isSet = this.value && this.operation;
        const theme = isSet ? {
            theme: 'twoTone'
        } : {};
        return (
            <Popover
                content={
                    <FilterContent
                        value={this.value}
                        value2={this.value2}
                        operation={this.operation}
                        type={this.props.type}
                        onValueChange={this.valueHandler}
                        onValueChange2={this.valueHandler2}
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
                        {...theme}
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
                onSave={(value, value2, operation) => onFilterChange({
                    id: column.id,
                    column: column.column,
                    table: column.table,
                    field: column.id,
                    title: column.title,
                    type: column.type,
                    value: value,
                    value2: value2,
                    operation: operation
                })}
                onClear={() => onFilterChange({ id: column.id })}
                value={column.filterValue ? column.filterValue.value : ""}
                value2={column.filterValue ? column.filterValue.value2 : ""}
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

const Placeholder = ({fetched, loading}) => {
    const classes = classNames('rbu-viewer', {
        'no-data-placeholder': fetched,
        'not-built-placeholder': !fetched
    });

    const imagePath = fetched ? settings.get().noDataImage : settings.get().notBuiltImage;

    return (
        <Spin spinning={loading}>
            <div className={classes} style={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column',
                overflow: 'hidden',
                backgroundImage: `url("${imagePath}")` }}>
                {!fetched && <span>Задайте необходимые параметры и нажмите кнопку "Построить отчёт"</span>}
                {fetched && <span>Отчёт не содержит данных</span>}
            </div>
        </Spin>
    );
}

export {
    CellFormatter,
    ReportViewerHeader,
    NumerationColumn,
    Placeholder
}
