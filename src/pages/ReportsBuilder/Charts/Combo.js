import React from "react";
import {
    Chart,
    Geom,
    Axis,
    Tooltip,
    Legend,
    Label
} from "bizcharts";
import DataSet from "@antv/data-set";

import {
    getValueDomain,
    prepareChartData
} from '../utils';

import './ReportsBuilderChart.css';

const legendMarkers = {
    'line': 'hyphen',
    'bar': 'square',
    'area': 'circle'
};

export default ({
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
    valueAxis = valueAxis.filter(axis => axis.dataKey && axis.chartType);

    const preparedData = prepareChartData(data, valueAxis, dataAxis);

    const ds = new DataSet();
    const dv = ds.createView().source(preparedData);
    dv.transform({
        type: "map",
        callback: row => ({
            ...row,
            value: Math.max(...valueAxis.map(axis => row[axis.dataKey]))
        })
    });

    const notAutoX = isCalculatedXRange ? {} : {min: 0};
    const notAutoY = isCalculatedYRange ? {} : {min: 0};

    const valueDomain = getValueDomain('line', preparedData, valueAxis, true);
    const minMax = {
        min: valueDomain[0],
        max: valueDomain[1]
    };

    const range = isShowedDotValues ? {range: [0, 0.9]} : {};

    let scales = {
        [dataAxis.dataKey]: {
            alias: dataAxisName || '  ',
            tickCount: 5,
            ...notAutoX
        },
        'value': {
            alias: valueAxisName || '  ',
            ...range,
            ...minMax,
            ...notAutoY
        }
    };

    const legendItems = valueAxis.map(axis => ({
        value: axis.dataKey,
        fill: axis.color,
        marker: legendMarkers[axis.chartType]
    }));

    return (
        <Chart padding='auto' data={dv} scale={scales} {...props}>
            {isLegendVisible && <Legend position="right-top" custom={true} items={legendItems} />}
            <Axis name={dataAxis.dataKey} title={{position: 'center'}} />
            {valueAxis.map((axis, index) => (
                <Axis key={`a_${index}`} name={axis.dataKey} title={{position: 'center'}} />
            ))}
            <Tooltip
                crosshairs={{
                    type: "y"
                }}
            />
            {valueAxis.map((axis, index) => {
                const position = `${dataAxis.dataKey}*${axis.dataKey}`;
                const color = [axis.dataKey, [axis.color]];
                if (axis.chartType === 'area') {
                    return (
                        <Geom
                            key={`la_${index}`}
                            type="area"
                            position={position}
                            color={color}
                            shape="smooth"
                        >
                            {isShowedDotValues && <Label content="value" textStyle={(value, point) => {
                                return {
                                    fill: point.color
                                }
                            }}/>}
                        </Geom>
                    );
                }
                if (axis.chartType === 'bar') {
                    return (
                        <Geom
                            key={`li_${index}`}
                            type="interval"
                            position={position}
                            color={color}
                        >
                            {isShowedDotValues && <Label content="value" textStyle={(value, point) => {
                                return {
                                    fill: point.color
                                }
                            }}/>}
                        </Geom>
                    );
                }
                if (axis.chartType === 'line') {
                    return (
                        <React.Fragment key={`line_${index}`}>
                            <Geom
                                key={`lg_${index}`}
                                type="line"
                                position={position}
                                size={2}
                                color={color}
                                shape="smooth"
                            />
                            <Geom
                                key={`ll_${index}`}
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
                                }}/>}
                            </Geom>
                        </React.Fragment>
                    );
                }
            })}
        </Chart>
    );
};
