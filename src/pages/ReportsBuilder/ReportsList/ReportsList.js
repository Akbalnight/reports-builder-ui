import React, { Fragment, Component } from 'react';
import { PropTypes } from 'prop-types';
import connect from 'react-redux/es/connect/connect';

import { message, Input, Button, Popconfirm, Menu, Icon, Dropdown, Spin, Tooltip } from 'antd';

import ReportCompositeViewer from '../ReportCompositeViewer';

import { 
    requestReportsList, 
    requestReportRemove, 
    requestReportUpdate,
    requestSubsystems
} from 'Actions/ReportActions';

import { getCurrentChartIconSafe } from '../Services/Editor.js';

import { settings } from 'Settings';

import './ReportsList.css';

const getUrlPrefix = () => settings.get().apiPrefix;

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

    onSetFavoriteStateClick = (event, id, state) => {
        event.domEvent.stopPropagation();
        let reportToModify = this.props.reportsList.find(report => report.id === id);
        reportToModify.isFavorite = state;
        this.props.requestReportUpdate(reportToModify);
    }

    onPrintClick = () => {
        if (!this.state.selectedKey) {
            message.error('Сначала выберите отчёт из списка');
            return;
        }
        message.error('Данная функция находится в разработке');
    }

    onSearchHandle = (e) => {
        this.setState({filter: e.target.value})
    }

    MenuItemView = ({report, menu}) => {
        const icon = getCurrentChartIconSafe(report.type);
        return (
            <Fragment>
                <Icon type={icon.icon} className={icon.className} />
                <Dropdown
                    trigger={['contextMenu']}
                    overlay={menu}
                >
                    <div className="rl-body-menu-item-text">
                        {report.title}
                    </div>
                </Dropdown>
                <Tooltip title="Редактировать">
                    <Button className="rl-menu-item-button" size="small" icon="edit" onClick={() => this.editReportHandler(report)} />
                </Tooltip>
                <Popconfirm onConfirm={() => this.removeReportHandler(report.id)} title="Вы действительно хотите удалить отчёт? Восстановить будет невозможно" okText="Да" cancelText="Отмена">
                    <Tooltip title="Удалить">
                        <Button className="rl-menu-item-button" size="small" icon="delete" />
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
            <div className="rl-root">
                <div className="rl-header">
                    <Search
                        placeholder="Введите поисковый запрос"
                        className="rl-header-search"
                        onChange={this.onSearchHandle}
                    />
                    <div className="rl-filler"></div>
                    <Button size="small" icon="bar-chart" onClick={this.openTypeSelector}>Новый отчёт</Button>
                    <Dropdown
                        trigger={['click']}
                        overlay={(
                            <Menu>
                                <Menu.Item key='pdf'>
                                    <form target="_blank" method="post" action={`${getUrlPrefix()}/reports/analytics/reports/${selectedKey}/_export?format=PDF`}>
                                        <Button className="rl-menu-item-button item-export" size="small" htmlType="submit" ><Icon type="file-pdf" /> PDF</Button>
                                    </form>
                                </Menu.Item>
                                <Menu.Item key='excel'>
                                    <form target="_blank" method="post" action={`${getUrlPrefix()}/reports/analytics/reports/${selectedKey}/_export?format=XLSX`}>
                                        <Button className="rl-menu-item-button item-export" size="small" htmlType="submit" ><Icon type="file-excel" /> Excel</Button>
                                    </form>
                                </Menu.Item>
                            </Menu>
                        )}
                        disabled={!selectedKey}
                    >
                        <Button size="small" icon="export" disabled={!selectedKey}>Экспорт</Button>
                    </Dropdown>
                    <Button size="small" icon="printer" onClick={this.onPrintClick} disabled={!selectedKey}>Печать</Button>
                </div>
                <div className="rl-body">
                    <div className="rl-body-menu">
                        <Spin spinning={isLoading} >
                            <Menu
                                openKeys={openKeys}
                                onOpenChange={this.onOpenChange}
                                onSelect={this.onSelectMenuItem}
                                mode="inline"
                            >
                                <SubMenu key='favorites' title={<b>Избранные</b>}>
                                    {filteredReportsList.length > 0 && filteredReportsList.filter(item => item.isFavorite).map(report =>
                                        <Menu.Item key={report.id} className="rl-body-menu-item">
                                            <this.MenuItemView
                                                report={report}
                                                menu={(<Menu>
                                                    <Menu.Item key="1" onClick={event => this.onSetFavoriteStateClick(event, report.id, false)}>Удалить из избранного</Menu.Item>
                                                </Menu>)}
                                            />
                                        </Menu.Item>)
                                    }
                                </SubMenu>
                                <SubMenu key='private' title={<b>Личные отчёты</b>}>
                                    {filteredReportsList.length > 0 && filteredReportsList.filter(item => !item.isPublic).map(report =>
                                        <Menu.Item key={report.id} className="rl-body-menu-item">
                                            <this.MenuItemView
                                                report={report}
                                                menu={(<Menu>
                                                    <Menu.Item key="1" onClick={event => this.onSetFavoriteStateClick(event, report.id, true)}>Добавить в избранное</Menu.Item>
                                                </Menu>)}
                                            />
                                        </Menu.Item>)
                                    }
                                </SubMenu>
                                <SubMenu key='public' title={<b>Публичные отчёты</b>}>
                                    {filteredReportsList.length > 0 && filteredReportsList.filter(item => item.isPublic).map(report =>
                                        <Menu.Item key={report.id} className="rl-body-menu-item">
                                            <this.MenuItemView
                                                report={report}
                                                menu={(<Menu>
                                                    <Menu.Item key="1" onClick={event => this.onSetFavoriteStateClick(event, report.id, true)}>Добавить в избранное</Menu.Item>
                                                </Menu>)}
                                            />
                                        </Menu.Item>)
                                    }   
                                </SubMenu>
                            </Menu>
                        </Spin>
                    </div>
                    <div className="rl-body-content" style={{color: 'black'}}>
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

export default connect(mapStateToProps, {
    requestReportsList, 
    requestReportRemove, 
    requestReportUpdate,
    requestSubsystems
})(ReportsList);
