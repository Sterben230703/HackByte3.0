import React from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';

const Images = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Images</h1>
          <p className="text-gray-600">AI-powered image classification and organization</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Upload className="h-5 w-5" />
          Upload Images
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div key={item} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={`https://source.unsplash.com/random/400x400?sig=${item}`}
                alt={`Gallery item ${item}`}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Image_{item}.jpg</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
                  Landscape
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-600 rounded-full">
                  Nature
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Images;