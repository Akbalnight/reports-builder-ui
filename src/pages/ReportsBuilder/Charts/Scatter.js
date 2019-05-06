import React from 'react';
import {
    Chart,
    Geom,
    Axis,
    Tooltip,
    Label,
    Legend
} from "bizcharts";

import './ReportsBuilderChart.css';

const RbcScatter = ({
    data,
    dataAxis,
    valueAxis,
    dataAxisName,
    valueAxisName,
    isLegendVisible,
    isCalculatedXRange,
    isCalculatedYRange,
    isShowedDotValues,
    ...props}) =>
{
    if (!valueAxis.length)
        return null;

    const position = `${valueAxis[0].dataAxisKey}*${valueAxis[0].dataKey}`;
    const color = [valueAxis[0].dataAxisKey, [valueAxis[0].color]];

    const scales = {
        [valueAxis[0].dataAxisKey]: {
            alias: dataAxisName || '  '
        },
        [valueAxis[0].dataKey]: {
            alias: valueAxisName || '  '
        }
    };

    const legendItems = valueAxis.map(axis => ({
        value: axis.dataKey,
        fill: axis.color,
        marker: 'circle'
    }));

    const round2 = (value) => Math.round(value*100)/100;

    return (
        <Chart padding="auto" data={data} scale={scales} {...props}>
            {false && <Legend position="right-top" custom={true} items={legendItems} />}
            <Tooltip
                showTitle={false}
                crosshairs={{
                    type: "cross"
                }}
            />
            <Axis name={valueAxis[0].dataAxisKey} title={{position: 'center'}} />
            <Axis name={valueAxis[0].dataKey} title={{position: 'center'}} />
            <Geom
                type="point"
                position={position}
                opacity={0.65}
                color={color}
                shape="circle"
                size={4}
                tooltip={[position, (data, value) => ({
                    name: `${valueAxis[0].dataAxisKey} - ${valueAxis[0].dataKey}`,
                    value: `${round2(data)} - ${round2(value)}`
                })]}
            >
                {isShowedDotValues && <Label content={valueAxis[0].dataKey} textStyle={(value, point) => {
                    return {
                        fill: point.color
                    }
                }} />}
            </Geom>
        </Chart>
    );
};

export default RbcScatter;
