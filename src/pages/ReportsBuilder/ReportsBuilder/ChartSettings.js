import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

import { Button, Input, Radio, Select, Popconfirm, Checkbox } from 'antd';
import { GithubPicker } from 'react-color';

import './Editor.css';
import './ChartEditor.css';

const Option = Select.Option;
const RadioGroup = Radio.Group;

const SettingsItem = ({ title, action, onAction, children }) => (
    <div className="rb-builder-editor-chart-st-item">
        <label className="rb-builder-editor-chart-st-item-title">
            <span>{title}</span>
            {action && <a href="#" onClick={onAction}>{action}</a>}
        </label>
        <div>{children}</div>
    </div>
)

const TitleItem = ({ title, value, onChange }) => (
    <div className="rb-builder-editor-chart-st-title-item">
        <label>{title}</label>
        <Input value={value} onChange={onChange} />
    </div>
)

const colors = [
    '#B80000',
    '#DB3E00',
    '#FCCB00',
    '#008B02',
    '#006B76',
    '#1273DE',
    '#004DCF',
    '#5300EB',
    '#EB9694',
    '#FAD0C3',
    '#FEF3BD',
    '#C1E1C5',
    '#BEDADC',
    '#C4DEF6',
    '#BED3F3',
    '#D4C4FB'
];

const colors1 = [
    '#FF8D8D',
    '#FFB54A',
    '#FFB871',
    '#FFD38D',
    '#EEEC84',
    '#EACEB2',
    '#B8B5E8',
    '#98E598',
    '#B4DFC4',
    '#CCE89E',
    '#B4EFBF',
    '#D3FF9F',
    '#A6DFFF',
    '#ACCCE2'
];

const colors2 = [
    '#FF4545',
    '#FF8500',
    '#FC9956',
    '#FFCF87',
    '#FFEC00',
    '#B0EF5E',
    '#ADDD2A',
    '#34C134',
    '#4CD860',
    '#4CE570',
    '#DF94FF',
    '#9994FF',
    '#69D4F9',
    '#0AA0EA'
];

const colors3 = [
    '#8E2D18',
    '#EA003B',
    '#E3351C',
    '#EA00AF',
    '#B000E9',
    '#8054FF',
    '#01AFEB',
    '#D85041',
    '#EBAF01',
    '#FFC229',
    '#50D81E',
    '#28EA52',
    '#00BF31',
    '#6ADAFF'
];

class Color extends React.Component {
    state = {
        displayColorPicker: false
    }

    handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker })
    };

    handleClose = () => {
        this.setState({ displayColorPicker: false })
    };

    handleChange = (color) => {
        this.handleClose();
        this.props.onChange && this.props.onChange(color);
    };

    render() {
        return (
            <div style={{position: 'relative'}}>
                <div 
                    style={{backgroundColor: this.props.color}}
                    className="rb-builder-editor-chart-st-color-mark" 
                    onClick={this.handleClick}></div>
                {this.state.displayColorPicker && <div className="rb-builder-editor-chart-st-color-picker-popover">
                    <div className="rb-builder-editor-chart-st-color-picker-cover" onClick={this.handleClose} />
                    <GithubPicker
                        colors={colors} 
                        color={this.props.color} 
                        onChange={this.handleChange}
                        width={212} />
                </div>}

            </div>
        )
    }
}

class RowsSelector extends React.Component {
    constructor(props) {
        super(props);
        if (!props.rows || !Array.isArray(props.rows) || !props.rows.length) {
            this.state = {
                type: 'all'
            }
        } else {
            this.state = {
                type: 'part',
                from: props.rows[0],
                to: props.rows[1]
            }
        }
    }

    valueHandler = (index) => (e) => {
        let value = e.target.value;
        if (index === 'from' || index === 'to') {
            if (isNaN(+value)) value = '';
        }

        if (index === 'from') {
            if (value.length && +value < 1) value = 1;
        } 

        this.setState({
            [index]: value.toString()
        });
        
        if (this.props.onChange) {
            const type = index === 'type' ? value : this.state.type;
            const from = index === 'from' ? value : this.state.from;
            const to = index === 'to' ? value : this.state.to;
            const rows = type === 'all'
                ? []
                : [+from, +to];
            this.props.onChange(rows);
        }
    }

    typeHandler = this.valueHandler('type');

    fromHandler = this.valueHandler('from');
    toHandler = this.valueHandler('to');

    render() {
        const isPartDisabled = this.state.type !== 'part';
        return (
            <div className="rb-builder-editor-chart-st-rows">
                <RadioGroup value={this.state.type} onChange={this.typeHandler}>
                    <Radio value="all">Всё</Radio>
                    <Radio value="part">
                        <span>c </span>
                        <Input disabled={isPartDisabled} value={this.state.from} onChange={this.fromHandler} />
                        <span> по </span>
                        <Input disabled={isPartDisabled} value={this.state.to} onChange={this.toHandler} />
                    </Radio>
                </RadioGroup>
            </div>
        )
    }
} 

