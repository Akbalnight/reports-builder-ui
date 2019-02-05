import React from 'react';
import {
    LineChart,
    Line,
    LabelList,
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

const renderLabel = (color) => (props) => {
    const { x, y, value } = props;
    return (
        <g>
            <text x={x} y={y - 8} fill={color} textAnchor="middle" dominantBaseline="bottom">
                {value}
            </text>
        </g>
    );
};

const lineRender = (showLabel, {key, dataKey, color, ...props}) => {
    return (
        <Line 
            key={key} 
            type="monotone" 
            isAnimationActive={false} 
            dataKey={dataKey} 
            stroke={color}
            {...props}>
            {showLabel && <LabelList dataKey={dataKey} position="top" content={renderLabel(color)} />}
        </Line>
    );
}

const RbcLinear = ({
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
    const preparedData = prepareChartData(data, valueAxis, dataAxis);
    return (
        <LineChart 
            data={preparedData}
            margin={{ 
                top: isShowedDotValues ? 15 : 5, 
                right: 30, 
                left: 30, 
                bottom: dataAxisName ? 30 : 5 }} 
            {...props}
        >
            <XAxis 
                dataKey={dataAxis.dataKey} 
                allowDataOverflow={true}
                type={dataAxis.dataType} 
                name={dataAxis.dataTitle}
                domain={getDataDomain('linear', data, dataAxis, isCalculatedXRange)}
                tickFormatter={value => chartFormatData(value, dataAxis)}
            >
                <Label position='bottom'>{dataAxisName}</Label>
            </XAxis>
            <YAxis domain={getValueDomain('bar', data, valueAxis, isCalculatedYRange)} allowDataOverflow={true}>
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
            {valueAxis.map(props => lineRender(isShowedDotValues, props))}}
        </LineChart>
    );
}

export default RbcLinear;