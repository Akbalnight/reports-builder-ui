import React from "react";
import {
    Chart,
    Geom,
    Axis,
    Tooltip,
    Label,
    Coord,
    Legend,
} from "bizcharts";
import DataSet from "@antv/data-set";
import {prepareChartData, getValueDomain} from "../utils";

import './ReportsBuilderChart.css';

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

    const range = isShowedDotValues ? {range: [0, 0.9]} : {};

    let minMax = {};
    if (isCalculatedYRange) {
        const valueDomain = getValueDomain('bar', preparedData, valueAxis, isCalculatedYRange);
        minMax.min = valueDomain[0];
        minMax.max = valueDomain[1];
    }

    const scales = {
        [dataAxis.dataKey]: {
            alias: dataAxisName || '  ',
            tickCount: 5,
            type: 'cat'
        },
        'value': {
            alias: valueAxisName || '  ',
            ...range,
            ...minMax
        }
    };
    return (
        <Chart padding="auto" scale={scales} data={dv} {...props}>
            {isLegendVisible && <Legend position="right-top" />}
            <Axis name={dataAxis.dataKey} title={{position: 'center'}} />
            <Axis name="value" title={{position: 'center'}} />
            <Tooltip
                crosshairs={{
                    type: "y"
                }}
            />
            <Geom
                type="interval"
                position={position}
                color={color}
                adjust={[
                    {
                        type: "dodge",
                        marginRatio: 1 / 32
                    }
                ]}
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

const RbcHBar  = ({
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

    const range = isShowedDotValues ? {range: [0, 0.9]} : {};

    let minMax = {};
    if (isCalculatedXRange) {
        const valueDomain = getValueDomain('bar', preparedData, valueAxis, isCalculatedXRange);
        minMax.min = valueDomain[0];
        minMax.max = valueDomain[1];
    }

    const scales = {
        [dataAxis.dataKey]: {
            alias: valueAxisName || '  ',
            tickCount: 5,
            type: 'cat'
        },
        'value': {
            alias: dataAxisName || '  ',
            ...range,
            ...minMax
        }
    };

    return (
        <Chart padding="auto" scale={scales} data={dv} {...props}>
            <Coord transpose scale={[1, -1]} />
            {isLegendVisible && <Legend position="right-top" />}
            <Axis name={dataAxis.dataKey} title={{
                position: 'center'
            }} label={{
                offset: 12,
                autoRotate: false
            }} />
            <Axis name="value" title={{position: 'center'}} position="right" />
            <Tooltip
                crosshairs={{
                    type: "y"
                }}
            />
            <Geom
                type="interval"
                position={position}
                color={color}
                adjust={[
                    {
                        type: "dodge",
                        marginRatio: 1 / 32
                    }
                ]}
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

export {
    RbcBar,
    RbcHBar
};