const AxisSettings = ({
    axisData,
    dataKey,
    color,
    name,
    rows,
    onRemove,
    onValueKeyChange,
    onColorChange,
    onValueNameChange,
    onRowsChange
}) => { 
    return (
        <div className="rb-builder-editor-chart-st-axis-desc">
            <div>
                <Popconfirm title="Вы действительно хотите удалить график?" onConfirm={onRemove} okText="Да" cancelText="Отмена">
                    <Button icon="close" size="small" />
                </Popconfirm>
            </div>
            <div>
                <label>Значение:</label>
                <div>
                    <Select
                        value={dataKey}
                        size="small"
                        style={{ width: '100%' }}
                        onChange={onValueKeyChange}>
                        {axisData.filter((item) => item.type === 'numeric').map((item) => 
                            <Option key={item.column} value={item.title}>{item.title}</Option>
                        )}
                    </Select>
                </div>
            </div>
            <div>
                <label>Цвет:</label>
                <div><Color color={color} onChange={onColorChange} /></div>
            </div>
            <div>
                <label>Наименование ряда:</label>
                <div><Input size="small" style={{ width: '100%' }} value={name} onChange={onValueNameChange} /></div>
            </div>
            <div>
                <label>Строка:</label>
                <div><RowsSelector rows={rows} onChange={onRowsChange} /></div>
            </div>
        </div>
    )
}

const GeneralSettings = ({
    isLegendVisible,
    onLegendVisibilityChange
}) => (
    <div className="rb-builder-editor-chart-st-general">
        <Checkbox checked={isLegendVisible} onChange={onLegendVisibilityChange}>Отображение легенды</Checkbox>
    </div>
)

class ChartSettings extends Component {
    static propTypes = {
        axisData: PropTypes.array,
        chartTitle: PropTypes.string,
        dataAxisName: PropTypes.string,
        valueAxisName: PropTypes.string,
        onChartTitleChange: PropTypes.func,
        onDataAxisNameChange: PropTypes.func,
        onValueAxisNameChange: PropTypes.func,

        dataAxisKey: PropTypes.string,
        onDataAxisKeyChange: PropTypes.func,

        onValueAxisAdd: PropTypes.func,
        onValueAxisRemove: PropTypes.func,
        onValueAxisChange: PropTypes.func,
        valueAxis: PropTypes.array.isRequired,

        isLegendVisible: PropTypes.bool,
        onLegendVisibilityChange: PropTypes.func
    };

    removeHandler = (index) => () => {
        this.props.onValueAxisRemove && this.props.onValueAxisRemove(index)
    }

    valueKeyHandler = (index) => (key) => {
        this.props.onValueAxisChange && this.props.onValueAxisChange(index, {
            ...this.props.valueAxis[index],
            dataKey: key
        })
    }

    colorHandler = (index) => (color) => {
        this.props.onValueAxisChange && this.props.onValueAxisChange(index, {
            ...this.props.valueAxis[index],
            color: color.hex
        })
    }

    valueNameHandler = (index) => (e) => {
        this.props.onValueAxisChange && this.props.onValueAxisChange(index, {
            ...this.props.valueAxis[index],
            name: e.target.value
        })
    }

    valueRowsHandler = (index) => (rows) => {
        this.props.onValueAxisChange && this.props.onValueAxisChange(index, {
            ...this.props.valueAxis[index],
            rows: rows
        })
    }

    render() {
        return (
            <div className="rb-builder-editor-chart-st-root">
                <SettingsItem title="Подписи">
                    <TitleItem title="Заголовок:" value={this.props.chartTitle} onChange={this.props.onChartTitleChange} />
                    <TitleItem title="Ось X:" value={this.props.dataAxisName} onChange={this.props.onDataAxisNameChange} />
                    <TitleItem title="Ось Y:" value={this.props.valueAxisName} onChange={this.props.onValueAxisNameChange} />
                </SettingsItem>
                <SettingsItem title="Ось X">
                    <Select
                        value={this.props.dataAxisKey}
                        size="small"
                        style={{ width: '100%' }}
                        onChange={this.props.onDataAxisKeyChange}>
                        {this.props.axisData.map((item) =>
                            <Option key={item.column} value={item.title}>{item.title}</Option>
                        )}
                    </Select>
                </SettingsItem>
                <SettingsItem title="Ось Y" action="+ Добавить" onAction={this.props.onValueAxisAdd}>
                    {this.props.valueAxis.map((props, index) =>
                        <AxisSettings
                            key={index}
                            axisData={this.props.axisData}
                            onRemove={this.removeHandler(index)}
                            onValueKeyChange={this.valueKeyHandler(index)}
                            onColorChange={this.colorHandler(index)}
                            onValueNameChange={this.valueNameHandler(index)}
                            onRowsChange={this.valueRowsHandler(index)}
                            {...props} 
                            />)}
                </SettingsItem>
                <SettingsItem title="Общие настройки">
                    <GeneralSettings
                        isLegendVisible={this.props.isLegendVisible}
                        onLegendVisibilityChange={this.props.onLegendVisibilityChange}
                        />
                </SettingsItem>
            </div>
        );
    }
}

export default ChartSettings;