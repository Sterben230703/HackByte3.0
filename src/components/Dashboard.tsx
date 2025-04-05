import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, PieChart as PieChartIcon, Image } from 'lucide-react';

interface DashboardProps {
  userId: string;
}

interface StatCardProps {
  Icon: React.ElementType;
  label: string;
  value: string | number;
  change: string | number;
}

const data = [
  { name: 'Jan', documents: 4, expenses: 24, images: 12 },
  { name: 'Feb', documents: 8, expenses: 35, images: 18 },
  { name: 'Mar', documents: 15, expenses: 45, images: 25 },
  { name: 'Apr', documents: 25, expenses: 52, images: 32 },
  { name: 'May', documents: 32, expenses: 58, images: 38 },
];

const StatCard = ({ Icon, label, value, change }: StatCardProps) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="bg-blue-50 p-3 rounded-lg">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <span className="text-sm font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
        +{change}%
      </span>
    </div>
    <h3 className="text-sm font-medium text-gray-600 mb-1">{label}</h3>
    <p className="text-2xl font-semibold text-gray-900">{value}</p>
  </div>
);

export function Dashboard({ userId }: DashboardProps) {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your activity overview for user {userId}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          Icon={FileText}
          label="Total Documents"
          value={32}
          change={12.5}
        />
        <StatCard
          Icon={PieChartIcon}
          label="Total Expenses"
          value="$2,450"
          change={8.2}
        />
        <StatCard
          Icon={Image}
          label="Processed Images"
          value={38}
          change={15.3}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="documents"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.2}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.2}
              />
              <Area
                type="monotone"
                dataKey="images"
                stackId="1"
                stroke="#6366F1"
                fill="#6366F1"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}