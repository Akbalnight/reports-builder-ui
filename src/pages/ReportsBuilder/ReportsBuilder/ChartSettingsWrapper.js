import React from 'react';
import connect from 'react-redux/es/connect/connect';

import { 
    setValue,
    setAxisName,
    requestSetAxisDataKey,
    requestAddValueAxis,
    requestRemoveValueAxis,
    requestChangeValueAxis
} from 'Actions/ReportActions';
import {
    reportTypeSelector,
    fieldsDataSelector,
    chartNamesSelector,
    dataAxisSelector,
    valueAxisSelector,
    isLegendVisibleSelector,
    isCalculatedXRangeSelector,
    isCalculatedYRangeSelector,
    isShowedDotValuesSelector
} from 'Selectors/ReportsBuilder';

import { applyContext } from './Context';

import ChartSettings from './ChartSettings';

class ChartSettingsWrapper extends React.Component {
    constructor(props) {
        super(props);

        if (!props.reportId && (!props.valueAxis || props.valueAxis.length === 0 ))
            props.addValueAxis();
    }

    changeStringValue = (stateName) => (e) => {
        this.props.setAxisName(stateName, e.target.value);
    }

    chartTitleHandler = this.changeStringValue('title');
    dataAxisNameHandler = this.changeStringValue('dataAxis');
    valueAxisNameHandler = this.changeStringValue('valueAxis');

    legendVisibilityHandler = (e) => {
        this.props.setValue('isLegendVisible', e.target.checked);
    }

    calculateXRangeHandler = (e) => {
        this.props.setValue('isCalculatedXRange', e.target.checked);
    }

    calculateYRangeHandler = (e) => {
        this.props.setValue('isCalculatedYRange', e.target.checked);
    }

    showDotValuesHandler = (e) => {
        this.props.setValue('isShowedDotValues', e.target.checked);
    }

    render () {
        const {
            chartNames,
            dataAxis,
            setAxisDataKey,
            addValueAxis,
            removeValueAxis,
            changeValueAxis,
            ...rest
        } = this.props;

        return (
            <ChartSettings
                chartTitle={chartNames.title}
                dataAxisName={chartNames.dataAxis}
                valueAxisName={chartNames.valueAxis}

                onChartTitleChange={this.chartTitleHandler}
                onDataAxisNameChange={this.dataAxisNameHandler}
                onValueAxisNameChange={this.valueAxisNameHandler}

                dataAxisKey={dataAxis.dataKey}
                onDataAxisKeyChange={setAxisDataKey}

                onValueAxisAdd={addValueAxis}
                onValueAxisRemove={removeValueAxis}
                onValueAxisChange={changeValueAxis}

                onLegendVisibilityChange={this.legendVisibilityHandler}
                onCalculateXRangeChange={this.calculateXRangeHandler}
                onCalculateYRangeChange={this.calculateYRangeHandler}
                onShowDotValuesChange={this.showDotValuesHandler}
                {...rest}
            />
        )
    }
}

export default applyContext(
    connect((state, ownProps) => {
        return {
            type: reportTypeSelector(ownProps.reportId)(state),
            axisData: fieldsDataSelector(ownProps.reportId)(state),
            chartNames: chartNamesSelector(ownProps.reportId)(state),
            dataAxis: dataAxisSelector(ownProps.reportId)(state),
            valueAxis: valueAxisSelector(ownProps.reportId)(state),
            isLegendVisible: isLegendVisibleSelector(ownProps.reportId)(state),
            isCalculatedXRange: isCalculatedXRangeSelector(ownProps.reportId)(state),
            isCalculatedYRange: isCalculatedYRangeSelector(ownProps.reportId)(state),
            isShowedDotValues: isShowedDotValuesSelector(ownProps.reportId)(state),
        };
    }, (dispatch, ownProps) => {
        return { 
            setValue: (...args) => dispatch(setValue(ownProps.reportId, ...args)),
            setAxisName: (...args) => dispatch(setAxisName(ownProps.reportId, ...args)),
            setAxisDataKey: (...args) => dispatch(requestSetAxisDataKey(ownProps.reportId, ...args)),
            addValueAxis: (...args) => dispatch(requestAddValueAxis(ownProps.reportId, ...args)),
            removeValueAxis: (...args) => dispatch(requestRemoveValueAxis(ownProps.reportId, ...args)),
            changeValueAxis: (...args) => dispatch(requestChangeValueAxis(ownProps.reportId, ...args))
        };
    })(ChartSettingsWrapper)
);
