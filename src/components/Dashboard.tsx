import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, PieChart as PieChartIcon, Image, ArrowUp } from 'lucide-react';

const data = [
  { name: 'Jan', documents: 4, expenses: 24, images: 12 },
  { name: 'Feb', documents: 8, expenses: 35, images: 18 },
  { name: 'Mar', documents: 15, expenses: 45, images: 25 },
  { name: 'Apr', documents: 25, expenses: 52, images: 35 },
];

const StatCard = ({ icon: Icon, label, value, change }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-green-600">
        <ArrowUp className="h-4 w-4" />
        <span className="text-sm font-medium">{change}%</span>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your document management metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard icon={FileText} label="Documents Processed" value="1,234" change="12" />
        <StatCard icon={PieChartIcon} label="Expenses Tracked" value="$8,567" change="8" />
        <StatCard icon={Image} label="Images Classified" value="3,456" change="15" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="documents" stackId="1" stroke="#3B82F6" fill="#93C5FD" />
              <Area type="monotone" dataKey="expenses" stackId="1" stroke="#10B981" fill="#6EE7B7" />
              <Area type="monotone" dataKey="images" stackId="1" stroke="#6366F1" fill="#A5B4FC" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;