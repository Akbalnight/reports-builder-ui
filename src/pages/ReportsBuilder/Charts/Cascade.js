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

const RbcCascade = ({
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

    const valueKeys= [];
    const addKey = (key, axis) => {
        if(!valueKeys.find(row => row.key === key))
            valueKeys.push({
                key,
                color1: axis.color,
                color2: axis.color2
            });
    };

    dv.transform({
        type: "map",
        callback: row => {
            let result = {
                ...row
            };
            valueAxis.forEach((axis, index) => {
                const key = `${axis.dataKey} - ${axis.dataKey2}`;
                addKey(key, axis);
                result = {
                    ...result,
                    [key]: [row[axis.dataKey], row[axis.dataKey2]]
                }
            });

            return result;
        }
    }).transform({
        type: "fold",
        fields: valueKeys.map(key => key.key),
        key: "chart",
        value: "value",
        retains: [dataAxis.dataKey, 'colors']
    });

    const position = `${dataAxis.dataKey}*value`;
    const color = ['chart*value', (chart, value) => {
        if (!value) return;
        const chartObj = valueKeys.find(key => key.key === chart);
        if (!chartObj) return;
        return value[0] < value[1] ? chartObj.color1 : chartObj.color2;
    }];
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

    const legendItems = [];
    valueAxis.forEach(axis => {
        legendItems.push({
            value: `${axis.dataKey} < ${axis.dataKey2}`,
            fill: axis.color,
            marker: 'square'
        });
        legendItems.push({
            value: `${axis.dataKey} > ${axis.dataKey2}`,
            fill: axis.color2,
            marker: 'square'
        });
    });

    return (
        <Chart padding="auto" scale={scales} data={dv} {...props}>
            {isLegendVisible && <Legend
                custom={true}
                position="right-top"
                items={legendItems}
            />
            }
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
                tooltip="value"
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

export default RbcCascade;
