import React, { Component, Fragment } from 'react';
import { PropTypes } from 'prop-types';
import classNames from 'classnames';

import { Button } from 'antd';

import FieldsWrapper from './FieldsWrapper';
import SettingsWrapper from './SettingsWrapper';
import ViewsWrapper from './ViewsWrapper';
import ViewerWrapper from './ViewerWrapper';
import ReportChartViewerWrapper from './ReportChartViewerWrapper';
import ChartSettingsWrapper from './ChartSettingsWrapper';
import TypeSettingsWrapper from './TypeSettingsWrapper';
import CalculatedField from '../Modals/CalculatedField';

import { Item, ItemActions, ItemFooter } from './Item';

import {
    confirmDialog,
    getCurrentChartIconSafe,
    validateStoringData,
    showValidationError,
    VALIDATION_EMPTY_NAME,
    VALIDATION_NO_TYPE
} from '../Services/Editor';

import './Editor.css';
import './ChartEditor.css';

class Editor extends Component {
    static propTypes = {
        reportId: PropTypes.number,
        reportData: PropTypes.object,
        reportType: PropTypes.string,
        onCancel: PropTypes.func,
        requestReportsList: PropTypes.func,
        changeSettingsTab: PropTypes.func
    }

    constructor(props) {
        super(props);

        let state;
        if (props.reportId > 0) {
            state = {
                isChartView: true,
                typeSettingsVisible: false,
            };
        } else {
            state = {
                isChartView: false,
                typeSettingsVisible: true,
            };
        }

        this.state = {
            ...state,
            isReportViewMaximized: false,
            isChartViewMaximized: false,
            visibleModal: false
        }
    }

    maximizeReportView = (e) => {
        this.setState({ isReportViewMaximized: true });
    }

    normalizeReportView = (e) => {
        this.setState({ isReportViewMaximized: false });
    }

    maximizeChartView = (e) => {
        setTimeout(() => {this.setState({ isChartViewMaximized: true })}, 0);
    }

    normalizeChartView = (e) => {
        this.setState({ isChartViewMaximized: false });
    }

    typeSettingsOpenHandler = () => {
        this.setState({
            typeSettingsVisible: true
        })
    }

    typeSettingsCloseHandler = () => {
        this.setState({
            typeSettingsVisible: false
        })
    }

    // Chart methods
    tableViewHandler = () => {
        this.setState({
            isChartView: false,
            isReportViewMaximized: false,
            isChartViewMaximized: false
        });
    }

    chartViewHandler = () => {
        if (!this.props.reportType || this.props.reportType === 'table') {
            this.setState({
                typeSettingsVisible: true
            });
        } else {
            this.setState({
                isChartView: true,
                isReportViewMaximized: false,
                isChartViewMaximized: false
            });
        }
    }

    tabChangeHandler = (key) => {
        if (key === 'settings') {
            this.typeSettingsOpenHandler();
        } else {
            this.props.changeSettingsTab(key);
        }
    }

    toggleModal = () => {
        this.setState({
            visibleModal: !this.state.visibleModal
        })
    }

    cancelHandler = () => {
        if (this.props.isChanged) {
            confirmDialog({
                content: '?????????????? ?????????????????? ?????????? ????????????????. ???? ?????????????????????????? ???????????? ???????????????? ???????????????????',
                onOk: () => {
                    this.terminateHandler();
                },
                onCancel: () => { }
            });
            return;
        }
        this.terminateHandler();
    }

    terminateHandler = () => {
        this.props.onCancel && this.props.onCancel();
    }

    saveHandler = () => {
        const isValid = validateStoringData(this.props.editorState);
        if (isValid === true) {
            this.props.requestSave();
        } else {
            const showError = () => showValidationError(isValid);
            if (isValid === VALIDATION_EMPTY_NAME || isValid === VALIDATION_NO_TYPE) {
                this.setState({
                    typeSettingsVisible: true,
                    validationStatus: isValid
                }, showError);
            }
            else {
                showError();
            }
        }
    }

