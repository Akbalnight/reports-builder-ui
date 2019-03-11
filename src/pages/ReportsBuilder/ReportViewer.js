import React from 'react';
import PropTypes from 'prop-types';

import ReactDataGrid from 'react-data-grid';
import { Data } from 'react-data-grid-addons';
import { Pagination, Spin } from 'antd';

import { ResponsibleContainer } from 'Components';

import {
    CellFormatter,
    ReportViewerHeader,
    NumerationColumn,
    Placeholder
} from './ReportViewer/Components';

import { numberRange } from './utils';

import './ReportViewer.css';

const Selectors = Data.Selectors;

class ReportViewer extends React.Component {
    constructor(props) {
        super(props);

        let state = {
            columns: [], 
            groupBy: props.grouping ? props.grouping.map(entry => entry.title) : [], 
            rows: [], 
            sortingFields: [], 
            filteringFields: [], 
            expandedRows: {}, 
            loading: false, 
            page: 1, 
            pageSize: 10, 
            self: this, 
            scrollTop: 0 
        };

        if (props.dataSource && props.dataSource.data) {
            state = { 
                ...state,
                rows: props.dataSource.data, 
            };
        }

        this.state = state;
    }

    getAllRows = () => {
        return Selectors.getRows(this.state);
    }

    getRows = () => {
        const rows = Selectors.getRows(this.state);
        return this.props.serverProcessing ? rows : rows.filter(row => {
            for (const fieldIndex in row) {
                const filterObject = this.state.filteringFields.find(filterField => fieldIndex === filterField.title);
                if (!filterObject) {
                    continue;
                } else {
                    switch (filterObject.operation) {
                        case "Содержит":
                            if (row[fieldIndex].toString().includes(filterObject.value.toString()))
                                return false;
                            break;
                        case "Не содержит":
                            if (!row[fieldIndex].toString().includes(filterObject.value.toString()))
                                return false;
                            break;
                        case "Равно":
                            if (row[fieldIndex].toString() !== filterObject.value.toString())
                                return false;
                            break;
                        case "Больше":
                            if (row[fieldIndex] <= filterObject.value)
                                return false;
                            break;
                        case "Меньше":
                            if (row[fieldIndex] >= filterObject.value)
                                return false;
                            break;
                        case "Меньше или равно":
                            if (row[fieldIndex] > filterObject.value)
                                return false;
                            break;
                        case "Больше или равно":
                            if (row[fieldIndex] < filterObject.value)
                                return false;
                            break;
                        default:
                            return false;
                    }
                }
            }
            return true;
        }).sort((a, b) => {
            for (const sort of this.state.sortingFields) {
                if (a[sort.title] === b[sort.title])
                    continue;
                if (a[sort.title] < b[sort.title])
                    return sort.ascOrder ? -1 : 1;
                else
                    return sort.ascOrder ? 1 : -1;
            }
            return 0;
        });
    };

    getRowAt = (index) => {
        return this.getRows()[index];
    };

    getAllSize = () => {
        return this.getAllRows().length;
    };

    getSize = () => {
        return this.getRows().length;
    };

    filterChange = (filterObject) => {
        if (filterObject.operation) {
            const newfilteringFields = [...this.state.filteringFields];
            const newFilterObject = newfilteringFields.find(filterField => filterObject.id === filterField.field);
            if (newFilterObject) {
                Object.assign(newFilterObject, filterObject);
            } else {
                newfilteringFields.push(filterObject);
            }
            this.setState({ filteringFields: newfilteringFields }, this.props.serverProcessing ? this.fetchData : null);
        } else {
            this.setState({
                filteringFields: this.state.filteringFields.filter(f => f.id !== filterObject.id)
            }, this.props.serverProcessing ? this.fetchData : null);
        }
    }

    sortToggle = (fieldObject) => {

        const newSortingFields = [...this.state.sortingFields];
        const sortingObject = newSortingFields.find(filterField => fieldObject.id === filterField.field);
        if (sortingObject) {
            sortingObject.ascOrder = !sortingObject.ascOrder;
            newSortingFields.splice(newSortingFields.indexOf(sortingObject), 1);
            newSortingFields.unshift(sortingObject);
        } else {
            newSortingFields.unshift({
                field: fieldObject.id,
                column: fieldObject.column,
                table: fieldObject.table,
                ascOrder: false,
                title: fieldObject.title
            });
        }
        this.setState({ sortingFields: newSortingFields }, this.props.serverProcessing ? this.fetchData : this.updateColumnsFromProps)

    }

