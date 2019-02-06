import React from 'react';
import connect from 'react-redux/es/connect/connect';

import { 

} from 'Actions/ReportActions';
import { 
    reportTypeSelector,
    chartDataSelector,
    chartNamesSelector,
    dataAxisSelector,
    valueAxisSelector,
    isLegendVisibleSelector,
    isCalculatedXRangeSelector,
    isCalculatedYRangeSelector,
    isShowedDotValuesSelector
} from 'Selectors/ReportsBuilder';

import { applyContext } from './Context';

import ReportChartViewer from '../ReportChartViewer';

class ReportChartViewerWrapper extends React.Component {
    render () {
        const {
            chartNames,
            ...rest
        } = this.props;

        return (
            <ReportChartViewer
                title={chartNames.title}
                dataAxisName={chartNames.dataAxis}
                valueAxisName={chartNames.valueAxis}
                {...rest}
            />
        )
    }
}

export default applyContext(
    connect((state, ownProps) => {
        return {
            type: reportTypeSelector(ownProps.reportId)(state),
            data: chartDataSelector(ownProps.reportId)(state),
            chartNames: chartNamesSelector(ownProps.reportId)(state),
            dataAxis: dataAxisSelector(ownProps.reportId)(state),
            valueAxis: valueAxisSelector(ownProps.reportId)(state),
            isLegendVisible: isLegendVisibleSelector(ownProps.reportId)(state),
            isCalculatedXRange: isCalculatedXRangeSelector(ownProps.reportId)(state),
            isCalculatedYRange: isCalculatedYRangeSelector(ownProps.reportId)(state),
            isShowedDotValues: isShowedDotValuesSelector(ownProps.reportId)(state),
        };
    }, {})(ReportChartViewerWrapper)
);