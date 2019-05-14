import React from 'react';
import {
    Chart,
    Geom,
    Axis,
    Tooltip,
    Coord,
    Label,
    Legend,
} from "bizcharts";
import DataSet from "@antv/data-set";

import './ReportsBuilderChart.css';

const RbcPie = ({
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
    if (!valueAxis.length || !valueAxis[0].dataKey || !dataAxis.dataKey)
        return null;

    const { DataView } = DataSet;
    const dv = new DataView();
    dv.source(data).transform({
        type: "percent",
        field: valueAxis[0].dataKey,
        dimension: dataAxis.dataKey,
        as: "percent"
    });

    const content = `${dataAxis.dataKey}*${valueAxis[0].dataKey}`;

    const cols = {
        percent: {
            formatter: val => {
                val = val * 100 + "%";
                return val;
            }
        }
    };

    const round2 = (value) => Math.round(value*100)/100;
    const offset = -(props.height * 0.7 / 2) * 0.5;

    return (
        <Chart
            data={dv}
            scale={cols}
            padding="auto"
            {...props}
        >
            <Coord type="theta" radius={0.9} />
            <Axis name="percent" />
            {isLegendVisible && <Legend
                name={dataAxis.dataKey}
                position="right-top"
            />}
            <Tooltip
                showTitle={false}
                crosshairs={{
                    type: "y"
                }}
            />
            <Geom
                type="intervalStack"
                position="percent"
                color={dataAxis.dataKey}
                style={{
                    lineWidth: 1,
                    stroke: "#fff"
                }}
                tooltip={[content, (data, value) => ({
                    name: `${dataAxis.dataKey} - ${valueAxis[0].dataKey}`,
                    value: `${round2(data)} - ${round2(value)}`
                })]}
            >
                {isShowedDotValues && <Label
                    content={[content, (data, value) => `${round2(data)}: ${round2(value)}`]}
                    offset={offset}
                    textStyle={{
                        rotate: 0,
                        textAlign: "center",
                        shadowBlur: 2,
                        shadowColor: "rgba(0, 0, 0, .45)"
                    }}
                />}
            </Geom>
        </Chart>
    );
}

export default RbcPie;
