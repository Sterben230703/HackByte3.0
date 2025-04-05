import React from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

interface VisualizationProps {
  userId: string;
}

type TimePeriod = 'monthly' | 'quarterly' | 'half-yearly' | 'annual';

interface ExpenseData {
  amount: number;
  date: string;
  category: string;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Visualization = ({ userId }: VisualizationProps) => {
  const [timePeriod, setTimePeriod] = React.useState<TimePeriod>('monthly');
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
  const [selectedPeriod, setSelectedPeriod] = React.useState('1');

  const getPeriodOptions = () => {
    switch (timePeriod) {
      case 'monthly':
        return [
          { value: '1', label: 'January' },
          { value: '2', label: 'February' },
          { value: '3', label: 'March' },
          { value: '4', label: 'April' },
          { value: '5', label: 'May' },
          { value: '6', label: 'June' },
          { value: '7', label: 'July' },
          { value: '8', label: 'August' },
          { value: '9', label: 'September' },
          { value: '10', label: 'October' },
          { value: '11', label: 'November' },
          { value: '12', label: 'December' }
        ];
      case 'quarterly':
        return [
          { value: '1', label: 'Q1 (Jan-Mar)' },
          { value: '2', label: 'Q2 (Apr-Jun)' },
          { value: '3', label: 'Q3 (Jul-Sep)' },
          { value: '4', label: 'Q4 (Oct-Dec)' }
        ];
      case 'half-yearly':
        return [
          { value: '1', label: 'H1 (Jan-Jun)' },
          { value: '2', label: 'H2 (Jul-Dec)' }
        ];
      case 'annual':
        return [{ value: '1', label: 'Full Year' }];
    }
  };

  React.useEffect(() => {
    setSelectedPeriod('1'); // Reset to first period when time period changes
  }, [timePeriod]);

  // Sample data - replace with your actual data from backend
  // Simulated full year data
  const fullYearData: ExpenseData[] = [
    { amount: 1200, date: '2024-01-15', category: 'Utilities' },
    { amount: 1900, date: '2024-02-15', category: 'Rent' },
    { amount: 800, date: '2024-03-15', category: 'Groceries' },
    { amount: 1600, date: '2024-04-15', category: 'Transport' },
    { amount: 2000, date: '2024-05-15', category: 'Entertainment' },
    { amount: 1500, date: '2024-06-15', category: 'Utilities' },
    { amount: 1700, date: '2024-07-15', category: 'Rent' },
    { amount: 900, date: '2024-08-15', category: 'Groceries' },
    { amount: 1400, date: '2024-09-15', category: 'Transport' },
    { amount: 2200, date: '2024-10-15', category: 'Entertainment' },
    { amount: 1800, date: '2024-11-15', category: 'Utilities' },
    { amount: 2100, date: '2024-12-15', category: 'Rent' },
  ];

  const getFilteredData = () => {
    const periodNum = parseInt(selectedPeriod);
    let startIdx = 0;
    let endIdx = 0;
    let label = '';

    switch (timePeriod) {
      case 'monthly':
        startIdx = periodNum - 1;
        endIdx = periodNum;
        label = getPeriodOptions()[startIdx].label;
        break;
      case 'quarterly':
        startIdx = (periodNum - 1) * 3;
        endIdx = startIdx + 3;
        label = `Q${periodNum}`;
        break;
      case 'half-yearly':
        startIdx = (periodNum - 1) * 6;
        endIdx = startIdx + 6;
        label = `H${periodNum}`;
        break;
      case 'annual':
        startIdx = 0;
        endIdx = 12;
        label = 'Annual';
        break;
    }

    const filteredData = fullYearData.slice(startIdx, endIdx);
    const sum = filteredData.reduce((acc, item) => acc + item.amount, 0);

    return {
      labels: [label],
      datasets: [
        {
          label: `${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Expenses`,
          data: [sum],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
        },
      ],
    };
  };

  const monthlyData = getFilteredData();

  const getFilteredDataForPeriod = () => {
    const periodNum = parseInt(selectedPeriod);
    let startIdx = 0;
    let endIdx = 0;

    switch (timePeriod) {
      case 'monthly':
        startIdx = periodNum - 1;
        endIdx = periodNum;
        break;
      case 'quarterly':
        startIdx = (periodNum - 1) * 3;
        endIdx = startIdx + 3;
        break;
      case 'half-yearly':
        startIdx = (periodNum - 1) * 6;
        endIdx = startIdx + 6;
        break;
      case 'annual':
        startIdx = 0;
        endIdx = 12;
        break;
    }

    return fullYearData.slice(startIdx, endIdx);
  };

  const getCategoryData = () => {
    const categories = ['Utilities', 'Groceries', 'Rent', 'Entertainment', 'Transport'];
    const filteredData = getFilteredDataForPeriod();
    const categoryTotals = categories.map(category =>
      filteredData.reduce((sum, item) =>
        item.category === category ? sum + item.amount : sum, 0
      )
    );

    return {
      labels: categories,
      datasets: [
        {
          data: categoryTotals,
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const categoryData = getCategoryData();

  const getBillStatusData = () => {
    // Simulate bill status based on the filtered data
    const filteredData = getFilteredDataForPeriod();
    const totalBills = filteredData.length;
    return {
      labels: ['Paid', 'Pending', 'Overdue'],
      datasets: [
        {
          label: 'Number of Bills',
          data: [
            Math.round(totalBills * 0.6),  // 60% paid
            Math.round(totalBills * 0.3),  // 30% pending
            Math.round(totalBills * 0.1),  // 10% overdue
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(255, 99, 132, 0.5)',
          ],
        },
      ],
    };
  };

  const billTypeData = getBillStatusData();

  const getStatistics = () => {
    const periodNum = parseInt(selectedPeriod);
    let startIdx = 0;
    let endIdx = 0;

    switch (timePeriod) {
      case 'monthly':
        startIdx = periodNum - 1;
        endIdx = periodNum;
        break;
      case 'quarterly':
        startIdx = (periodNum - 1) * 3;
        endIdx = startIdx + 3;
        break;
      case 'half-yearly':
        startIdx = (periodNum - 1) * 6;
        endIdx = startIdx + 6;
        break;
      case 'annual':
        startIdx = 0;
        endIdx = 12;
        break;
    }

    const filteredData = fullYearData.slice(startIdx, endIdx);
    const totalExpenses = filteredData.reduce((sum, item) => sum + item.amount, 0);
    const averageExpense = totalExpenses / filteredData.length;
    const pendingAmount = totalExpenses * 0.3; // Simulated 30% pending
    const totalBills = filteredData.length;

    return {
      totalExpenses: totalExpenses.toFixed(2),
      averageExpense: averageExpense.toFixed(2),
      totalBills,
      pendingAmount: pendingAmount.toFixed(2),
    };
  };

  const statistics = getStatistics();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Analytics for User {userId}</h1>
        <div className="flex gap-4">
          <select
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2"
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="half-yearly">Half Yearly</option>
            <option value="annual">Annual</option>
          </select>
          <select
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            {getPeriodOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2"
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
          >
            {[2024, 2023, 2022].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Expenses Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {timePeriod === 'monthly' ? 'Monthly' :
             timePeriod === 'quarterly' ? 'Quarterly' :
             timePeriod === 'half-yearly' ? 'Half Yearly' :
             'Annual'} Expenses Trend
          </h2>
          <div className="h-[300px]">
            <Line
              data={monthlyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Amount ($)' }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Expense Categories - {getPeriodOptions().find(p => p.value === selectedPeriod)?.label}
          </h2>
          <div className="h-[300px]">
            <Pie
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        {/* Bill Status */}
        {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Bill Status</h2>
          <div className="h-[300px]">
            <Bar
              data={billTypeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Number of Bills' }
                  }
                }
              }}
            />
          </div>
        </div> */}

        {/* Summary Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Summary Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">Total Expenses</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">${statistics.totalExpenses}</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">Average Monthly</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">${statistics.averageExpense}</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-purple-600 dark:text-purple-400">Total Bills</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{statistics.totalBills}</p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending Amount</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">${statistics.pendingAmount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualization;
