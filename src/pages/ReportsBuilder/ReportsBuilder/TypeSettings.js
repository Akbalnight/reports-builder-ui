import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

import { 
    Button, 
    Checkbox,
    Input, 
    Drawer
} from 'antd';

import classNames from 'classnames';

import { settings } from 'Settings';

import './Editor.css';
import './ChartEditor.css';
import './ReportsBuilderType.css';

const chartTypes = [{
    type: 'table',
    className: 'rbu-builder-image-table',
    title: 'Таблица'
}, {
    type: 'linear',
    className: 'rbu-builder-image-linear',
    title: 'Линейный график'
}, {
    type: 'bar',
    className: 'rbu-builder-image-bar',
    title: 'Гистограмма'
}, {
    type: 'hbar',
    className: 'rbu-builder-image-hbar',
    title: 'Линейчатая диаграмма'
}];

const getImages = () => settings.get().reportImages;

const ChartImage = ({className, title, onClick}) => (
    <div onClick={onClick} className={classNames("rbu-builder-type-column", className)}>
        <p><span style={{backgroundImage: `url('${getImages()}')`}}></span></p>
        <div>{title}</div>
    </div>
)

const Row = ({title, className, children}) => (
    <div>
        <label className={className}>{title}</label>
        {children}
    </div>
)

const ChartRow = ({title, className, filterFunc, onClick}) => {
    const charts = chartTypes.filter(item => filterFunc(item.type));
    if (charts.length === 0)
        return null;

    return (
        <Row title={title} className={className}>
            {charts.map(({type, ...props}) => 
                <ChartImage key={type} onClick={() => onClick && onClick(type)} {...props} />)}
        </Row>
    );
}

class TypeSettings extends Component {
    static propTypes = {
        visible: PropTypes.bool,
        onClose: PropTypes.func,

        reportType: PropTypes.string,
        onReportTypeChange: PropTypes.func,

        reportName: PropTypes.string,
        highlightName: PropTypes.bool,
        highlightTypes: PropTypes.bool,
        onReportNameChange: PropTypes.func,

        isPublic: PropTypes.bool,
        onIsPublicChange: PropTypes.func,

        onTerminate: PropTypes.func,
        onCancel: PropTypes.func,
    }

    reportTypeChangeHandler = (type) => {
        this.props.onReportTypeChange(type);
        this.props.onClose();
    };

    render() {
        return (
            <Drawer
                title="Настройки отчёта"
                className="rbu-builder-editor-type-settings-panel"
                width={400}
                placement="right"
                onClose={this.props.onClose}
                visible={this.props.visible}
                style={{
                    height: 'calc(100% - 55px)',
                    overflow: 'auto',
                    marginBottom: 53,
                }}
            >
                <div>
                    <Row title="Наименование отчёта">
                        <Input 
                            className={classNames({'rbu-builder-editor-type-settings-validation-error': this.props.highlightName && !this.props.reportName})}
                            placeholder="Название отчёта" 
                            value={this.props.reportName} 
                            onChange={this.props.onReportNameChange} />
                        <Checkbox checked={this.props.isPublic} onChange={this.props.onIsPublicChange}>Сделать отчёт публичным</Checkbox>
                    </Row>
                    <ChartRow 
                        title="Текущее представление отчёта" 
                        className={classNames({'rbu-builder-editor-type-settings-validation-error': this.props.highlightTypes && !this.props.reportType})}
                        filterFunc={type => type === this.props.reportType} 
                    />
                    <ChartRow 
                        title="Доступные представления отчёта"
                        className={classNames({'rbu-builder-editor-type-settings-validation-error': this.props.highlightTypes && !this.props.reportType})}
                        filterFunc={type => type !== this.props.reportType} 
                        onClick={this.reportTypeChangeHandler} 
                    />
                </div>
                <div className="rbu-builder-editor-type-settings-actions">
                    <Button type="danger" onClick={this.props.onTerminate}>Отмена</Button>
                    <Button type="primary" onClick={this.props.onClose}>Продолжить</Button>
                </div>
            </Drawer>
        );
    }
}

export default TypeSettings;