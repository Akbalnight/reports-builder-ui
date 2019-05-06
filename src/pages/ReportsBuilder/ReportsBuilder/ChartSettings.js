import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

import { Button, Input, Radio, Select, Popconfirm, Checkbox } from 'antd';
import { GithubPicker } from 'react-color';

import { chartLineTypes, calculateXFor, calculateYFor, chartsWithOneAxis } from '../Services/Editor';

import './Editor.css';
import './ChartEditor.css';

const Option = Select.Option;
const RadioGroup = Radio.Group;

const SettingsItem = ({ title, action, onAction, children }) => (
    <div className="rbu-builder-editor-chart-st-item">
        <label className="rbu-builder-editor-chart-st-item-title">
            <span>{title}</span>
            {action && <a href="#" onClick={onAction}>{action}</a>}
        </label>
        <div>{children}</div>
    </div>
)

const TitleItem = ({ title, value, onChange }) => (
    <div className="rbu-builder-editor-chart-st-title-item">
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
                    className="rbu-builder-editor-chart-st-color-mark" 
                    onClick={this.handleClick}></div>
                {this.state.displayColorPicker && <div className="rbu-builder-editor-chart-st-color-picker-popover">
                    <div className="rbu-builder-editor-chart-st-color-picker-cover" onClick={this.handleClose} />
                    <GithubPicker
                        colors={colors} 
                        color={this.props.color} 
                        onChange={this.handleChange}
                        triangle='hide'
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
            <div className="rbu-builder-editor-chart-st-rows">
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
    type,
    chartType,
    axisData,
    dataAxisKey,
    dataKey,
    color,
    colorNegative,
    colorInitial,
    colorTotal,
    name,
    rows,
    onRemove,
    onChartTypeChange,
    onValueKeyChange,
    onDataKeyChange,
    onColorChange,
    onColorNegativeChange,
    onColorInitialChange,
    onColorTotalChange,
    onValueNameChange,
    onRowsChange
}) => {
    const valueTitle1 = type === 'scatter' ? 'Значение Y:' : 'Значение:';
    const colorTitle = type === 'cascade' ? 'Цвет роста' : 'Цвет';

    return (
        <div className="rbu-builder-editor-chart-st-axis-desc">
            <div>
                <Popconfirm title="Вы действительно хотите удалить график?" onConfirm={onRemove} okText="Да" cancelText="Отмена">
                    <Button icon="close" size="small" />
                </Popconfirm>
            </div>
            {type === 'combo' &&
            <div>
                <label>Тип:</label>
                <div>
                    <Select
                        value={chartType}
                        size="small"
                        style={{width: '100%'}}
                        onChange={onChartTypeChange}>
                        {chartLineTypes.map((item) =>
                            <Option key={item.type} value={item.type}>{item.title}</Option>
                        )}
                    </Select>
                </div>
            </div>
            }
            {type === 'scatter' &&
            <div>
                <label>Значение X:</label>
                <div>
                    <Select
                        value={dataAxisKey}
                        size="small"
                        style={{width: '100%'}}
                        onChange={onDataKeyChange}>
                        {axisData.filter((item) => item.type === 'numeric').map((item) =>
                            <Option key={item.column} value={item.title}>{item.title}</Option>
                        )}
                    </Select>
                </div>
            </div>
            }
            <div>
                <label>{valueTitle1}</label>
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
            {type !== 'pie' && <div>
                <label>{colorTitle}:</label>
                <div><Color color={color} onChange={onColorChange}/></div>
            </div>
            }
            {type === 'cascade' && <div>
                <label>Цвет спада:</label>
                <div><Color color={colorNegative} onChange={onColorNegativeChange}/></div>
            </div>
            }
            {type === 'cascade' && <div>
                <label>Цвет начала:</label>
                <div><Color color={colorInitial} onChange={onColorInitialChange}/></div>
            </div>
            }
            {type === 'cascade' && <div>
                <label>Цвет итого:</label>
                <div><Color color={colorTotal} onChange={onColorTotalChange}/></div>
            </div>
            }
            {false && <div>
                <label>Наименование ряда:</label>
                <div><Input size="small" style={{ width: '100%' }} value={name} onChange={onValueNameChange} /></div>
            </div>}
            <div>
                <label>Строка:</label>
                <div><RowsSelector rows={rows} onChange={onRowsChange} /></div>
            </div>
        </div>
    )
};

