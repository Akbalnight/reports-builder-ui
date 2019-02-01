import React from 'react';
import { PropTypes } from 'prop-types';

import { ResponsiveContainer } from 'recharts';

import RbcLinear from './Charts/Linear';
import { RbcBar, RbcHBar } from './Charts/Bar';
// import RbcCascade from './Charts/Cascade';
// import RbcPie from './Charts/Pie';
// import RbcCombo from './Charts/Combo';
// import RbcScatter from './Charts/Scatter';

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
            isLegendVisible
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
            isLegendVisible
        };

        switch (type) {
            case 'linear':
                return <RbcLinear {...props} />
            case 'bar':
                return <RbcBar {...props} />
            case 'hbar':
                return <RbcHBar {...props} />
            // TODO: Disabled temporarily
            /*case 'cascade':
                return <RbcCascade data={data} />
            case 'pie':
                return <RbcPie data={data} />
            case 'combo':
                return <RbcCombo data={data} />
            case 'scatter':
                return <RbcScatter data={data} />*/
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