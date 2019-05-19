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
import {prepareChartData} from "../utils";
import DataSet from "@antv/data-set";

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
    const preparedData = prepareChartData(data, valueAxis, dataAxis);

    const ds = new DataSet();
    const dv = ds.createView().source(preparedData);
    dv.transform({
        type: "fold",
        fields: valueAxis.map(row => row.dataKey),
        key: "chart",
        value: "value",
        retains: [dataAxis.dataKey]
    });

    const position = `${dataAxis.dataKey}*value`;
    const color = ['chart', valueAxis.map(row => row.color)];

    const notAutoX = isCalculatedXRange ? {} : {min: 0};
    const notAutoY = isCalculatedYRange ? {} : {min: 0};

    const range = isShowedDotValues ? {range: [0, 0.9]} : {};

    const scales = {
        [dataAxis.dataKey]: {
            alias: dataAxisName || '  ',
            tickCount: 5,
            ...notAutoX
        },
        'value': {
            alias: valueAxisName || '  ',
            ...notAutoY,
            ...range
        }
    };

    return (
        <Chart padding='auto' data={dv} scale={scales} {...props}>
            {isLegendVisible && <Legend position="right-top" />}
            <Axis name={dataAxis.dataKey} title={{position: 'center'}} />
            <Axis name="value" title={{position: 'center'}} />
            <Tooltip
                crosshairs={{
                    type: "y"
                }}
            />
            <Geom
                type="point"
                position={position}
                size={4}
                color={color}
                shape="circle"
                style={{
                    stroke: "#fff",
                    lineWidth: 1
                }}
            >
                {isShowedDotValues && <Label content="value" textStyle={(value, point) => {
                    return {
                        fill: point.color
                    }
                }} />}
            </Geom>
        </Chart>
    );
};

export default RbcScatter;
