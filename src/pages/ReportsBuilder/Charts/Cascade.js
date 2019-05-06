import React from "react";
import {
    Chart,
    Geom,
    Axis,
    Tooltip,
    Label,
    Coord,
    Legend,
    Shape,
    Util
} from "bizcharts";
import {prepareChartData, getValueDomain} from "../utils";

import './ReportsBuilderChart.css';

const getRectPath = (points) => {
    const path = [];

    for (let i = 0; i < points.length; i++) {
        const point = points[i];

        if (point) {
            const action = i === 0 ? "M" : "L";
            path.push([action, point.x, point.y]);
        }
    }

    const first = points[0];
    path.push(["L", first.x, first.y]);
    path.push(["z"]);
    return path;
};

const getFillAttrs = (cfg) => {
    const defaultAttrs = Shape.interval;
    const attrs = Util.mix(
        {},
        cfg.style,
        defaultAttrs,
        {
            fill: cfg.color,
            stroke: cfg.color,
            fillOpacity: cfg.opacity,
        }
    );
    return attrs;
};

Shape.registerShape("interval", "waterfall", {
    draw(cfg, container) {
        const attrs = getFillAttrs(cfg);
        let rectPath = getRectPath(cfg.points);
        rectPath = this.parsePath(rectPath);
        const interval = container.addShape("path", {
            attrs: Util.mix(attrs, {
                path: rectPath
            })
        });

        if (cfg.nextPoints) {
            let linkPath = [
                ["M", cfg.points[2].x, cfg.points[2].y],
                ["L", cfg.nextPoints[0].x, cfg.nextPoints[0].y]
            ];

            if (cfg.nextPoints[0].y === cfg.nextPoints[2].y) {
                linkPath[1][1] = cfg.nextPoints[3].x;
            }

            linkPath = this.parsePath(linkPath);
            container.addShape("path", {
                attrs: {
                    path: linkPath,
                    stroke: "rgba(0, 0, 0, 0.45)",
                    lineDash: [2, 2]
                }
            });
        }

        return interval;
    }
});

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
    if (!valueAxis.length || !dataAxis.dataKey)
        return <div></div>;

    const preparedData = prepareChartData(data, valueAxis, dataAxis);

    const valueAxisFirst = valueAxis[0];

    const valueDataKey = valueAxisFirst.dataKey;

    for (let i = 0; i < preparedData.length; i++) {
        const item = preparedData[i];

        item[dataAxis.dataKey] = '' + item[dataAxis.dataKey];

        if (i === 0) {
            preparedData[i][valueDataKey] = [0, preparedData[i][valueDataKey], 'first'];
        }

        else if (i > 0 && i < preparedData.length) {
            if (Util.isArray(preparedData[i - 1][valueDataKey])) {
                item[valueDataKey] = [
                    preparedData[i - 1][valueDataKey][1],
                    item[valueDataKey]
                ];
            } else {
                item[valueDataKey] = [preparedData[i - 1][valueDataKey], item[valueDataKey]];
            }
        }
    }

    if (preparedData.length > 0) {
        const lastItem = preparedData[preparedData.length - 1];
        preparedData.push({
            [dataAxis.dataKey]: 'Итог',
            [valueDataKey]: [lastItem[valueDataKey][1], 0, 'last']
        })
    }

    const position = `${dataAxis.dataKey}*${valueDataKey}`;
    const color = [position, (chart, value) => {
        if (!Array.isArray(value) || value[2] === 'last')
            return valueAxisFirst.colorTotal;

        if (value[2] === 'first')
            return valueAxisFirst.colorInitial;

        if (!value) return;
        return value[0] < value[1] ? valueAxisFirst.color : valueAxisFirst.colorNegative;
    }];
    const range = isShowedDotValues ? {range: [0, 0.9]} : {};

    const scales = {
        [dataAxis.dataKey]: {
            alias: dataAxisName || '  ',
            tickCount: 5
        },
        [valueDataKey]: {
            alias: valueAxisName || '  ',
            ...range
        }
    };

    const legendItems = [];
    valueAxis.forEach(axis => {
        legendItems.push({
            value: 'Рост',
            fill: axis.color,
            marker: 'square'
        });
        legendItems.push({
            value: 'Спад',
            fill: axis.colorNegative,
            marker: 'square'
        });
        legendItems.push({
            value: 'Начало',
            fill: axis.colorInitial,
            marker: 'square'
        });
        legendItems.push({
            value: 'Итог',
            fill: axis.colorTotal,
            marker: 'square'
        });
    });

    return (
        <Chart padding="auto" scale={scales} data={preparedData} {...props}>
            {isLegendVisible && <Legend
                custom={true}
                position="right-top"
                items={legendItems}
            />
            }
            <Axis name={dataAxis.dataKey} title={{position: 'center'}} />
            <Axis name={valueDataKey} title={{position: 'center'}} />
            <Tooltip
                crosshairs={{
                    type: "y"
                }}
            />
            <Geom
                type="interval"
                position={position}
                color={color}
                tooltip={[position, (data, value) => ({
                    value: data === 'Итог' ? value[0] - value[1] : value[1] - value[0]
                })]}
                shape="waterfall"
            >
                {isShowedDotValues && <Label content={valueDataKey} textStyle={(value, point) => {
                    return {
                        fill: point.color
                    }
                }} />}
            </Geom>
        </Chart>
    );
};

export default RbcCascade;
