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
  // Sample data - replace with your actual data
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Expenses',
        data: [1200, 1900, 800, 1600, 2000, 1500],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const categoryData = {
    labels: ['Utilities', 'Groceries', 'Rent', 'Entertainment', 'Transport'],
    datasets: [
      {
        data: [300, 500, 1200, 200, 400],
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

  const billTypeData = {
    labels: ['Paid', 'Pending', 'Overdue'],
    datasets: [
      {
        label: 'Number of Bills',
        data: [12, 5, 3],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Financial Analytics for User {userId}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Expenses Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Monthly Expenses Trend</h2>
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Expense Categories</h2>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
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
        </div>

        {/* Summary Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Summary Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">Total Expenses</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">$8,000</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">Average Monthly</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">$1,333</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-purple-600 dark:text-purple-400">Total Bills</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">20</p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending Amount</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">$1,200</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualization;
