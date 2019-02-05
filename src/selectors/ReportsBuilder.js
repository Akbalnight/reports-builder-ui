export const subsystemsSelector = state => state.reports.subsystems;

export const reportDataSelector  = reportId => state => state.reports.editors[reportId];
export const isReportInitializedSelector  = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].isReportInitialized;
export const reportNameSelector  = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].reportName;
export const reportTypeSelector  = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].reportType;
export const isChangedSelector  = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].isChanged;
export const isPublicSelector  = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].isPublic;
export const isFavoriteSelector  = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].isFavorite;

export const editorStateSelector = reportId => store => store.reports.editors[reportId];
export const keyCounterSelector  = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].keyCounter;
export const selectedNodesSelector = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].viewsSelected;
export const allowedParentsSelector = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].viewsAllowedParents;
export const fieldsDataSelector = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].fieldsData;
export const tableNameSelector = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].tableName;

export const settingsTabSelector = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].settingsTab;
export const filterDataSelector = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].filterData;
export const sortDataSelector = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].sortData;
export const groupDataSelector = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].groupData;
export const totalDataSelector = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].totalData;

export const chartDataSelector = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].chartData;
export const chartNamesSelector = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].chartNames;
export const dataAxisSelector = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].dataAxis;
export const valueAxisSelector = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].valueAxis;
export const isLegendVisibleSelector = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].isLegendVisible;
export const isCalculatedXRangeSelector = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].isCalculatedXRange;
export const isCalculatedYRangeSelector = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].isCalculatedYRange;
export const isShowedDotValuesSelector = reportId => state => state.reports.editors[reportId] && state.reports.editors[reportId].isShowedDotValues;
