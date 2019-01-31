import React from 'react';
import { PropTypes } from 'prop-types';

import { Icon, Spin} from 'antd';

const ItemFooter = ({children}) => children;
const ItemActions = ({children}) => children;

const Item = ({icon, title, contentClassName, isLoading, children, contentRef}) => {
    const content = React.Children.toArray(children).filter(item => item.type !== ItemFooter && item.type !== ItemActions)
    const footer = React.Children.toArray(children).filter(item => item.type === ItemFooter);
    const actions = React.Children.toArray(children).filter(item => item.type === ItemActions);
    return (
        <div className="rb-builder-item">
            <div className="rb-builder-item-title">
                {icon && <Icon style={{fontSize: '16px'}} type={icon} />}
                <span>{title}</span>
                {actions && <div className="rb-builder-item-actions">{actions}</div>}
            </div>
            <Spin spinning={isLoading || false}>
                <div className="rb-builder-item-content">
                    <div ref={contentRef} className={contentClassName}>{content}</div>
                    {footer && <div className="rb-builder-item-footer">{footer}</div>}
                </div>
            </Spin>
        </div>
    )
}

Item.propTypes = {
    icon: PropTypes.string,
    title: PropTypes.string,
    contentClassName: PropTypes.string,
    isLoading: PropTypes.bool,
    children: PropTypes.any
}

export { 
    Item,
    ItemFooter,
    ItemActions    
};