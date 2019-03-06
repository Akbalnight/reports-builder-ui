let isChanged = [];

export const reportsBuilderCloseHandler = (key) => {
    if (isChangedKey(key))
        return "Текущий отчёт не сохранён, изменения будут потеряны.\n Вы действительно хотите его закрыть?"
};

export const setChangedKey = (key) => {
    if (!isChanged.includes(key))
        isChanged.push(key);
}

export const clearChangedKey = (key) => {
    isChanged = isChanged.filter(item => item !== key);
}

export const isChangedKey = (key) => {
    return isChanged.includes(key);
}