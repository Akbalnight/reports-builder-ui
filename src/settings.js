const methodIsNotSet = (name) => () => console.error(`The ${name} method isn't set`);

let _settings = {
    doGet: methodIsNotSet('doGet'),
    doPost: methodIsNotSet('doPost'),
    doPut: methodIsNotSet('doPut'),
    doDelete: methodIsNotSet('doDelete'),
    doExport: methodIsNotSet('doExport'),
    onReportEdit: methodIsNotSet('onReportEdit'),
    noDataImage: null,
    notBuildImage: null,
    reportImages: null,
    apiPrefix: null,
    reportApiPrefix: null
};

const get = () => _settings;
const set = (newSettings) => {
    _settings = {
        ..._settings,
        ...newSettings
    }
}

const settings = { get, set };

export { settings };
