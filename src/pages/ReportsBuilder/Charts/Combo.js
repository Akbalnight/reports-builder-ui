import React from 'react';
import { 
    ComposedChart,
    Area, 
    Bar, 
    Line,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend
} from 'recharts';

import './ReportsBuilderChart.css';

const RbcCombo = ({data, ...props}) => (
    <ComposedChart 
        data={data}
        margin={{top: 5, right: 30, left: 30, bottom: 5}} 
        {...props}>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="pv" fill="#8884d8" stroke="#8884d8" />
        <Bar dataKey="uv" barSize={20} fill="#413ea0" />
        <Line type="monotone" dataKey="amt" fill="#ff7300" />
    </ComposedChart>
);

export default RbcCombo;