    fetchBarrier = false;
    fetchData = () => {
        if (this.fetchBarrier) return;
        this.fetchBarrier = true;
        this.setState({ loading: true });

        let sorting = this.props.sorting;
        let filtering = this.props.filtering;

        if (this.props.serverProcessing) {
            sorting = [
                ...(this.state.sortingFields.map(entry => ({
                    id: entry.field,
                    column: entry.field,
                    table: entry.table,
                    order: entry.ascOrder ? "По возрастанию" : "По убыванию"
                }))), 
                ...this.props.sorting];

            const internalFiltersColumns = this.state.filteringFields.map(filter => filter.column);
            filtering = [
                ...(this.state.filteringFields
                    .map(entry => ({
                        id: entry.field,
                        column: entry.field,
                        table: entry.table,
                        func: entry.operation,
                        value: entry.value
                    }))), 
                ...this.props.filtering.filter(filter => !internalFiltersColumns.includes(filter.column))];
        }

        const clearBarrier = () => {
            this.fetchBarrier = false;
            ResponsibleContainer.trigger();
        };

        this.props.dataSource(sorting, filtering, this.state.page, this.state.pageSize, this.props.pagination)
            .then(data => {
                this.setState({
                    columns: this.state.newColumns,
                    rows: data.data,
                    groupBy: this.props.grouping.map(entry => entry.title),
                    expandedRows: {},
                    loading: false,
                    totalcount: data.total.count,
                    ...this.updateNumerationScroll(this.state.grid),
                    total: data.total.data,
                    isLoaded: true
                }, clearBarrier);
            })
            .catch(() => {
                this.setState({
                    columns: [],
                    rows: [],
                    groupBy: [],
                    expandedRows: {},
                    loading: false,
                    totalcount: 0,
                    //...this.updateNumerationScroll(this.state.grid),
                    total: [],
                    isLoaded: false
                }, clearBarrier);
            })
    }

    onRowExpandToggle = ({ columnGroupName, name, shouldExpand }) => {
        let expandedRows = Object.assign({}, this.state.expandedRows);
        expandedRows[columnGroupName] = Object.assign({}, expandedRows[columnGroupName]);
        expandedRows[columnGroupName][name] = { isExpanded: shouldExpand };
        this.setState({ expandedRows: expandedRows });
    };

    onPageChange = (page, pageSize) => {
        if (!this.props.dataSource.data) {
            this.setState({ loading: true })
            this.props.dataSource(this.props.sorting, this.props.filtering, page, 10, this.props.pagination).then(data => {
                this.setState({ rows: data.data, loading: false, totalcount: data.total.count, page: page, total: data.total.data, ...this.updateNumerationScroll(this.state.grid) })
            })
        }
        this.props.onPageChange(page, pageSize);
    }

    static updateColumnsFromPropsStatic(columns, state) {
        const newColumns = columns.map(column => {
            const ret = { ...column };
            const filterObject = state.filteringFields.find(entry => entry.field === column.id);
            const sortingObject = state.sortingFields.find(entry => entry.field === column.id);
            ret.filterValue = filterObject;
            ret.sortDirection = sortingObject;
            ret.name = column.title;
            ret.key = column.title;
            ret.sortable = column.sort;
            ret.filterable = column.filter;
            ret.formatter = <CellFormatter digitsAfterPoint={state.self.props.digitsAfterPoint} />;
            ret.headerRenderer = <ReportViewerHeader
                onFilterChange={state.self.filterChange}
                onSortToggle={state.self.sortToggle}
                sortDirection={sortingObject}
                column={ret} />
            return ret;
        })

        if (!state.self.props.dataSource.data)
            return {
                newColumns: newColumns,
                prevColumns: columns
            };
        else
            return {
                columns: newColumns,
                prevColumns: columns
            };
    }

    updateColumnsFromProps = () => {
        this.setState(ReportViewer.updateColumnsFromPropsStatic(this.props.columns, this.state));

    }

    updateNumerationScroll = (grid) => {
        if (grid && grid.state)
            return { scrollTop: this.grid.state.scrollOffset };
        else
            return { scrollTop: 0 }
    }

    updateNumerationScrollFromEvent = (e) => {
        if (!this.props.showRowNumbers)
            return;
        this.setState({ scrollTop: e.scrollTop });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let newState = {};
        let isStateChanged = false;

        if (nextProps.columns !== prevState.prevColumns) {
            if (nextProps.dataSource && nextProps.dataSource.data) {
                newState = {
                    ...newState,
                    rows: nextProps.dataSource.data,
                    groupBy: nextProps.grouping.map(entry => entry.title),
                    expandedRows: {}
                };
            }

            isStateChanged = true;
        }

        if (nextProps.grouping !== prevState.prevGrouping) {
            isStateChanged = true;
            newState = {
                ...newState,
                prevGrouping: nextProps.grouping
            }

            if (nextProps.dataSource && nextProps.dataSource.data) {
                newState = {
                    groupBy: nextProps.grouping.map(entry => entry.title)
                }
            }
        }

        if (nextProps.filtering !== prevState.prevFiltering) {
            isStateChanged = true;
            newState = {
                ...newState,
                prevFiltering: nextProps.filtering
            }
        }

        if (nextProps.sorting !== prevState.prevSorting) {
            isStateChanged = true;
            newState = {
                ...newState,
                prevSorting: nextProps.sorting
            }
        }

        if (nextProps.aggregating !== prevState.prevAggregating) {
            isStateChanged = true;
            newState = {
                ...newState,
                prevAggregating: nextProps.aggregating
            }
        }

        if (isStateChanged) {
            newState = {
                ...newState,
                ...ReportViewer.updateColumnsFromPropsStatic(nextProps.columns, prevState),
                fetched: false
            }

            setTimeout(() => prevState.self.fetchData(), 0);
        }

        return newState;
    }

