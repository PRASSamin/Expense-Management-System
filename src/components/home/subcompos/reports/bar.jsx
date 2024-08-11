import React, { useState } from 'react';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import dayjs from 'dayjs';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const monthOrder = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const processData = (data, selectedYear) => {
  const monthlyIncome = {};
  const monthlyExpense = {};
  const yearlyIncome = {};
  const yearlyExpense = {};
  const years = new Set();

  data.incomes.forEach(item => {
    const date = dayjs(item.date);
    const year = date.format('YYYY');
    const month = date.format('MMMM');

    years.add(year);

    if (year === selectedYear) {
      if (!monthlyIncome[month]) monthlyIncome[month] = 0;
      monthlyIncome[month] += parseFloat(item.amount);
    }

    if (!yearlyIncome[year]) yearlyIncome[year] = 0;
    yearlyIncome[year] += parseFloat(item.amount);
  });

  data.expenses.forEach(item => {
    const date = dayjs(item.date);
    const year = date.format('YYYY');
    const month = date.format('MMMM');

    years.add(year);

    if (year === selectedYear) {
      if (!monthlyExpense[month]) monthlyExpense[month] = 0;
      monthlyExpense[month] += parseFloat(item.amount);
    }

    if (!yearlyExpense[year]) yearlyExpense[year] = 0;
    yearlyExpense[year] += parseFloat(item.amount);
  });

  const monthlyLabels = monthOrder.filter(month => monthlyIncome[month] !== undefined || monthlyExpense[month] !== undefined);
  const monthlyIncomeData = monthlyLabels.map(label => monthlyIncome[label] || 0);
  const monthlyExpenseData = monthlyLabels.map(label => monthlyExpense[label] || 0);

  const yearlyLabels = [...new Set([...Object.keys(yearlyIncome), ...Object.keys(yearlyExpense)])];
  const yearlyIncomeData = yearlyLabels.map(label => yearlyIncome[label] || 0);
  const yearlyExpenseData = yearlyLabels.map(label => yearlyExpense[label] || 0);

  return { monthlyLabels, monthlyIncomeData, monthlyExpenseData, yearlyLabels, yearlyIncomeData, yearlyExpenseData, years: [...years] };
};


const IncomeExpenseBarChart = ({ data, type, currency }) => {
  const [selectedYear, setSelectedYear] = useState(dayjs().format('YYYY'));
  const { monthlyLabels, monthlyIncomeData, monthlyExpenseData, yearlyLabels, yearlyIncomeData, yearlyExpenseData, years } = processData(data, selectedYear);

  const chartData = {
    labels: type === 'yearly' ? yearlyLabels : monthlyLabels,
    datasets: [
      {
        label: 'Income',
        data: type === 'yearly' ? yearlyIncomeData : monthlyIncomeData,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expense',
        data: type === 'yearly' ? yearlyExpenseData : monthlyExpenseData,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const dataset = tooltipItem.dataset;
            const value = tooltipItem.raw;
            const index = tooltipItem.dataIndex;
            const datasets = tooltipItem.chart.data.datasets;

            let currentExpense = 0;
            let currentIncome = 0;

            if (datasets[0] && datasets[1]) {
              currentIncome = datasets[0].data[index];
              currentExpense = datasets[1].data[index];
            }

            let percentage = 0;
            let prevExpenseDifference = null;
            let nextExpenseDifference = null;
            let prevIncomeDifference = null;
            let nextIncomeDifference = null;

            if (currentIncome > 0) {
              percentage = ((currentExpense / currentIncome) * 100).toFixed(2);
            }

            if (index > 0) {
              let prevExpense = datasets[1].data[index - 1];
              let prevIncome = datasets[0].data[index - 1];
              if (prevExpense > 0) {
                prevExpenseDifference = (((currentExpense - prevExpense) / prevExpense) * 100).toFixed(2);
              }
              if (prevIncome > 0) {
                prevIncomeDifference = (((currentIncome - prevIncome) / prevIncome) * 100).toFixed(2);
              }
            }

            if (index < datasets[0].data.length - 1) {
              let nextExpense = datasets[1].data[index + 1];
              let nextIncome = datasets[0].data[index + 1];
              if (nextExpense > 0) {
                nextExpenseDifference = (((currentExpense - nextExpense) / nextExpense) * 100).toFixed(2);
              }
              if (nextIncome > 0) {
                nextIncomeDifference = (((currentIncome - nextIncome) / nextIncome) * 100).toFixed(2);
              }
            }

            let labels = [
              `${dataset.label}: ${value} ${currency}`,
            ];

            if (dataset.label === 'Expense') {
              labels.push(`Expense through income: ${percentage}%`)
              if (prevExpenseDifference !== null) {
                labels.push(`Expense compared to previous month: ${prevExpenseDifference}%`);
              }
              if (nextExpenseDifference !== null) {
                labels.push(`Expense compared to next month: ${nextExpenseDifference}%`);
              }
            } else if (dataset.label === 'Income') {
              if (prevIncomeDifference !== null) {
                labels.push(`Income compared to previous month: ${prevIncomeDifference}%`);
              }
              if (nextIncomeDifference !== null) {
                labels.push(`Income compared to next month: ${nextIncomeDifference}%`);
              }
            }

            return labels;
          }
        }
      }


      ,
      title: {
        display: true,
        text: `Income and Expense Overview (${type === 'yearly' ? 'Yearly' : 'Monthly'}${type !== 'yearly' ? `- ${selectedYear}` : ''})`,
      }
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      }
    }
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='w-full flex justify-start'>
        {type !== "yearly" && [...years].sort((a, b) => b - a).map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className='text-[12px] md:text-md px-2 py-1 cursor-pointer'
            style={{
              margin: '0 5px',
              backgroundColor: year === selectedYear ? 'rgba(75, 192, 192, 0.5)' : '#eee',
              border: '1px solid #ccc',
            }}
          >
            {year}
          </button>
        ))}
      </div>

      <style>{
        `
    .barChart {
    width: 100% !important;
    height: auto !important;
 
    }

  `}</style>
      <Bar className='barChart' data={chartData} options={options} />
    </div>
  );
};

export default IncomeExpenseBarChart