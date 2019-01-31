import React from 'react';
import { PropTypes } from 'prop-types';
import classNames from 'classnames';

import './ResponsibleContainer.css';

const classes = {
    noflex: {
        wrapper: 'rbu-rc-wrapper',
        tracker: 'rbu-rc-tracker',
        container: 'rbu-rc-container'
    },
    flex: {
        wrapper: 'rbu-rcf-wrapper',
        tracker: 'rbu-rcf-tracker',
        container: 'rbu-rcf-container'
    }
}

class ResponsibleContainer extends React.Component {
    static trigger = () => {
        const resizeEvent = window.document.createEvent('UIEvents'); 
        resizeEvent.initUIEvent('resize', true, false, window, 0); 
        window.dispatchEvent(resizeEvent);
    }

    static propTypes = {
        flexChildren: PropTypes.bool,
        wrapperClassName: PropTypes.string,
        pause: PropTypes.number,
        className: PropTypes.string,
        children: PropTypes.func,
        onResize: PropTypes.func,
    }

    static defaultProps = {
        flexChildren: true,
        pause: 100
    }

    state = {
        width: null,
        height: null
    }

    needResize = false;

    trackerRef = null;

    debounce = (func, wait, immediate) => {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    pollResize = () => {
        this.needResize = false;
        this.windowResizeHandler();
    }

    windowResizeHandler = this.debounce(() => {
        if (this.trackerRef) {
            const width = this.trackerRef.offsetWidth;
            const height = this.trackerRef.offsetHeight;

            if (!width && !height) {
                this.needResize = true;
                this.pollResize();
            }
            else {
                this.setState({
                    width,
                    height
                }, () => {
                    if (this.props.onResize && this.props.children.length === 1) {
                        this.props.onResize({render: this.props.children, width, height});
                    }
                });
            }
        }
    }, this.props.pause);

    componentDidMount() {
        this.windowResizeHandler();
        window.addEventListener('resize', this.windowResizeHandler);
    }
    componentDidUpdate() {
        if (this.needResize) {
            this.needResize = false;
            this.windowResizeHandler();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.windowResizeHandler);
    }

    render() {
        if (this.props.children.length) {
            const _classes = classes[this.props.flexChildren ? 'flex' : 'noflex'];
            const wrapperClass = classNames(_classes.wrapper, this.props.wrapperClassName);
            const containerClass = classNames(_classes.container, this.props.className);

            if (this.props.children.length > 1) throw new Error('You can use only one render func');

            return <div className={wrapperClass}>
                <div className={_classes.tracker} ref={ref => this.trackerRef = ref}></div>
                <div className={containerClass}>
                    {this.props.children({
                        width: this.state.width,
                        height: this.state.height
                    })}
                </div>
            </div>;
        }
        
        return <div></div>;
    }
}

export default ResponsibleContainer;