import React, { Fragment, Component } from 'react';
import { PropTypes } from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import * as types from 'Constants/ReportTypes'

import { message, Input, Button, Popconfirm, Menu, Icon, Dropdown, Spin, Tooltip } from 'antd';

import ReportCompositeViewer from '../ReportCompositeViewer';

// import {
//     requestReportsList,
//     requestReportRemove,
//     requestReportUpdate,
//     requestSubsystems
// } from 'Actions/ReportActions';

import { getCurrentChartIconSafe } from '../Services/Editor.js';

import { settings } from 'Settings';

import './ReportsList.css';

const getUrlPrefix = () => settings.get().apiPrefix + settings.get().reportApiPrefix;

const Search = Input.Search;
const SubMenu = Menu.SubMenu;
const rootSubmenuKeys = ['favorites', 'private', 'public'];

class ReportsList extends Component {
    static propTypes = {
        reportsList: PropTypes.arrayOf(PropTypes.shape({
            key: PropTypes.number,
            name: PropTypes.string
        })),
        openTab: PropTypes.func,
        requestReportsList: PropTypes.func,
        requestReportRemove: PropTypes.func,
        requestReportUpdate: PropTypes.func,
        requestSubsystems: PropTypes.func
    };

    state = {
        openKeys: ['private'],
        selectedKey: undefined,
        filter: ''
    };

    constructor(props) {
        super(props);
        this.props.requestReportsList();
        this.props.requestSubsystems();
    }

    editReportHandler = (record) => {
        this.props.onReportEdit('report-builder', {
            id: record.id,
            title: record.title
        });
    }

    removeReportHandler = (key) => {
        this.setState({selectedKey: undefined});
        this.props.requestReportRemove(key);
    }

    openTypeSelector = () => {
        this.props.onReportEdit('report-builder');
    }

