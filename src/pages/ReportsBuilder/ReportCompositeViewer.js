import React from 'react';
import { PropTypes } from 'prop-types';
import classNames from 'classnames';
import connect from 'react-redux/es/connect/connect';

import { subsystemsSelector } from 'Selectors/ReportsBuilder';

import ReportViewer from './ReportViewer';
import ReportChartViewer from './ReportChartViewer';

import { getPreviewWithTotal } from './network';
import { formatDate } from './utils';

import { 
    parseFullColumnName,
    findViewsTable,
    generalOrderTypes,
    generalAggregationTypes,
    allCompareTypes
} from './Services/Editor';

import {
    prepareFilterForExecute,
    prepareSortingForExecute
} from './Services/Viewer';

import { settings } from '../../settings';

class ReportCompositeViewer extends React.Component {
    static propTypes = {
        reportData: PropTypes.any,
        viewsData: PropTypes.array
    }

    static orderTitle(type) {
        const orderRow = generalOrderTypes.find(item => item.type === type);
        return orderRow && orderRow.title;
    };

    static aggregationTitle(func) {
        const aggregationRow = generalAggregationTypes.find(item => item.type === func);
        return aggregationRow && aggregationRow.title;
    };

    static operatorTitle(func) {
        const operatorRow = allCompareTypes.find(item => item.type === func);
        return operatorRow && operatorRow.title;
    }

    static createFilterValue(value, type) {
        switch (type) {
            case 'date':
                return formatDate(value);
            default:
                return value;
        }
    }