    // Views
    Preview = ({title, icon}) => {
        const isTable = this.props.reportType === 'table';
        const isTableView = !this.props.reportType || isTable || !this.state.isChartView;
        return (<div
            className="rbu-builder-editor-preview">
            <Item title={title} icon={icon} contentRef={node => this.divContaner = node}>
                <ViewerWrapper pagination={false} />
                <ItemActions>
                    {!this.state.isReportViewMaximized && <a href="#" onClick={this.maximizeReportView}>???????????????????? ????????</a>}
                    {this.state.isReportViewMaximized && <a href="#" onClick={this.normalizeReportView}>???????????????? ????????</a>}
                </ItemActions>
                <ItemFooter>
                    <Button size="small" onClick={this.cancelHandler}>????????????</Button>
                    {!isTable && isTableView && <Button size="small" onClick={this.chartViewHandler}>??????????</Button>}
                    {!isTable && !isTableView && <Button size="small" onClick={this.tableViewHandler}>?????????????? ?? ???????????? ????????????</Button>}
                    <Button type="primary" onClick={this.saveHandler}>??????????????????</Button>
                </ItemFooter>
            </Item>
        </div>
        )
    }

    Chart = () => (<div className="rbu-builder-editor-chart">
        <Item
            title="????????????????????????"
            icon="bars"
            contentClassName="rbu-builder-item-content-stretch">
            <ItemActions>
                {!this.state.isChartViewMaximized && <a href="#" onClick={this.maximizeChartView}>???????????????????? ????????</a>}
                {this.state.isChartViewMaximized && <a href="#" onClick={this.normalizeChartView}>???????????????? ????????</a>}
                <this.SettingsButton />
            </ItemActions>
            <ReportChartViewerWrapper />
        </Item>
    </div>);

    SettingsButton = () => {
        const icon = getCurrentChartIconSafe(this.props.reportType);
        return (
            <Button
                className={classNames("rbu-builder-editor-type-settings", icon.className)}
                size='small'
                type='ghost'
                shape={null}
                icon={icon.icon}
                onClick={this.typeSettingsOpenHandler}>??????????????????</Button>
        )
    }

    TableEditor = () => (
        <Fragment>
        {!this.state.isReportViewMaximized &&
            <Fragment>
                <div className="rbu-builder-editor-views">
                    <Item
                        title="?????????????????? ????????"
                        icon="database"
                        contentClassName="rbu-builder-item-views">
                        <ViewsWrapper selectsOnlySiblings={true} visibleModal={this.state.visibleModal} toggleModal={this.toggleModal}/>
                    </Item>
                </div>
                <div className="rbu-builder-editor-configuration">
                    <div className="rbu-builder-editor-configuration-fields">
                        <div className="rbu-builder-editor-fields">
                            <Item title="???????????????????? ????????" icon="bars">
                                <FieldsWrapper title="????????" />
                                <ItemActions>
                                    {<a href="#" onClick={this.toggleModal}>???????????????? ?????????????????????? ????????</a>}
                                </ItemActions>
                            </Item>
                        </div>
                        <div className="rbu-builder-editor-settings">
                            <SettingsWrapper onTabChange={this.tabChangeHandler} />
                            <this.SettingsButton />
                        </div>
                    </div>
                    <this.Preview title="????????????????????????" icon="desktop" />
                </div>
            </Fragment>
        }
        {this.state.isReportViewMaximized && <this.Preview title="????????????????????????" icon="desktop" />}
        </Fragment>
    )

    ChartEditor = () => (
        <Fragment>
            {!this.state.isReportViewMaximized && !this.state.isChartViewMaximized &&
            <Fragment>
                <div className="rbu-builder-editor-chart-settings">
                    <Item
                        title="??????????????????"
                        icon="database"
                        contentClassName="rbu-builder-item-views">
                        <ChartSettingsWrapper />
                    </Item>
                </div>
                <div className="rbu-builder-editor-chart-view">
                    <this.Chart />
                    <div className="rbu-builder-editor-chart-preview">
                        <this.Preview title="???????????????????? ????????????" icon="database" />
                    </div>
                </div>
            </Fragment>}
            {this.state.isReportViewMaximized && <this.Preview title="???????????????????? ????????????" icon="database" />}
            {this.state.isChartViewMaximized && <this.Chart />}
        </Fragment>
    )

    render() {
        return (
            <div className="rbu-builder-type-root">
                <TypeSettingsWrapper
                    visible={this.state.typeSettingsVisible}
                    highlightName={this.state.validationStatus === VALIDATION_EMPTY_NAME}
                    highlightTypes={this.state.validationStatus === VALIDATION_NO_TYPE}
                    onClose={this.typeSettingsCloseHandler}
                    onTerminate={this.terminateHandler}
                />
                <div className="rbu-builder-editor">
                    {!this.props.reportType || this.props.reportType === 'table' || !this.state.isChartView
                        ? <this.TableEditor />
                        : <this.ChartEditor />
                    }
                </div>
            </div>
        );
    }
};

export default Editor;

