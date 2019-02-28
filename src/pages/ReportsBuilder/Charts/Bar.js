import React from 'react';

import { 
    BarChart, 
    Bar, 
    Cell,
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
    charTooltipLabelFormatter,
    getDataDomain,
    getValueDomain
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

const barRender = (data, position, showLabel, {key, dataKey, color, ...props}) => {
    const label = showLabel ? {position} : false;
    return (
        <Bar key={key} isAnimationActive={false} dataKey={dataKey} fill={color} label={label} {...props}>
            {
                data.map((e, i) => (
                    <Cell key={`cell-${i}`} fill={color} />
                ))
            }
        </Bar>
    );
}

const RbcBar = ({
    dataAxis, 
    valueAxis, 
    data,
    dataAxisName,
    valueAxisName,
    isLegendVisible,
    isCalculatedXRange,
    isCalculatedYRange,
    isShowedDotValues,
    ...props
}) => {
    const processedData = prepareChartData(data, valueAxis, dataAxis);
    return (
        <BarChart data={processedData}
            margin={{
                top: isShowedDotValues ? 15 : 5, 
                right: 30, 
                left: 30, 
                bottom: dataAxisName ? 30 : 5}} 
                {...props}>
            <XAxis 
                dataKey={dataAxis.dataKey} 
                allowDataOverflow={true}
                type={dataAxis.dataType} 
                name={dataAxis.dataTitle}
                domain={getDataDomain('bar', processedData, dataAxis, isCalculatedXRange)}
                tickFormatter={value => chartFormatData(value, dataAxis)}
            >
                <Label position='bottom'>{dataAxisName}</Label>
            </XAxis>
            <YAxis domain={getValueDomain('bar', processedData, valueAxis, isCalculatedYRange)} allowDataOverflow={true}>
                <Label angle={270} position='left' style={{textAnchor: 'middle'}}>{valueAxisName}</Label>
            </YAxis>
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip labelFormatter={value=>charTooltipLabelFormatter(value, dataAxis)} />
            {isLegendVisible && legend}
            {valueAxis.map(props => barRender(processedData, 'top', isShowedDotValues, props))}
        </BarChart>
        );
};

const RbcHBar = ({
    dataAxis, 
    valueAxis, 
    data,
    dataAxisName,
    valueAxisName,
    isLegendVisible,
    isCalculatedXRange,
    isCalculatedYRange,
    isShowedDotValues,
    ...props}) => {
        const processedData = prepareChartData(data, valueAxis, dataAxis);
        return (
            <BarChart 
                data={processedData}
                layout="vertical"
                margin={{
                    top: 15, 
                    right: 30, 
                    left: 30, 
                    bottom: valueAxisName ? 30 : 5}} 
                    {...props}>
                <XAxis type="number" domain={getValueDomain('bar', processedData, valueAxis, isCalculatedXRange)} allowDataOverflow={true}>
                    <Label position='bottom'>{valueAxisName}</Label>
                </XAxis>
                <YAxis 
                    dataKey={dataAxis.dataKey}
                    reversed={true}
                    allowDataOverflow={true}
                    type={dataAxis.dataType}
                    name={dataAxis.dataTitle}
                    domain={getDataDomain('bar', processedData, dataAxis, isCalculatedYRange)}
                    tickFormatter={value => chartFormatData(value, dataAxis)}
                >
                    <Label angle={270} position='left' style={{textAnchor: 'middle'}}>{dataAxisName}</Label>
                </YAxis>
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip labelFormatter={value=>charTooltipLabelFormatter(value, dataAxis)} />
                {isLegendVisible && legend}
                {valueAxis.map(props => barRender(processedData, 'right', isShowedDotValues, props))}
            </BarChart>
        );
}

export {
    RbcBar,
    RbcHBar
};