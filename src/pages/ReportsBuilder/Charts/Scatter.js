import React from 'react';
import { 
    ScatterChart, 
    Scatter, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend
} from 'recharts';

import './ReportsBuilderChart.css';

const RbcScatter = ({data, ...props}) => (
    <ScatterChart
        margin={{top: 20, right: 20, left: 20, bottom: 20}} {...props}>
        <XAxis dataKey="uv" type="number" name="uv" />
        <YAxis dataKey="pv" type="number" name="pv" />
        <CartesianGrid />
        <Tooltip cursor={{strokeDasharray: "3 3"}}/>
        <Legend />
        <Scatter name='uv' data={data} fill="#8884d8" />
    </ScatterChart>
);

export default RbcScatter;