    render() {
        if (this.state.columns.length === 0 || !this.state.isLoaded) {
            return <Placeholder fetched={this.state.fetched} />;
        }

        let totalRow = {};
        const isTotalRow = this.state.total && this.state.total[0] && Object.values(this.state.total[0]).some(entry => typeof entry !== 'undefined');
        if (isTotalRow) {
            totalRow = this.state.total[0];
            const firstColumn = this.state.columns[0];
            if (!totalRow[firstColumn.key])
                totalRow[firstColumn.key] = "Итого";
        }
        const totalHeight = isTotalRow ? 35 : 0;
        const startingRow = (this.state.page - 1) * 10 + 1;
        const rowNumbersStart = this.props.pagination ? startingRow : 1;
        const rowNumbersEnd = this.props.pagination ? (this.getSize() !== 10 ? startingRow + this.getSize() : startingRow + 10) : this.getSize() + 1;
        return (
            <div className="rbu-viewer">
                <Spin spinning={this.state.loading}>
                    <div className="rbu-viewer-layout">
                        {this.props.showRowNumbers && 
                            <div className="rbu-viewer-numbers">
                                <ResponsibleContainer>
                                    {(props) => (<NumerationColumn height={props.height-totalHeight} width={38} rowNumbersStart={rowNumbersStart} rowNumbersEnd={rowNumbersEnd} scrollTop={this.state.scrollTop} />)}
                                </ResponsibleContainer>
                            </div>
                        }
                        <div className="rbu-viewer-report">
                            <ResponsibleContainer>
                                {(props) => (
                                    <ReactDataGrid
                                        ref={node => this.grid = node}
                                        enableCellSelect={true}
                                        columns={this.state.columns}
                                        rowGetter={this.getRowAt}
                                        rowsCount={this.getSize()}
                                        onGridSort={() => { }}
                                        onScroll={this.updateNumerationScrollFromEvent}
                                        minHeight={props.height}
                                        minWidth={props.width}
                                        onRowExpandToggle={this.onRowExpandToggle}
                                    />
                                )}
                            </ResponsibleContainer>
                            {isTotalRow && 
                                <div className="rbu-viewer-total">
                                    <ResponsibleContainer>
                                        {(props) => (
                                            <ReactDataGrid
                                                enableCellSelect={false}
                                                enableRowSelect={false}
                                                columns={this.state.columns}
                                                rowGetter={() => totalRow}
                                                rowsCount={1}
                                                minHeight={70}
                                                minWidth={props.width}
                                            />
                                        )}
                                    </ResponsibleContainer>
                                </div>
                            }
                        </div>
                    </div>
                    {this.props.pagination && <Pagination defaultCurrent={this.state.page} total={this.state.totalcount} onChange={this.onPageChange} />}
                </Spin>
            </div>
        );
    }
}


export default ReportViewer
ReportViewer.propTypes = {
    dataSource: PropTypes.oneOfType([
        PropTypes.shape({
            data: PropTypes.arrayOf(
                PropTypes.shape({
                    key: PropTypes.string.isRequired
                })),
            total: PropTypes.shape({ total: PropTypes.Number })
        }),
        PropTypes.func]),
    columns: PropTypes.array,
    sorting: PropTypes.array,
    filtering: PropTypes.array,
    grouping: PropTypes.array,
    pagination: PropTypes.bool,
    serverProcessing: PropTypes.bool,
    digitsAfterPoint: numberRange(0, 15),
    width: PropTypes.number,
    height: PropTypes.number,
    onSortChange: PropTypes.func,
    onFilterChange: PropTypes.func,
    onPageChange: PropTypes.func
};


ReportViewer.defaultProps = {
    dataSource: function (sorting, filtration, paginationCurrent, paginationRows) {
        return new Promise((resolve, reject) => {
            const totalFakeRows = 100;
            const fakeRowsIndexStart = paginationRows * paginationCurrent - paginationRows;
            const ret = { data: [], total: { count: totalFakeRows } };
            for (let i = 0; i < paginationRows; i++) {
                const key = (fakeRowsIndexStart + i).toString()
                ret.data.push({ key: key, title: key, meaning: "Число " + key, sign: "+" })
            }
            setTimeout(() => resolve(ret), 2000);
        })
    },
    columns: [{
        key: 'title',
        name: 'название',
        width: 120
    },
    {
        key: 'meaning',
        name: 'значение',
        width: 120
    },
    {
        key: 'sign',
        name: 'знак',
        width: 120
    }],
    sorting: [{ field: "title", order: false }],
    filtering: [{ field: "title", operation: "equals", value: "Один" }],
    grouping: [{ key: 'sign', name: 'Знак' }, { key: 'title', name: 'Название' }],
    pagination: false,
    serverProcessing: true,
    showRowNumbers: true,
    digitsAfterPoint: 2,
    onFilterChange: function () { console.log("Callback function onFilterChange was not defined; args:", arguments); },
    onPageChange: function () { console.log("Callback function onPageChange was not defined; args:", arguments); }
};
