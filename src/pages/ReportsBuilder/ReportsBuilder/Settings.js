import React from 'react';
import { PropTypes } from 'prop-types';

import { Icon, Tabs } from 'antd';

import EditableTable from './EditableTable';

import {
    allCompareTypes,
    generalCompareTypes,
    generalOrderTypes,
    generalAggregationTypes,
    compareFuncHasParam,
    compareFuncHasParamBetween
} from '../Services/Editor';

const { TabPane } = Tabs;

const SettingsTooltipRender = ({table, value}) => (
    <div className="rbu-fe-editable-cell-text-tooltip">
        <div><label>Таблица</label><span>{table}</span></div>
        <div><label>Поле</label><span>{value}</span></div>
    </div>
)

const filterColumns = [{
    title: 'Поле',
    dataIndex: 'title',
    tooltip: SettingsTooltipRender
}, {
    title: 'Вид сравнения',
    dataIndex: 'func',
    placeholder: 'Выберите функцию',
    editor: 'select',
    editorSource: (row) => {
        if (row && row.type === 'string')
            return allCompareTypes.map(item => item.title);
        return generalCompareTypes.map(item => item.title);
    }
}, {
    title: 'Значение',
    dataIndex: 'value',
    placeholder: (row) => {
        if (!compareFuncHasParam(row.func)) return '';
        return 'Введите значение'
    },
    editor: (row) => {
        if (!compareFuncHasParam(row.func)) return null;
        return row.type;
    },
},  {
    title: 'Значение2',
    dataIndex: 'value2',
    placeholder: (row) => {
        if (!compareFuncHasParamBetween(row.func)) return '';
        return 'Введите значение'
    },
    editor: (row) => {
        if (!compareFuncHasParamBetween(row.func)) return null;
        return row.type;
    },
}];

const sortColumns = [{
    title: 'Поле',
    dataIndex: 'title',
    tooltip: SettingsTooltipRender
}, {
    title: 'Направление сортировки',
    dataIndex: 'order',
    placeholder: 'Выберите направление',
    editor: 'select',
    editorSource: (row) => {
        return generalOrderTypes.map(item => item.title);
    }
}];

const groupColumns = [{
    title: 'Группируемые поля',
    dataIndex: 'title',
    tooltip: SettingsTooltipRender
}];

const totalColumns = [{
    title: 'Поле',
    dataIndex: 'title',
    tooltip: SettingsTooltipRender
}, {
    title: 'Функция агрегации',
    dataIndex: 'func',
    placeholder: 'Выберите функцию',
    editor: 'select',
    editorSource: (row) => {
        return generalAggregationTypes.map(item => item.title);
    }
}];

const TC = (icon, title) => (<span><Icon type={icon} theme="outlined" />{title}</span>)

class Settings extends React.Component {
    static propTypes = {
        onTabChange: PropTypes.func,
        filterDataSource: PropTypes.array,
        onFilterChange: PropTypes.func,
        onFilterDelete: PropTypes.func,
        sortDataSource: PropTypes.array,
        onSortChange: PropTypes.func,
        onSortDelete: PropTypes.func,
        onSortOrderChange: PropTypes.func,
        groupDataSource: PropTypes.array,
        onGroupDelete: PropTypes.func,
        onGroupOrderChange: PropTypes.func,
        totalDataSource: PropTypes.array,
        onTotalChange: PropTypes.func,
        onTotalDelete: PropTypes.func,
    }

    render() {
        return (
            <Tabs defaultActiveKey="filter" animated={false} size="small" onChange={this.props.onTabChange}>
                <TabPane tab={TC('filter', 'Фильтрация')} key="filter">
                    <EditableTable
                        columns={filterColumns}
                        dataSource={this.props.filterDataSource}
                        onChange={this.props.onFilterChange}
                        onDelete={this.props.onFilterDelete}
                    />
                </TabPane>
                <TabPane tab={TC('sort-ascending', 'Сортировка')} key="sort">
                    <EditableTable
                        columns={sortColumns}
                        dataSource={this.props.sortDataSource}
                        sortable={true}
                        onChange={this.props.onSortChange}
                        onDelete={this.props.onSortDelete}
                        onOrderChange={this.props.onSortOrderChange}
                    />
                </TabPane>
                <TabPane tab={TC('cluster', 'Группировка')} key="group">
                    <EditableTable
                        columns={groupColumns}
                        dataSource={this.props.groupDataSource}
                        sortable={true}
                        onDelete={this.props.onGroupDelete}
                        onOrderChange={this.props.onGroupOrderChange}
                    />
                </TabPane>
                <TabPane tab={TC('table', 'Итоги')} key="total">
                    <EditableTable
                        columns={totalColumns}
                        dataSource={this.props.totalDataSource}
                        onChange={this.props.onTotalChange}
                        onDelete={this.props.onTotalDelete}
                    />
                </TabPane>
            </Tabs>
        );
    }
}

export default Settings
