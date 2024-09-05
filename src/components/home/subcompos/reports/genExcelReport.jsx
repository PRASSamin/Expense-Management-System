import dayjs from 'dayjs';

export const generateReport = (data, currency) => {
    const monthlyReport = [];
    const yearlyReport = {};
    const yearlyAllIncomeExpense = {};
    const monthOrder = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    let lifetimeIncome = 0;
    let lifetimeExpense = 0;
    let lifetimeIncomeSources = {};
    let lifetimeExpenseCategories = {};
    let allYears = new Set();
    let totalPeriods = 0;
    let totalSavingsRate = 0;

    const formatAmount = (amount) => `${amount.toFixed(2)} ${currency}`;


    function addCurrencyToValues(data) {
        let updatedData = {};
    
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                updatedData[key] = `${data[key].toFixed(2)} ${currency}`;
            }
        }
    
        return updatedData;
    }


    const processIncomeExpense = (items) => {
        items.forEach(item => {
            const date = dayjs(item.date);
            const year = date.format('YYYY');
            const month = date.format('MMMM');
            const monthIndex = date.month();
            const amount = parseFloat(item.amount);

            allYears.add(year);

            let monthData = monthlyReport.find(entry => entry.year === year && entry.month === month);
            if (!monthData) {
                monthData = { year, month, income: 0, expense: 0, incomeSources: {}, expenseCategories: {} };
                monthlyReport.push(monthData);
            }

            if (!yearlyAllIncomeExpense[year]) {
                yearlyAllIncomeExpense[year] = { incomes: new Array(12).fill(0), expenses: new Array(12).fill(0) };
            }

            if (item.type === 'Income') {
                monthData.income += amount;
                monthData.incomeSources[item.category] = (monthData.incomeSources[item.category] || 0) + amount;
                lifetimeIncome += amount;
                lifetimeIncomeSources[item.category] = (lifetimeIncomeSources[item.category] || 0) + amount;

                yearlyAllIncomeExpense[year].incomes[monthIndex] += amount;

            } else {
                monthData.expense += amount;
                monthData.expenseCategories[item.category] = (monthData.expenseCategories[item.category] || 0) + amount;
                lifetimeExpense += amount;
                lifetimeExpenseCategories[item.category] = (lifetimeExpenseCategories[item.category] || 0) + amount;

                yearlyAllIncomeExpense[year].expenses[monthIndex] += amount;
            }

            if (monthData.income > 0) {
                const savingsRate = ((monthData.income - monthData.expense) / monthData.income) * 100;
                totalSavingsRate += savingsRate;
                totalPeriods++;
            }

            if (!yearlyReport[year]) {
                yearlyReport[year] = { incomes: [], expenses: [], incomeSources: {}, expenseCategories: {} };
            }
            if (item.type === 'Income') {
                yearlyReport[year].incomes.push(amount);
                yearlyReport[year].incomeSources[item.category] = (yearlyReport[year].incomeSources[item.category] || 0) + amount;
            } else {
                yearlyReport[year].expenses.push(amount);
                yearlyReport[year].expenseCategories[item.category] = (yearlyReport[year].expenseCategories[item.category] || 0) + amount;
            }
        });
    };

    processIncomeExpense(data.incomes);
    processIncomeExpense(data.expenses);

    const calculateCumulativeBalance = (entries) => {
        let cumulativeIncome = 0;
        let cumulativeExpense = 0;

        return entries.map((entry, index, arr) => {
            cumulativeIncome += entry.income;
            cumulativeExpense += entry.expense;

            const prevMonth = arr[index - 1] || {};
            const nextMonth = arr[index + 1] || {};

            const incomeDiffPrev = prevMonth.income ? entry.income - prevMonth.income : null;
            const incomeDiffNext = nextMonth.income ? entry.income - nextMonth.income : null;
            const expenseDiffPrev = prevMonth.expense ? entry.expense - prevMonth.expense : null;
            const expenseDiffNext = nextMonth.expense ? entry.expense - nextMonth.expense : null;

            const incomePctDiffPrev = prevMonth.income ? ((incomeDiffPrev / prevMonth.income) * 100).toFixed(2) + '%' : 'N/A';
            const incomePctDiffNext = nextMonth.income ? ((incomeDiffNext / nextMonth.income) * 100).toFixed(2) + '%' : 'N/A';
            const expensePctDiffPrev = prevMonth.expense ? ((expenseDiffPrev / prevMonth.expense) * 100).toFixed(2) + '%' : 'N/A';
            const expensePctDiffNext = nextMonth.expense ? ((expenseDiffNext / nextMonth.expense) * 100).toFixed(2) + '%' : 'N/A';

            const savingsRate = entry.income ? ((entry.income - entry.expense) / entry.income * 100).toFixed(2) + '%' : 'N/A';

            return {
                "Month": `${entry.month} ${entry.year}`,
                "Income": formatAmount(entry.income),
                "Expense": formatAmount(entry.expense),
                "Cumulative Balance": formatAmount(cumulativeIncome - cumulativeExpense),
                "ExpenseDiffFromPrevMonth": expenseDiffPrev ? `${formatAmount(expenseDiffPrev)} (${expensePctDiffPrev})` : 'N/A',
                "ExpenseDiffFromNextMonth": expenseDiffNext ? `${formatAmount(expenseDiffNext)} (${expensePctDiffNext})` : 'N/A',
                "IncomeDiffFromPrevMonth": incomeDiffPrev ? `${formatAmount(incomeDiffPrev)} (${incomePctDiffPrev})` : 'N/A',
                "IncomeDiffFromNextMonth": incomeDiffNext ? `${formatAmount(incomeDiffNext)} (${incomePctDiffNext})` : 'N/A',
                savingsRate,
                "Income Sources": addCurrencyToValues(entry.incomeSources),
                "Expense Sources": addCurrencyToValues(entry.expenseCategories)
            };
        });
    };

    monthlyReport.sort((a, b) => {
        if (a.year !== b.year) return a.year.localeCompare(b.year);
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });

    const monthlyReportWithDetails = calculateCumulativeBalance(monthlyReport);

    const calculateYearlyDetails = (entries) => {
        let cumulativeIncome = 0;
        let cumulativeExpense = 0;
    
        return entries.map((entry, index, arr) => {
            cumulativeIncome += entry.income;
            cumulativeExpense += entry.expense;
    
            const yearData = entry.incomeExpenseArr[entry.year];

    
            const minIncomeIndex = yearData.incomes.length > 0 ? yearData.incomes.indexOf(Math.min(...yearData.incomes)) : -1;
            const maxIncomeIndex = yearData.incomes.length > 0 ? yearData.incomes.indexOf(Math.max(...yearData.incomes)) : -1;
    
            const lowIncome = minIncomeIndex !== -1 ? `${formatAmount(yearData.incomes[minIncomeIndex])} (${monthOrder[minIncomeIndex]})` : 'N/A';
            const peakIncome = maxIncomeIndex !== -1 ? `${formatAmount(yearData.incomes[maxIncomeIndex])} (${monthOrder[maxIncomeIndex]})` : 'N/A';
    
            const minExpenseIndex = yearData.expenses.length > 0 ? yearData.expenses.indexOf(Math.min(...yearData.expenses)) : -1;
            const maxExpenseIndex = yearData.expenses.length > 0 ? yearData.expenses.indexOf(Math.max(...yearData.expenses)) : -1;
    
            const lowExpense = minExpenseIndex !== -1 ? `${formatAmount(yearData.expenses[minExpenseIndex])} (${monthOrder[minExpenseIndex]})` : 'N/A';
            const peakExpense = maxExpenseIndex !== -1 ? `${formatAmount(yearData.expenses[maxExpenseIndex])} (${monthOrder[maxExpenseIndex]})` : 'N/A';
    
            const prevYear = arr[index - 1] || {};
            const nextYear = arr[index + 1] || {};
    
            const incomeDiffPrev = prevYear.income ? entry.income - prevYear.income : null;
            const expenseDiffPrev = prevYear.expense ? entry.expense - prevYear.expense : null;
            const incomeDiffNext = nextYear.income ? entry.income - nextYear.income : null;
            const expenseDiffNext = nextYear.expense ? entry.expense - nextYear.expense : null;
    
            const incomePctDiffPrev = prevYear.income ? ((incomeDiffPrev / prevYear.income) * 100).toFixed(2) + '%' : 'N/A';
            const expensePctDiffPrev = prevYear.expense ? ((expenseDiffPrev / prevYear.expense) * 100).toFixed(2) + '%' : 'N/A';
            const incomePctDiffNext = nextYear.income ? ((incomeDiffNext / nextYear.income) * 100).toFixed(2) + '%' : 'N/A';
            const expensePctDiffNext = nextYear.expense ? ((expenseDiffNext / nextYear.expense) * 100).toFixed(2) + '%' : 'N/A';
    
            const savingsRate = entry.income ? ((entry.income - entry.expense) / entry.income * 100).toFixed(2) + '%' : '0.00%';
    
            return {
                "Year": entry.year,
                "Income": formatAmount(entry.income),
                "Expense": formatAmount(entry.expense),
                "Cumulative Balance": formatAmount(cumulativeIncome - cumulativeExpense),
                "ExpenseDiffFromPrevYear": expenseDiffPrev ? `${formatAmount(expenseDiffPrev)} (${expensePctDiffPrev})` : 'N/A',
                "IncomeDiffFromPrevYear": incomeDiffPrev ? `${formatAmount(incomeDiffPrev)} (${incomePctDiffPrev})` : 'N/A',
                "ExpenseDiffFromNextYear": expenseDiffNext ? `${formatAmount(expenseDiffNext)} (${expensePctDiffNext})` : 'N/A',
                "IncomeDiffFromNextYear": incomeDiffNext ? `${formatAmount(incomeDiffNext)} (${incomePctDiffNext})` : 'N/A',
                savingsRate,
                "Income Sources": addCurrencyToValues(entry.incomeSources),
                "Expense Sources": addCurrencyToValues(entry.expenseCategories),
                "Low Income": lowIncome,
                "Peak Income": peakIncome,
                "Low Expense": lowExpense,
                "Peak Expense": peakExpense,
            };
        });
    };
    

    const yearlyReportWithDetails = calculateYearlyDetails(Object.keys(yearlyAllIncomeExpense).map(year => {
        const income = yearlyAllIncomeExpense[year].incomes.reduce((a, b) => a + b, 0);
        const expense = yearlyAllIncomeExpense[year].expenses.reduce((a, b) => a + b, 0);

        return {
            year,
            income,
            expense,
            incomeSources: yearlyReport[year].incomeSources,
            expenseCategories: yearlyReport[year].expenseCategories,
            incomeExpenseArr: yearlyAllIncomeExpense
        };
    }));


    const sumOfYearlyAllIncomeExpense = () => {
        let incomeSum = [];
        let expenseSum = [];
        let years = [];

        for (const year in yearlyAllIncomeExpense) {
            years.push(year);
            incomeSum.push(yearlyAllIncomeExpense[year].incomes.reduce((a, b) => a + b, 0));
            expenseSum.push(yearlyAllIncomeExpense[year].expenses.reduce((a, b) => a + b, 0));
        }
        return {
            incomeSum, expenseSum, years
        }
    }

    const { incomeSum, expenseSum, years } = sumOfYearlyAllIncomeExpense(yearlyAllIncomeExpense);

    const minExpense = Math.min(...expenseSum);
    const minIncome = Math.min(...incomeSum);
    const maxExpense = Math.max(...expenseSum);
    const maxIncome = Math.max(...incomeSum);

    const lifetimeReport = {
        "Average Expense": formatAmount(lifetimeExpense / allYears.size),
        "Average Income": formatAmount(lifetimeIncome / allYears.size),
        "Cumulative Balance": formatAmount(lifetimeIncome - lifetimeExpense),
        "Expense": formatAmount(lifetimeExpense),
        "Expense Sources": addCurrencyToValues(lifetimeExpenseCategories),
        "Income": formatAmount(lifetimeIncome),
        "Income Sources": addCurrencyToValues(lifetimeIncomeSources),
        "Savings Rate": lifetimeIncome ? ((lifetimeIncome - lifetimeExpense) / lifetimeIncome * 100).toFixed(2) + '%' : '0.00%',
        "Period": `${Math.min(...Array.from(allYears))} - ${Math.max(...Array.from(allYears))}`,
        "Low Expense": `${formatAmount(minExpense)} (${years[expenseSum.indexOf(minExpense)]})`,
        "Low Income": `${formatAmount(minIncome)} (${years[incomeSum.indexOf(minIncome)]})`,
        "Peak Expense": `${formatAmount(maxExpense)} (${years[expenseSum.indexOf(maxExpense)]})`,
        "Peak Income": `${formatAmount(maxIncome)} (${years[incomeSum.indexOf(maxIncome)]})`,
    };

    return {
        monthlyReport: monthlyReportWithDetails,
        yearlyReport: yearlyReportWithDetails,
        lifetimeReport,
    };
};
