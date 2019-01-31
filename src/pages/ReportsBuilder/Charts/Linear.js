import React from 'react';
import {
    LineChart,
    Line,
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

const lineRender = ({ key, dataKey, color, ...props }) =>
    <Line key={key} type="monotone" isAnimationActive={false} dataKey={dataKey} stroke={color} {...props} />;

const RbcLinear = ({
    dataAxis,
    valueAxis,
    data,
    dataAxisName,
    valueAxisName,
    isLegendVisible,
    ...props
}) => (
    <LineChart 
        data={prepareChartData(data, valueAxis, dataAxis)}
        margin={{ top: 5, right: 30, left: 30, bottom: dataAxisName ? 30 : 5 }} 
        {...props}
    >
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
        {isLegendVisible && <Legend
            verticalAlign="top"
            align="right"
            layout="vertical"
            iconType="line"
            wrapperStyle={{ paddingLeft: '10px' }} />}
        {valueAxis.map(lineRender)}}
    </LineChart>
);

export default RbcLinear;