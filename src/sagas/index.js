import reportListSagas from './ReportsList';
import subsystemsSagas from './Subsystems';
import editorSagas from './Editor';
import storageSagas from './Storage'

const reportSagas = [...reportListSagas, ...subsystemsSagas, ...editorSagas, ...storageSagas];
export { reportSagas };