import React from 'react';

let isChanged = [];

export const reportsBuilderCloseHandler = (key) => {
    if (isChangedKey(key))
        return (
            <div>
                <p>Текущий отчёт не сохранён, изменения будут потеряны.</p>
                <div>Вы действительно хотите его закрыть?</div>
            </div>
        );
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