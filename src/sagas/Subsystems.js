import { fork, call, put, takeLatest } from 'redux-saga/effects';

import * as types from 'Constants/ReportTypes'
import { setSubsystemsLoading, setSubsystems } from 'Actions/ReportActions';
import { getSubsystems } from 'Pages/ReportsBuilder/network';
import { normalizeTree, prepareTree } from 'Pages/ReportsBuilder/utils';

export function* fetchSubsystems(action) {
    yield put(setSubsystemsLoading(true));
    try {
        const {data} = yield call(getSubsystems);
        const tree = normalizeTree(prepareTree(data).children);
        yield put(setSubsystems(tree));
    } catch (e) {
        // process error
    }
    yield put(setSubsystemsLoading(true));
}

function* fetchSubsystemsSaga() {
    yield takeLatest(types.SUBSYSTEMS_FETCH_REQUESTED, fetchSubsystems);
}

const sagas = [fork(fetchSubsystemsSaga)];
export default sagas;
