import React from 'react';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ArcElement, Tooltip, Legend);

const IncomeExpensePieChart = ({ data, type, className, currency }) => {
    const { incomes, expenses } = data;

    let filteredData;
    let categories;

    if (type === 'income') {
        filteredData = incomes;
        categories = [...new Set(incomes.map(item => item.category))];
    } else if (type === 'expense') {
        filteredData = expenses;
        categories = [...new Set(expenses.map(item => item.category))];
    } else {
        return <div>No data to display</div>;
    }

    const totalAmount = filteredData.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    const chartData = {
        labels: categories,
        datasets: [{
            data: categories.map(category =>
                filteredData
                    .filter(item => item.category === category)
                    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0)
            ),
            backgroundColor: categories.map((_, idx) =>
                `hsl(${(idx * 360) / categories.length}, 70%, 50%)`
            ),
            hoverBackgroundColor: categories.map((_, idx) =>
                `hsl(${(idx * 360) / categories.length}, 80%, 60%)`
            )
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = context.raw;
                        const percentage = ((value / totalAmount) * 100).toFixed(2);
                        return `${value.toFixed(2)} ${currency} (${percentage}%)`;
                    }
                }
            },

        }
    };

    return (
        <div className={className}>
            <Pie options={options} data={chartData} />
            <h2 className='text-center mt-5 text-sm'>{type.charAt(0).toUpperCase() + type.slice(1)} Chart</h2>
        </div>
    );
};

export default IncomeExpensePieChart;
