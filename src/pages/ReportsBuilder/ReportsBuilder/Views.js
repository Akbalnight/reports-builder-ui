import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import CalculatedField from '../Modals/CalculatedField';

import { Icon, Input } from 'antd';

import './Views.css'

import { getLengthSafe, hasChildren } from '../utils';

const SearchBar = (props) => (
    <Input.Search {...props} />
);

const Text = ({className, disabled, onDoubleClick, children, ...props}) => (
    <div
        className={classNames({className: true, 'rbu-st-text': true, 'rbu-st-disabled': disabled})}
        onDoubleClick={disabled ? null : onDoubleClick}
        {...props}
    >{children}</div>
);

class TreePanel extends React.Component {
    static propTypes = {
        data: PropTypes.any,
        filter: PropTypes.string,
        selectedNodes: PropTypes.array,
        allowedParents: PropTypes.array,
        idFunc: PropTypes.func.isRequired,
        titleFunc: PropTypes.func,
        sortFunc: PropTypes.func,
        onMoveItem: PropTypes.func
    };

    state = {
        collapsed: [],
        allowedNodeId: null
    };

    isShown = (node, filter, showChildren) => {
        return showChildren || (!filter || this.props.titleFunc(node).toLowerCase().includes(filter));
    };

    applyFilterRecursive = (data, filter, showChildren) => {
        return data.map(node => {
            let hasShownChildren = false;

            const isShown = this.isShown(node, filter, showChildren);

            if (Array.isArray(node.children)) {
                hasShownChildren = this.applyFilterRecursive(
                    node.children,
                    filter,
                    isShown);
            }

            if (node.isLeaf) {
                node.isShown = isShown;
                hasShownChildren = hasShownChildren || isShown;
            } else {
                node.isShown = hasShownChildren;
            }

            return hasShownChildren;
        }).some(node => node);
    };

    applyFilter = (data) => {
        if (!data)
            return;

        const filter = this.props.filter
            ? this.props.filter.toLowerCase()
            : null;

        return this.applyFilterRecursive(data, filter, false);
    };

    isCollapsed = (node) => {
        return this.state.collapsed.includes(this.props.idFunc(node));
    }

    defaultRender = ({node, level, disabled, onMoveItem, onCollapseToggle}) => (
        <div
            className="rbu-st-node"
            key={this.props.idFunc(node)}
            level={level}
        >
            <span className={classNames({'rbu-st-expanded': !this.isCollapsed(node)})}>
                {!node.isLeaf && <Icon type="caret-right" onClick={e => onCollapseToggle(node, e)} />}
            </span>
            <Text
                disabled={disabled}
                onDoubleClick={(e) => onMoveItem(node, e)}
            >{this.props.titleFunc(node)}</Text>
        </div>
    );

    renderTreeRecursive = (items, nodes, renderFunc, level) => {
        if (Array.isArray(nodes)) {
            [...nodes].sort(this.props.sortFunc).forEach(node => {
                if (node && node.isShown) {
                    items.push(renderFunc({
                        node,
                        level,
                        disabled: (
                            (!(this.props.allowedParents && this.props.allowedParents.length > 0) && this.state.allowedNodeId && (
                                (!node.parent || this.state.allowedNodeId !== this.props.idFunc(node.parent)) &&
                                this.state.allowedNodeId !== this.props.idFunc(node)
                            )) || (
                                this.props.allowedParents && this.props.allowedParents.length > 0 &&
                                !this.props.allowedParents.some(key => this.props.idFunc(node) === key) &&
                                !this.props.allowedParents.some(key => node.parent && this.props.idFunc(node.parent) === key)
                            ) || (
                                !node.isFirstParent && !node.isLeaf
                            ) || (
                                this.props.selectedNodes && this.props.selectedNodes.includes(this.props.idFunc(node))
                            )
                        ),
                        onMoveItem: this.onMoveItem,
                        onCollapseToggle: this.onCollapseToggle
                    }));
                    if (Array.isArray(node.children) && (this.props.filter || !this.isCollapsed(node))) {
                        this.renderTreeRecursive(items, node.children, renderFunc, level + 1);
                    }
                }
            })
        }
    };

