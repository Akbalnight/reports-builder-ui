import { fork, call, put, takeLatest, takeEvery } from 'redux-saga/effects';

import * as types from 'Constants/ReportTypes'
import { setReportsList, setReportsError, setReportsListLoadingState } from 'Actions/ReportActions';
import { deleteReport, storeReport, getReports } from 'Pages/ReportsBuilder/network';

function* fetchReportsHandler() {
    yield put(setReportsListLoadingState(true));
    try {
        const {data} = yield call(getReports);
        yield put(setReportsList(data));
    } catch(e) {
        console.log(e);
        yield put(setReportsError());
    }
    
    yield put(setReportsListLoadingState(false));
}

function* fetchReportsSaga() {
    yield takeLatest(types.REPORTS_LIST_FETCH_REQUESTED, fetchReportsHandler);
}

function* removeReportHandler(action) {
    yield call(deleteReport, action.payload);
    yield call(fetchReportsHandler);
}

function* removeReportSaga() {
    yield takeEvery(types.REMOVE_REPORT_REQUESTED, removeReportHandler);
}

function* storeReportHandler(action) {
    yield call(storeReport, action.payload);
    yield call(fetchReportsHandler);
}

function* storeReportSaga() {
    yield takeEvery(types.STORE_REPORT_REQUESTED, storeReportHandler);
}

const sagas = [fork(fetchReportsSaga), fork(removeReportSaga), fork(storeReportSaga)];
export default sagas;