    onOpenChange = (openKeys) => {
        const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1);
        if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
            this.setState({ openKeys });
        } else {
            this.setState({
            openKeys: latestOpenKey ? [latestOpenKey] : [],
            });
        }
    }

    onSelectMenuItem = ({key}) => {
        this.setState({selectedKey: key})
    }

    favoriteHandler = (record) => {
        let reportToModify = this.props.reportsList.find(report => report.id === record.id);
        reportToModify.isFavorite = !reportToModify.isFavorite;
        this.props.requestReportUpdate(reportToModify);
    }

    onPrintClick = () => {
        if (!this.state.selectedKey) {
            message.error('Сначала выберите отчёт из списка');
            return;
        }
        message.error('Данная функция находится в разработке');
    }

    onExportPress = (format, selectedReport) => {
        const {selectedKey} = this.state;
        const {doExport} = settings.get();

        if (typeof doExport === 'function') {
            doExport(selectedKey, format, selectedReport.name)
        }
    };

    onSearchHandle = (e) => {
        this.setState({filter: e.target.value})
    }

    StarOutline = () => (
        <svg style={{width:16,height:16}} viewBox="0 0 24 24">
            <path fill="rgba(0, 0, 0, 0.65)" d="M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z" />
        </svg>
    )

    Star = () => (
        <svg style={{width:16,height:16}} viewBox="0 0 24 24">
            <path fill="#E8874D" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
        </svg>
    )

    MenuItemView = ({report}) => {
        const icon = getCurrentChartIconSafe(report.type);
        const favoriteProps = {
            component: report.isFavorite ? this.Star : this.StarOutline
        };
        return (
            <Fragment>
                <Icon type={icon.icon} className={icon.className} />
                <div className="rbu-rl-body-menu-item-text">
                    {report.title}
                </div>
                <Tooltip title="Избранное">
                    <Button className="rbu-rl-menu-item-button rbu-rl-menu-item-button-custom" size="small" onClick={() => this.favoriteHandler(report)}>
                        <Icon {...favoriteProps} />
                    </Button>
                </Tooltip>
                <Tooltip title="Редактировать">
                    <Button className="rbu-rl-menu-item-button" size="small" icon="edit" onClick={() => this.editReportHandler(report)} />
                </Tooltip>
                <Popconfirm onConfirm={() => this.removeReportHandler(report.id)} title="Вы действительно хотите удалить отчёт? Восстановить будет невозможно" okText="Да" cancelText="Отмена">
                    <Tooltip title="Удалить">
                        <Button className="rbu-rl-menu-item-button" size="small" icon="delete" />
                    </Tooltip>
                </Popconfirm>
            </Fragment>
        )
    }

    render() {
        const { reportsList, isLoading } = this.props;
        const { selectedKey, filter } = this.state;
        const filteredReportsList = reportsList ? reportsList.filter(report => report.title.toLowerCase().includes(filter.toLowerCase())) : []
        const selectedReport = reportsList && reportsList.find(report => report.id == selectedKey) || {};

        const openKeys = filter
            ? ['favorites', 'private', 'public']
            : this.state.openKeys;

        return (
            <div className="rbu-rl-root">
                <div className="rbu-rl-header">
                    <Search
                        placeholder="Введите поисковый запрос"
                        className="rbu-rl-header-search"
                        onChange={this.onSearchHandle}
                    />
                    <div className="rbu-rl-filler"></div>
                    <Button size="small" icon="bar-chart" onClick={this.openTypeSelector}>Новый отчёт</Button>
                    <Dropdown
                        trigger={['click']}
                        overlay={(
                            <Menu>
                                <Menu.Item key='pdf'>
                                    <Button
                                        className="rbu-rl-menu-item-button item-export" size="small"
                                        onClick={() => this.onExportPress('PDF', selectedReport)}
                                    >
                                        <Icon type="file-pdf" />
                                        PDF
                                    </Button>
                                </Menu.Item>
                                <Menu.Item key='excel'>
                                    <Button
                                        className="rbu-rl-menu-item-button item-export" size="small"
                                        onClick={() => this.onExportPress('XLSX', selectedReport)}
                                    >
                                        <Icon type="file-excel" />
                                        Excel
                                    </Button>
                                </Menu.Item>
                            </Menu>
                        )}
                        disabled={!selectedKey}
                    >
                        <Button size="small" icon="export" disabled={!selectedKey}>Экспорт</Button>
                    </Dropdown>
                    <Button size="small" icon="printer" onClick={this.onPrintClick} disabled={!selectedKey}>Печать</Button>
                </div>
                <div className="rbu-rl-body">
                    <div className="rbu-rl-body-menu">
                        <Spin spinning={isLoading} >
                            <Menu
                                openKeys={openKeys}
                                onOpenChange={this.onOpenChange}
                                onSelect={this.onSelectMenuItem}
                                mode="inline"
                            >
                                <SubMenu key='favorites' title={<b>Избранные</b>}>
                                    {filteredReportsList.length > 0 && filteredReportsList.filter(item => item.isFavorite).map(report =>
                                        <Menu.Item key={report.id} className="rbu-rl-body-menu-item">
                                            <this.MenuItemView
                                                report={report}
                                            />
                                        </Menu.Item>)
                                    }
                                </SubMenu>
                                <SubMenu key='private' title={<b>Личные отчёты</b>}>
                                    {filteredReportsList.length > 0 && filteredReportsList.filter(item => !item.isPublic).map(report =>
                                        <Menu.Item key={report.id} className="rbu-rl-body-menu-item">
                                            <this.MenuItemView
                                                report={report}
                                            />
                                        </Menu.Item>)
                                    }
                                </SubMenu>
                                <SubMenu key='public' title={<b>Публичные отчёты</b>}>
                                    {filteredReportsList.length > 0 && filteredReportsList.filter(item => item.isPublic).map(report =>
                                        <Menu.Item key={report.id} className="rbu-rl-body-menu-item">
                                            <this.MenuItemView
                                                report={report}
                                            />
                                        </Menu.Item>)
                                    }
                                </SubMenu>
                            </Menu>
                        </Spin>
                    </div>
                    <div className="rbu-rl-body-content" style={{color: 'black'}}>
                        <ReportCompositeViewer
                            reportData={selectedReport}
                            showBuildButton={false} />
                    </div>
                </div>
            </div>
        );
    }
};

const mapStateToProps = (store) => ({
    reportsList: store.reportsList.list,
    isLoading: store.reportsList.isLoading,
    isError: store.reportsList.isError
});

const mapDispatchToProps = dispatch => {
    return {
        requestReportsList: () => dispatch({
            type: types.REPORTS_LIST_FETCH_REQUESTED
        }),
        requestReportUpdate: report => dispatch({ type: types.STORE_REPORT_REQUESTED, payload: report }),
        requestSubsystems: () => dispatch({type: types.SUBSYSTEMS_FETCH_REQUESTED}),
        requestReportRemove: key => {
            dispatch({ type: types.REMOVE_REPORT, payload: key });
            dispatch({ type: types.REMOVE_REPORT_REQUESTED, payload: key });
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ReportsList);
