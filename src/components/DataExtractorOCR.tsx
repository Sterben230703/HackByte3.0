import React, { useState, useCallback, useEffect } from "react";
import { performOCR } from "../services/tesseract";
import { categorizeDocument, extractBillDetails } from "../services/gemini";
import { listDriveFiles, getDriveFileContent, initializeDrive, DriveFile } from "../services/drive";
import { useDropzone } from 'react-dropzone';
import { uploadToIPFS } from "../services/ipfs";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ExtractedData {
  text: string;
  category?: string;
  billDetails?: any;
  documentName: string;
  timestamp: string;
}

interface DataExtractorOCRProps {
  userId: string;
}

const DataExtractorOCR = ({ userId }: DataExtractorOCRProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [documentName, setDocumentName] = useState("");
  const [monthlyData, setMonthlyData] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const init = async () => {
      // Replace with your Google Drive API key
      initializeDrive('AIzaSyC2ruz2IF_FRf-7jeR9A8uWyn_ImlCUPQE');
      const files = await listDriveFiles();
      setDriveFiles(files);
    };

    init().catch(console.error);
  }, []);

  useEffect(() => {
    // Process extracted data to get monthly totals
    const monthlyTotals: { [key: string]: number } = {};
    
    extractedData.forEach(data => {
      if (data.billDetails?.totalCost && data.billDetails?.date) {
        const date = new Date(data.billDetails.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyTotals[monthYear] = (monthlyTotals[monthYear] || 0) + parseFloat(data.billDetails.totalCost);
      }
    });

    setMonthlyData(monthlyTotals);
  }, [extractedData]);

  const processImage = async (file: File | string) => {
    if (!documentName.trim()) {
      alert("Please enter a document name first");
      return;
    }

    setIsProcessing(true);
    try {
      let content: File | string = file;
      let fileName = typeof file === 'string' ? 
        driveFiles.find(f => f.id === file)?.name || documentName :
        file.name;

      if (typeof file === 'string') {
        content = await getDriveFileContent(file);
      } else {
        try {
          const ipfsHash = await uploadToIPFS(file);
          console.log('Stored on IPFS:', ipfsHash);
        } catch (error) {
          console.error('Error uploading to IPFS:', error);
        }
      }

      const text = await performOCR(content);
      const category = await categorizeDocument(text);
      let billDetails = undefined;

      if (category.type === 'bills') {
        billDetails = await extractBillDetails(text);
      }

      setExtractedData(prev => [...prev, { 
        text, 
        category: category.type, 
        billDetails,
        documentName: documentName,
        timestamp: new Date().toLocaleString()
      }]);

      setDocumentName(""); // Reset document name after processing

    } catch (error) {
      console.error('Error processing document:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(processImage);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
      'application/pdf': ['.pdf']
    }
  });

  const chartData = {
    labels: Object.keys(monthlyData).sort(),
    datasets: [
      {
        label: 'Monthly Expenses',
        data: Object.keys(monthlyData).sort().map(key => monthlyData[key]),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Cost Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Total Cost ($)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Month-Year',
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">DocAnalyzer</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Document Analyzer & Cost Tracker
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload your documents and bills to extract information and track expenses automatically
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Upload Section */}
            <div className="lg:col-span-1 space-y-6">
              {/* Document Name Input */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Name
                </label>
                <input
                  type="text"
                  placeholder="Enter document name"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* File Drop Zone */}
              <div 
                {...getRootProps()} 
                className="bg-white rounded-xl shadow-sm p-8 border-2 border-dashed border-blue-300 hover:border-blue-500 transition-all cursor-pointer group"
              >
                <input {...getInputProps()} />
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <i className="fas fa-cloud-upload-alt text-3xl text-blue-500"></i>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">Drop files here</p>
                    <p className="text-sm text-gray-500">or click to browse</p>
                  </div>
                  <p className="text-xs text-gray-400">Supports images and PDF files</p>
                </div>
              </div>
            </div>

            {/* Center & Right Columns - Analytics & Drive Files */}
            <div className="lg:col-span-2 space-y-6">
              {/* Analytics Section */}
              {Object.keys(monthlyData).length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Cost Analytics</h2>
                  <div className="h-[400px] mb-6">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                      <h3 className="font-semibold text-blue-800 mb-1">Total Spend</h3>
                      <p className="text-2xl font-bold text-blue-900">
                        ${Object.values(monthlyData).reduce((a, b) => a + b, 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                      <h3 className="font-semibold text-green-800 mb-1">Average Monthly</h3>
                      <p className="text-2xl font-bold text-green-900">
                        ${(Object.values(monthlyData).reduce((a, b) => a + b, 0) / Object.keys(monthlyData).length).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                      <h3 className="font-semibold text-purple-800 mb-1">Total Bills</h3>
                      <p className="text-2xl font-bold text-purple-900">
                        {extractedData.filter(data => data.billDetails?.totalCost).length}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Drive Files Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Google Drive Files</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {driveFiles.map(file => (
                    <button
                      key={file.id}
                      onClick={() => processImage(file.id)}
                      className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all group"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <i className="fas fa-file-alt text-blue-600"></i>
                      </div>
                      <span className="flex-1 truncate text-left text-gray-700 group-hover:text-gray-900">
                        {file.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Extracted Data Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Processed Documents</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {extractedData.map((data, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{data.documentName}</h3>
                      <p className="text-sm text-gray-500">{data.timestamp}</p>
                    </div>
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {data.category}
                    </span>
                  </div>
                  
                  {data.billDetails && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Bill Details</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <p className="text-gray-600">Name</p>
                          <p className="font-medium text-gray-900">{data.billDetails.name}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-600">Total</p>
                          <p className="font-medium text-gray-900">${data.billDetails.totalCost}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-600">Category</p>
                          <p className="font-medium text-gray-900">{data.billDetails.category}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-600">Date</p>
                          <p className="font-medium text-gray-900">{data.billDetails.date}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <details className="mt-4">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                      View extracted text
                    </summary>
                    <p className="mt-3 text-sm text-gray-600 whitespace-pre-wrap p-4 bg-gray-50 rounded-lg border border-gray-100">
                      {data.text}
                    </p>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-center text-gray-700 font-medium">Processing document...</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 py-6 border-t border-gray-200">
          <div className="text-center text-gray-600">
            <p className="text-sm"> {new Date().getFullYear()} DocAnalyzer. All rights reserved.</p>
            <p className="text-xs mt-1 text-gray-500">Powered by AI & Blockchain Technology</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DataExtractorOCR;