    renderTree = (data, renderFunc) => {
        let items = [];
        renderFunc = renderFunc || this.defaultRender;

        this.applyFilter(data);

        this.renderTreeRecursive(items, data, renderFunc, 0);

        return items;
    };

    getChildrenIds = (nodes) => {
        let result = [];

        if (Array.isArray(nodes)) {
            nodes.forEach(node => {
                result = [
                    ...result,
                    this.props.idFunc(node),
                    ...this.getChildrenIds(node.children)
                ];
            })
        }

        return result;
    };

    getParentsIds = (node) => {
        const result = [];

        while(node) {
            result.push(this.props.idFunc(node))
            node = node.parent;
        }

        return result;
    }

    onMoveItem = (node, e) => {
        this.props.onMoveItem && this.props.onMoveItem(node);
    }

    onCollapseToggle = (node, e) => {
        if (this.isCollapsed(node)) {
            this.setState({
                collapsed: this.state.collapsed.filter(item => item !== this.props.idFunc(node))
            });
        } else {
            this.setState({
                collapsed: [...this.state.collapsed, this.props.idFunc(node)]
            });
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (!props.data) {
            return {};
        }

        let newState = {...state};

        if (props.data !== state.prevPropsData) {
            newState = {
                ...newState,
                checked: [],
                prevPropsData: props.data
            }
        }

        if (props.selectedNodes !== state.prevSelectedNodes) {

            newState = {
                ...newState,
                prevSelectedNodes: props.selectedNodes
            }

            if (!getLengthSafe(props.selectedNodes)) {
                newState = {
                    ...newState,
                    allowedNodeId: null
                }
            } else {
                const findNode = (tree, id, idFunc) => {
                    let node = tree.map(node => {
                        if (idFunc(node) === id)
                            return node;
                        if (hasChildren(node))
                            return findNode(node.children, id, idFunc);
                        return null;
                    });
                    node = node.filter(node => node);
                    if (node)
                        return node[0];
                    return null;
                }

                const node = findNode(props.data, props.selectedNodes[0], props.idFunc);
                newState = {
                    ...newState,
                    allowedNodeId: node && props.idFunc(node.parent)
                }
            }
        }

        return newState;
    }

    render() {
        const {data} = this.props;
        return (
            <div className="rbu-st-content">{this.renderTree(data)}</div>
        );
    }
}

class ReportsBuilderViews extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        title: PropTypes.string,
        data: PropTypes.any,
        selectedNodes: PropTypes.array,
        idFunc: PropTypes.func,
        titleFunc: PropTypes.func,
        sortFunc: PropTypes.func,
        onMoveItem: PropTypes.func
    };

    static defaultProps = {
        idFunc: node => node.title,
        titleFunc: node => node.title
    };

    state = {
        searchString: ''
    };

    onFilterChange = (e) => {
        this.setState({
            searchString: e.target.value
        });
    };

    render() {
        const {
            className,
            data,
            selectedNodes,
            allowedParents,
            idFunc,
            titleFunc,
            onMoveItem
        } = this.props;

        const classes = classNames(['rbu-st-root', className])
        const sortFunc = this.props.sortFunc || ((a, b) => {
            a = titleFunc(a);
            b = titleFunc(b);
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
        });

        return (
            <div className={classes}>
                <div>
                    <CalculatedField visible={this.props.visibleModal} toggleModal={this.props.toggleModal} addField={onMoveItem}/>
                </div>
                <SearchBar
                    className="rbu-st-search-bar"
                    onChange={this.onFilterChange} />
                <TreePanel
                    data={data}
                    filter={this.state.searchString}
                    selectedNodes={selectedNodes}
                    allowedParents={allowedParents}
                    idFunc={idFunc}
                    titleFunc={titleFunc}
                    sortFunc={sortFunc}
                    onMoveItem={onMoveItem} />
            </div>
        );
    }
}

export default ReportsBuilderViews;
