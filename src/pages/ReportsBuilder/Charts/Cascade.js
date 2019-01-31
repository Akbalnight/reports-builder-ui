import React from 'react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend
} from 'recharts';

import './ReportsBuilderChart.css';

const RbcCascade = ({data, ...props}) => {
    const d = data.map(item => ({
        name: item.name,
        value: [item.uv, item.pv]
    }))

    return (
        <BarChart 
            data={d}
            margin={{top: 5, right: 30, left: 30, bottom: 5}} 
            {...props}>
            <XAxis dataKey="name" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
    );
}

export default RbcCascade;