const GeneralSettings = ({
    type,
    isLegendVisible,
    isCalculatedXRange,
    isCalculatedYRange,
    isShowedDotValues,
    onLegendVisibilityChange,
    onCalculateXRangeChange,
    onCalculateYRangeChange,
    onShowDotValuesChange
}) => (
    <div className="rbu-builder-editor-chart-st-general">
        <Checkbox checked={isLegendVisible} onChange={onLegendVisibilityChange}>Отображение легенды</Checkbox>
        <Checkbox checked={isShowedDotValues} onChange={onShowDotValuesChange}>Показывать значения</Checkbox>
        {calculateXFor.includes(type) && <Checkbox checked={isCalculatedXRange} onChange={onCalculateXRangeChange}>Вычислять границы оси X</Checkbox> }
        {calculateYFor.includes(type) && <Checkbox checked={isCalculatedYRange} onChange={onCalculateYRangeChange}>Вычислять границы оси Y</Checkbox> }
    </div>
);

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
        isCalculatedXRange: PropTypes.bool,
        isCalculatedYRange: PropTypes.bool,
        isShowedDotValues: PropTypes.bool,
        onLegendVisibilityChange: PropTypes.func,
        onCalculateXRangeChange: PropTypes.func,
        onCalculateYRangeChange: PropTypes.func,
        onShowDotValuesChange: PropTypes.func
    };

    removeHandler = (index) => () => {
        this.props.onValueAxisRemove && this.props.onValueAxisRemove(index)
    };

    valueKeyHandler = (keyName) => (index) => (key) => {
        this.props.onValueAxisChange && this.props.onValueAxisChange(index, {
            ...this.props.valueAxis[index],
            [keyName]: key
        })
    };

    colorHandler = (index) => (color) => {
        this.props.onValueAxisChange && this.props.onValueAxisChange(index, {
            ...this.props.valueAxis[index],
            color: color.hex
        })
    };

    colorHandler = (keyName) => (index) => (color) => {
        this.props.onValueAxisChange && this.props.onValueAxisChange(index, {
            ...this.props.valueAxis[index],
            [keyName]: color.hex
        })
    };

    valueNameHandler = (index) => (e) => {
        this.props.onValueAxisChange && this.props.onValueAxisChange(index, {
            ...this.props.valueAxis[index],
            name: e.target.value
        })
    };

    valueRowsHandler = (index) => (rows) => {
        this.props.onValueAxisChange && this.props.onValueAxisChange(index, {
            ...this.props.valueAxis[index],
            rows: rows
        })
    };

    render() {
        const showXAxis = this.props.type !== 'scatter';
        const addAction = !chartsWithOneAxis.includes(this.props.type) || this.props.valueAxis.length < 1 ? '+ Добавить' : undefined;
        const axisYTitle = this.props.type === 'scatter' ? 'Ось' : 'Ось Y';

        return (
            <div className="rbu-builder-editor-chart-st-root">
                <SettingsItem title="Подписи">
                    <TitleItem title="Заголовок:" value={this.props.chartTitle} onChange={this.props.onChartTitleChange} />
                    {this.props.type !== 'pie' && <TitleItem title="Ось X:" value={this.props.dataAxisName} onChange={this.props.onDataAxisNameChange} />}
                    {this.props.type !== 'pie' && <TitleItem title="Ось Y:" value={this.props.valueAxisName} onChange={this.props.onValueAxisNameChange} />}
                </SettingsItem>
                {showXAxis &&
                <SettingsItem title="Ось X">
                    <Select
                        value={this.props.dataAxisKey}
                        size="small"
                        style={{width: '100%'}}
                        onChange={this.props.onDataAxisKeyChange}>
                        {this.props.axisData.map((item) =>
                            <Option key={item.column} value={item.title}>{item.title}</Option>
                        )}
                    </Select>
                </SettingsItem>
                }
                <SettingsItem title={axisYTitle} action={addAction} onAction={this.props.onValueAxisAdd}>
                    {this.props.valueAxis.map((props, index) =>
                        <AxisSettings
                            type={this.props.type}
                            key={index}
                            axisData={this.props.axisData}
                            onRemove={this.removeHandler(index)}
                            onChartTypeChange={this.valueKeyHandler('chartType')(index)}
                            onValueKeyChange={this.valueKeyHandler('dataKey')(index)}
                            onDataKeyChange={this.valueKeyHandler('dataAxisKey')(index)}
                            onColorChange={this.colorHandler('color')(index)}
                            onColorNegativeChange={this.colorHandler('colorNegative')(index)}
                            onColorInitialChange={this.colorHandler('colorInitial')(index)}
                            onColorTotalChange={this.colorHandler('colorTotal')(index)}
                            onValueNameChange={this.valueNameHandler(index)}
                            onRowsChange={this.valueRowsHandler(index)}
                            {...props} 
                            />)}
                </SettingsItem>
                <SettingsItem title="Общие настройки">
                    <GeneralSettings
                        type={this.props.type}
                        isLegendVisible={this.props.isLegendVisible}
                        isCalculatedXRange={this.props.isCalculatedXRange}
                        isCalculatedYRange={this.props.isCalculatedYRange}
                        isShowedDotValues={this.props.isShowedDotValues}
                        onLegendVisibilityChange={this.props.onLegendVisibilityChange}
                        onCalculateXRangeChange={this.props.onCalculateXRangeChange}
                        onCalculateYRangeChange={this.props.onCalculateYRangeChange}
                        onShowDotValuesChange={this.props.onShowDotValuesChange}
                        />
                </SettingsItem>
            </div>
        );
    }
}

export default ChartSettings;
