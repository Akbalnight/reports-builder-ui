import { settings } from 'Settings';

const prefix = () => settings.get().reportApiPrefix;

export const reportsUrl = () => `${prefix()}/reports`;
export const previewUrl = (withTotal) => withTotal
    ? `${prefix()}/reports/_previewWithTotal`
    : `${prefix()}/reports/_preview`;
export const reportUrl = (id) => `${prefix()}/reports/${id}`;
export const executeUrl = (id, withTotal) => withTotal
    ? `${prefix()}/reports/${id}/_executeWithTotal`
    : `${prefix()}/reports/${id}/_execute`;

export const executeAsyncUrl = (id) => `${prefix()}/reports/${id}/_executeAsync`;

export const subsystemsUrl = () => `${prefix()}/subsystems`;
export const tableUrl = (name) => `${prefix()}/tables/${name}`;

export const getSubsystems = () => settings.get().doGet(subsystemsUrl());
export const storeReport = (data) => {
    if (data.id)
        return settings.get().doPut(reportUrl(data.id), data);
    else
        return settings.get().doPost(reportsUrl(), data);
}
export const getReport = (id) => settings.get().doGet(reportUrl(id));
export const getReports = () => settings.get().doGet(reportsUrl());
export const getPreviewWithTotal = (data) => settings.get().doPost(previewUrl(true), data);
export const deleteReport = (id) => settings.get().doDelete(reportUrl(id));
