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
    fieldsDataSelector,
    chartNamesSelector,
    dataAxisSelector,
    valueAxisSelector,
    isLegendVisibleSelector
} from 'Selectors/ReportsBuilder';

import { applyContext } from './Context';

import ChartSettings from './ChartSettings';

class ChartSettingsWrapper extends React.Component {
    constructor(props) {
        super(props);

        if (!props.reportId)
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
                {...rest}
            />
        )
    }
}

export default applyContext(
    connect((state, ownProps) => {
        return {
            axisData: fieldsDataSelector(ownProps.reportId)(state),
            chartNames: chartNamesSelector(ownProps.reportId)(state),
            dataAxis: dataAxisSelector(ownProps.reportId)(state),
            valueAxis: valueAxisSelector(ownProps.reportId)(state),
            isLegendVisible: isLegendVisibleSelector(ownProps.reportId)(state),
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