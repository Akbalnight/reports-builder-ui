import React from 'react';

export const BuilderContext = React.createContext({
    reportId: null
});

export const wrapContext = (Component) => {
    return class extends React.Component {
        render() {
            const { reportId, ...rest } = this.props;
            return (
                <BuilderContext.Provider value={{reportId}}>
                    <Component {...rest} />
                </BuilderContext.Provider>
            );
        }
    }
}

export const applyContext = (Component) => {
    return function (props) {
        return (
            <BuilderContext.Consumer>
                {
                    context => {
                        const id = (context && context.reportId) || 0;
                        return <Component {...props} reportId={id} context={context} />
                    }
                }
            </BuilderContext.Consumer>
        );
    }
}
