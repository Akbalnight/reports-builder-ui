import React from 'react';
import { PropTypes } from 'prop-types';

import { ResponsiveContainer } from 'recharts';

import RbcLinear from './Charts/Linear';
import { RbcBar, RbcHBar } from './Charts/Bar';
import RbcCascade from './Charts/Cascade';
import RbcPie from './Charts/Pie';
import RbcCombo from './Charts/Combo';
import RbcScatter from './Charts/Scatter';

class ReportChartViewer extends React.Component {
    static propTypes = {
        type: PropTypes.string,
        dataAxis: PropTypes.shape({
            dataKey: PropTypes.string,
            dataType: PropTypes.string,
            dataTitle: PropTypes.string
        }).isRequired,
        valueAxis: PropTypes.arrayOf(
            PropTypes.shape({
                dataKey: PropTypes.string,
                color: PropTypes.string,
                name: PropTypes.string
            })
        ).isRequired,
        data: PropTypes.any,
        dataAxisName: PropTypes.string,
        valueAxisName: PropTypes.string,
        isLegendVisible: PropTypes.bool,
        isCalculatedXRange: PropTypes.bool,
        isCalculatedYRange: PropTypes.bool,
        isShowedDotValues: PropTypes.bool
    }

    numericTypes = ['numeric', 'date'];
    getChart() {
        const {
            type, 
            dataAxis, 
            valueAxis, 
            data,
            dataAxisName,
            valueAxisName,
            isLegendVisible,
            isCalculatedXRange,
            isCalculatedYRange,
            isShowedDotValues
        } = this.props;

        const props = {
            valueAxis,
            dataAxis: {
                dataKey: dataAxis.dataKey,
                dataType: this.numericTypes.includes(dataAxis.dataType) ? 'number' : 'category',
                dataOriginalType: dataAxis.dataType,
                dataTitle: dataAxis.dataTitle
            },
            data,
            dataAxisName,
            valueAxisName,
            isLegendVisible,
            isCalculatedXRange,
            isCalculatedYRange,
            isShowedDotValues
        };

        switch (type) {
            case 'linear':
                return <RbcLinear {...props} />
            case 'bar':
                return <RbcBar {...props} />
            case 'hbar':
                return <RbcHBar {...props} />
            case 'cascade':
                return <RbcCascade {...props} />
            case 'combo':
                return <RbcCombo {...props} />
            case 'pie':
                return <RbcPie {...props} />
            case 'scatter':
                return <RbcScatter {...props} />
            default:
                return (<div></div>);
        }
    }

    render() {
        return (
            <div className="rbu-chart-root">
                <p>{this.props.title}</p>
                <div>
                    <ResponsiveContainer
                        className="rbu-chart-area" 
                        width="99%" 
                        height="100%"
                        debounce={300}>
                        {this.getChart()}
                    </ResponsiveContainer>
                </div>
            </div>
        )
    }
}

export default ReportChartViewer;
