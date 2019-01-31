import React from 'react';
import { 
    PieChart, 
    Pie
} from 'recharts';

import './ReportsBuilderChart.css';

const RbcPie = ({data, ...props}) => {
    return (
        <PieChart {...props}>
            <Pie 
                startAngle={0}
                endAngle={360} 
                data={data} 
                dataKey="uv"
                fill="#8884d8" label />
        </PieChart>
    );
}

export default RbcPie;