import React from 'react';
import { FileText, Search, Upload } from 'lucide-react';

interface DocumentsProps {
  userId: string;
}

const Documents = ({ userId }: DocumentsProps) => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage and organize your documents</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Upload className="h-5 w-5" />
          Upload Files
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">Document_{item}.pdf</h3>
                  <p className="text-sm text-gray-500">Added 2 hours ago • 2.4 MB</p>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700">View</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p>User ID: {userId}</p>
    </div>
  );
};

export default Documents;