import React from 'react';

import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend,
    Label
} from 'recharts';

import {
    prepareChartData,
    chartFormatData,
    charTooltipLabelFormatter
} from '../utils';

import './ReportsBuilderChart.css';

const legend = (
    <Legend 
        verticalAlign="top" 
        align="right" 
        layout="vertical" 
        iconType="rect"
        wrapperStyle={{paddingLeft: '10px'}} 
    />
)

const barRender = ({key, dataKey, color, ...props}) => 
    <Bar key={key} isAnimationActive={false} dataKey={dataKey} fill={color} {...props} />;

const RbcBar = ({
    dataAxis, 
    valueAxis, 
    data,
    dataAxisName,
    valueAxisName,
    isLegendVisible,
    ...props
}) => (
    <BarChart data={prepareChartData(data, valueAxis, dataAxis)}
        margin={{top: 5, right: 30, left: 30, bottom: dataAxisName ? 30 : 5}} {...props}>
        <XAxis 
            dataKey={dataAxis.dataKey} 
            type={dataAxis.dataType} 
            name={dataAxis.dataTitle}
            domain={['dataMin', 'dataMax']}
            tickFormatter={value => chartFormatData(value, dataAxis)}
        >
            <Label position='bottom'>{dataAxisName}</Label>
        </XAxis>
        <YAxis>
            <Label angle={270} position='left' style={{textAnchor: 'middle'}}>{valueAxisName}</Label>
        </YAxis>
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip labelFormatter={value=>charTooltipLabelFormatter(value, dataAxis)} />
        {isLegendVisible && legend}
        {valueAxis.map(barRender)}
    </BarChart>
);

const RbcHBar = ({
    dataAxis, 
    valueAxis, 
    data,
    dataAxisName,
    valueAxisName,
    isLegendVisible,
    ...props}) => (
    <BarChart 
        data={prepareChartData(data, valueAxis, dataAxis)}
        layout="vertical"
        margin={{top: 5, right: 30, left: 30, bottom: valueAxisName ? 30 : 5}} 
        {...props}>
        <XAxis type="number">
            <Label position='bottom'>{valueAxisName}</Label>
        </XAxis>
        <YAxis 
            dataKey={dataAxis.dataKey} 
            type={dataAxis.dataType}
            name={dataAxis.dataTitle}
            domain={['dataMin', 'dataMax']}
            tickFormatter={value => chartFormatData(value, dataAxis)}
        >
            <Label angle={270} position='left' style={{textAnchor: 'middle'}}>{dataAxisName}</Label>
        </YAxis>
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip labelFormatter={value=>charTooltipLabelFormatter(value, dataAxis)} />
        {isLegendVisible && legend}
        {valueAxis.map(barRender)}
    </BarChart>
);

export {
    RbcBar,
    RbcHBar
};