    static buildTableReportData(reportData, viewsData) {
        if (viewsData && reportData && reportData.queryDescriptor) {
            const qd = reportData.queryDescriptor;
            const td = findViewsTable(viewsData, qd.table);
            if (!td || !td.children)
                return <this.Placeholder />;
            const fieldsData = qd.select.map(row => {
                const {column, table} = parseFullColumnName(row.column, qd.table);
                const td = findViewsTable(viewsData, table);
                const field = td.children.find(f => f.column === column);

                return {
                    id: column,
                    key: column,
                    type: field.type,
                    column,
                    table,
                    title: row.title,
                    sort: !!row.sortable,
                    filter: !!row.filterable
                }
            });

            qd.where =  qd.where || [];
            qd.orderBy = qd.orderBy || [];
            qd.groupBy = qd.groupBy || [];
            qd.aggregations = qd.aggregations || [];

            const filterData =  qd.where.map(row => {
                const {column, table} = parseFullColumnName(row.column, qd.table);
                const field = fieldsData.find(f => f.id === column);

                return {
                    id: row.column,
                    type: field.type,
                    column,
                    table,
                    title: row.title,
                    func: ReportCompositeViewer.operatorTitle(row.operator),
                    value: ReportCompositeViewer.createFilterValue(row.value, field.type)
                }
            });

            const sortData = qd.orderBy.map(row => {
                return {
                    ...parseFullColumnName(row.column, qd.table),
                    id: row.column,
                    title: row.title,
                    order: ReportCompositeViewer.orderTitle(row.order)
                }
            });

            const groupData = qd.groupBy.map(row => {
                return {
                    ...parseFullColumnName(row.column, qd.table),
                    id: row.column,
                    title: row.title,
                }
            });

            const totalData = qd.aggregations.map(row => {
                return {
                    ...parseFullColumnName(row.column, qd.table),
                    id: row.column,
                    title: row.title,
                    func: ReportCompositeViewer.aggregationTitle(row.function)
                }
            });

            return {
                fieldsData,
                filterData,
                sortData,
                groupData,
                totalData
            }
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const rebuildHandler = () => {
            setTimeout(() => {
                prevState.self.buildReportHandler();
            }, 0);
            return {
                rebuildPended: true,
                prevRebuildPending: nextProps.rebuildPending
            }
        };
        if (nextProps.reportData !== prevState.prevReportData) {
            if (nextProps.reportData && nextProps.reportData.type !== 'table') {
                return {
                    prevReportData: nextProps.reportData,
                    ...rebuildHandler()
                };
            } 

            return {
                chartData: undefined,
                rebuildPended: false,
                prevReportData: nextProps.reportData,
                ...ReportCompositeViewer.buildTableReportData(nextProps.reportData, nextProps.viewsData)
            }
        }

        if (nextProps.viewsData !== prevState.prevViewsData) {
            return {
                rebuildPended: false,
                prevViewsData: nextProps.viewsData,
                ...ReportCompositeViewer.buildTableReportData(nextProps.reportData, nextProps.viewsData)
            }
        }

        if (nextProps.rebuildPending !== prevState.prevRebuildPending) {
            return rebuildHandler();
        }
    
        return {};
    }

    constructor(props) {
        super(props);

        this.state = {
            prevRebuildPending: props.rebuildPending,
            rebuildPended: false,
            self: this,

            // Кэш табличного просмоторщика
            fieldsData: null,
            filterData: null,
            sortData: null,
            groupData: null,
            totalData: null
        };
    }

    loadReportPreviewData = (sorting, filtration, paginationCurrent, paginationRows, needPagination) => {
        if (!this.props.reportData.queryDescriptor.table) {
            this.setState({
                chartData: []
            })
            return Promise.resolve({data: [], total: {}});
        }

        const qd = {...this.props.reportData.queryDescriptor};
        qd.orderBy = sorting ? sorting.map(sort => ({
            column: this.buildFullColumnName(sort.table, sort.column),
            order: (sort.order === "По возрастанию" ? "ASC" : "DESC")
        })) : qd.orderBy;
        qd.where = filtration ? filtration.map(filter => ({
            column: this.buildFullColumnName(filter.table, filter.column),
            operator: filter.func ? allCompareTypes.find(type => type.title === filter.func).type : "=",
            value: ((filter.value === null || filter.value === undefined) ? 0 : filter.value)
        })) : qd.where;

        qd.orderBy = prepareSortingForExecute(qd.orderBy);
        qd.where = prepareFilterForExecute(this.props.viewsData, qd.where);

        return getPreviewWithTotal(qd).then(
            result => {
                const totalData = {};
                const headerTitles = result.data.headers.map(item => item.title);
                const headerColumns = result.data.headers.map(item => item.column);
                if (result.data.total) {
                    result.data.total.forEach((column) => {
                        const columnIndex = headerColumns.indexOf(column.column);
                        if (columnIndex >= 0)
                            totalData[headerTitles[columnIndex]] = column.value;
                    });
                }

                const reportData = {
                    data: (needPagination ? result.data.rows.slice((paginationCurrent - 1) * paginationRows, paginationCurrent * paginationRows) : result.data.rows).map((row) => {
                        const rowObject = {};

                        result.data.headers.forEach((c, i) => {
                            if (c.type === 'date')
                                rowObject[c.title] = formatDate(row[i]);
                            else
                                rowObject[c.title] = row[i];
                        });

                        return rowObject;
                    }),
                    total: {
                        count: result.data.rows.length, 
                        data: [totalData]
                    }
                }
                this.setState({
                    chartData: reportData.data
                })
                return reportData;
            }
        );
    }

    buildReportHandler = () => {
        if (this.props.reportData) {
            if (this.props.reportData.type && this.props.reportData.type !== 'table') {
                this.loadReportPreviewData(null, null, 0, 100, false);
            } else {
            }
        }
    }

    loadRowsConverter = (rows) => {
        if (!rows || rows.isAll) return [];
        return [
            typeof (rows.from) === 'number' ? rows.from : undefined,
            typeof (rows.to) === 'number' ? rows.to : undefined
        ];
    }

    findViewsTable = (tree, name) => {
        for (let node of tree) {
            if (node.isFirstParent) {
                if (node.title === name)
                    return node;
            } else {
                const resultNode = this.findViewsTable(node.children, name);
                if (resultNode) return resultNode;
            }
        }
    }

    buildFullColumnName = (table, column) => {
        return `${table}.${column}`;
    }

    parseFullColumnName = (column, defaultTable) => {
        const index = column.lastIndexOf('.');
        if (index === -1)
            return {
                column: column,
                table: defaultTable
            };
        
        return {
            table: column.substr(0, index),
            column: column.substr(index + 1)
        }
    }

    Placeholder = () => {
        const classes = classNames('rbu-viewer', {
            'no-data-placeholder': this.state.rebuildPended,
            'not-built-placeholder': !this.state.rebuildPended
        });

        const imagePath = this.state.rebuildPended ? settings.get().noDataImage : settings.get().notBuiltImage;

        return (
            <div className={classes} style={{
                display: 'flex', 
                flexGrow: 1,
                flexDirection: 'column', 
                overflow: 'hidden',
                backgroundImage: `url("${imagePath}")`
                }}>
                {!this.state.rebuildPended && <span>Задайте необходимые параметры и нажмите кнопку "Построить отчёт"</span>}
                {this.state.rebuildPended && <span>Отчёт не содержит данных</span>}
            </div>
        );
    }

    TableViewer = (props) => {
        return (
            <ReportViewer
                columns={this.state.fieldsData}
                grouping={this.state.groupData}
                filtering={this.state.filterData}
                sorting={this.state.sortData}
                aggregating={this.state.totalData}
                dataSource={this.loadReportPreviewData}
                serverProcessing={true}
                pagination={false}
                {...props}
            />
        )
    }

    ChartViewer = () => {
        if (this.props.reportData && this.props.reportData.description && this.state.chartData) {
            const cd = this.props.reportData.description;
            const qd = this.props.reportData.queryDescriptor;
            const td = this.findViewsTable(this.props.viewsData, qd.table);
            if (!td || !td.children || !cd.dataAxis.key)
                return <this.Placeholder />;

            const cn = qd.select.find(f => f.title === cd.dataAxis.key).column;
            const {column} = this.parseFullColumnName(cn, qd.table);
            const field = td.children.find(f => f.column === column);

            const dataAxisField = qd.select.find(item => item.title === cd.dataAxis.key) || {};
            const dataAxis = {
                dataKey: cd.dataAxis.key,
                dataType: field.type,
                dataTitle: dataAxisField.title
            };
            
            let keyCounter = 0;
            const valueAxis = cd.valueAxis.map(item => ({
                key: keyCounter++,
                dataKey: item.key,
                color: item.color,
                name: item.name,
                rows: this.loadRowsConverter(item.rows)
            }))

            return (
                <ReportChartViewer
                    type={this.props.reportData.type}
                    title={cd.names.chart}
                    data={this.state.chartData}
                    dataAxis={dataAxis}
                    valueAxis={valueAxis}
                    dataAxisName={cd.names.xAxis}
                    valueAxisName={cd.names.yAxis}
                    isLegendVisible={cd.general.showLegend}
                    isCalculatedXRange={cd.general.calculatedXRange}
                    isCalculatedYRange={cd.general.calculatedYRange}
                    isShowedDotValues={cd.general.showDotValues}
                />
            );
        }

        return <this.Placeholder />
    }

    Internal = () => {
        const { type } = this.props.reportData;
        const { viewsData } = this.props;
        return (
            <React.Fragment>
                {(!type || !viewsData) && <this.Placeholder />}
                {type === 'table' && <this.TableViewer />}
                {type && type !== 'table' && <this.ChartViewer />}
            </React.Fragment>
        );
    }

    render() {
        return (
            <React.Fragment>
                <div className="rbu-rl-filler" style={{color: 'black'}}>
                    <this.Internal />
                </div>
            </React.Fragment>
        )
    }
}


export default connect(state => ({
    viewsData: subsystemsSelector(state)
}), {})(ReportCompositeViewer);