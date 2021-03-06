import React from 'react';
import { PropTypes } from 'prop-types';
import classNames from 'classnames';
import connect from 'react-redux/es/connect/connect';
import {Spin} from "antd";

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
    allCompareTypes,
    findTableAndColumn
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
        return value;
    }

    static buildTableReportData(reportData, viewsData) {
        if (viewsData && reportData && reportData.queryDescriptor) {
            const qd = reportData.queryDescriptor;
            if (!qd || !qd.select)
                return <this.Placeholder />;
            const fieldsData = qd.select.map(row => {
                let {column, table} = parseFullColumnName(row.column);
                let td;
                let field;

                try {
                    td = findViewsTable(viewsData, table).children;
                    field = td.find(f => f.column === column);
                } catch (e) {
                    let arr = table.split('.');
                    const tableNew = arr[0]+'.'+arr[arr.length-1];
                    td = findViewsTable(viewsData, tableNew).children;
                    field = td.find(f => f.column === column);
                    column = table+'.'+column;
                    console.log(column);
                }

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
                const {column, table} = parseFullColumnName(row.column);
                const field = fieldsData.find(f => f.id === column);

                return {
                    id: row.column,
                    type: field.type,
                    column,
                    table,
                    title: row.title,
                    func: ReportCompositeViewer.operatorTitle(row.operator),
                    value: ReportCompositeViewer.createFilterValue(row.value, field.type),
                    value2: ReportCompositeViewer.createFilterValue(row.value2, field.type)
                }
            });

            const sortData = qd.orderBy.map(row => {
                return {
                    ...parseFullColumnName(row.column),
                    id: row.column,
                    title: row.title,
                    order: ReportCompositeViewer.orderTitle(row.order)
                }
            });

            const groupData = qd.groupBy.map(row => {
                return {
                    ...parseFullColumnName(row.column),
                    id: row.column,
                    title: row.title,
                }
            });

            const totalData = qd.aggregations.map(row => {
                return {
                    ...parseFullColumnName(row.column),
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
                    chartData: undefined,
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
            loading: false,

            // ?????? ???????????????????? ??????????????????????????
            fieldsData: null,
            filterData: null,
            sortData: null,
            groupData: null,
            totalData: null
        };
    }

    loadReportPreviewData = (sorting, filtration, paginationCurrent, paginationRows, needPagination, limit, offset) => {
        if (!this.props.reportData.queryDescriptor.select || !this.props.reportData.queryDescriptor.select.length) {
            this.setState({
                chartData: []
            })
            return Promise.resolve({data: [], total: {}});
        }
        this.setState({
            loading: true
        });

        // const qd = {...this.props.reportData.queryDescriptor};
        const qd = Object.assign({}, this.props.reportData.queryDescriptor);

        qd.orderBy = sorting ? sorting.map(sort => ({
            column: this.buildFullColumnName(sort.table, sort.column),
            order: (sort.order === "???? ??????????????????????" ? "ASC" : "DESC")
        })) : qd.orderBy;
        qd.where = filtration ? filtration.map(filter => ({
            column: this.buildFullColumnName(filter.table, filter.column),
            operator: filter.func ? allCompareTypes.find(type => type.title === filter.func).type : "=",
            value: ((filter.value === null || filter.value === undefined) ? 0 : filter.value),
            value2: ((filter.value2 === null || filter.value2 === undefined) ? 0 : filter.value2)
        })) : qd.where;

        qd.orderBy = prepareSortingForExecute(qd.orderBy);
        qd.where = prepareFilterForExecute(this.props.viewsData, qd.where);

        qd.limit = limit;
        qd.offset = offset;

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
                    loading: false,
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

    buildFullColumnName = (table, column) => {
        return `${table}.${column}`;
    }

    Placeholder = () => {
        const classes = classNames('rbu-viewer', {
            'no-data-placeholder': this.state.rebuildPended,
            'not-built-placeholder': !this.state.rebuildPended
        });

        const imagePath = this.state.rebuildPended ? settings.get().noDataImage : settings.get().notBuiltImage;

        return (
            <Spin spinning={this.state.loading}>
                <div className={classes} style={{
                    display: 'flex',
                    flexGrow: 1,
                    flexDirection: 'column',
                    overflow: 'hidden',
                    backgroundImage: `url("${imagePath}")`
                    }}>
                    {!this.state.rebuildPended && <span>?????????????? ?????????????????????? ?????????????????? ?? ?????????????? ???????????? "?????????????????? ??????????"</span>}
                    {this.state.rebuildPended && <span>?????????? ???? ???????????????? ????????????</span>}
                </div>
            </Spin>
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
                limit50={this.props.reportData.limit50}
                {...props}
            />
        )
    }

    ChartViewer = () => {
        if (this.props.reportData && this.props.reportData.description && this.state.chartData) {
            const cd = this.props.reportData.description;
            const qd = this.props.reportData.queryDescriptor;

            const dataAxisDescription = qd.select.find(f => f.title === cd.dataAxis.key);

            if (!dataAxisDescription)
                return <this.Placeholder />;

            const dataRowDescription = findTableAndColumn(this.props.viewsData, dataAxisDescription.column);
            if (!dataRowDescription)
                return <this.Placeholder />;

            const dataAxisField = qd.select.find(item => item.title === cd.dataAxis.key) || {};
            const dataAxis = {
                dataKey: cd.dataAxis.key,
                dataType: dataRowDescription.field.type,
                dataTitle: dataAxisField.title
            };

            let keyCounter = 0;
            const valueAxis = cd.valueAxis.map(item => ({
                chartType: item.type,
                key: keyCounter++,
                dataAxisKey: item.dataKey,
                dataKey: item.key,
                color: this.props.reportData.type === 'cascade' ? item.colorPositive : item.color,
                colorNegative: item.colorNegative,
                colorInitial: item.colorInitial,
                colorTotal: item.colorTotal,
                name: item.name,
                rows: this.loadRowsConverter(item.rows)
            }));

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
