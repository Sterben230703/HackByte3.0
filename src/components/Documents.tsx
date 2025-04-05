import React, { useState } from 'react';
import axios from 'axios';
import { FileText, Search, Upload } from 'lucide-react';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY;

interface DocumentsProps {
  userId: string;
}

interface UploadedFile {
  name: string;
  ipfsHash: string;
}

const Documents = ({ userId }: DocumentsProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      });

      const ipfsHash = response.data.IpfsHash;
      setUploadMessage(`File uploaded successfully! IPFS Hash: ${ipfsHash}`);

      // Add the uploaded file to the list
      setUploadedFiles((prevFiles) => [
        ...prevFiles,
        { name: selectedFile.name, ipfsHash },
      ]);
    } catch (error) {
      setUploadMessage('Failed to upload file. Please try again.');
      console.error(error);
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage and organize your documents</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors"
          >
            <Upload className="h-5 w-5" />
            Choose File
          </label>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`flex items-center gap-2 px-4 py-2 ${
              uploading ? 'bg-gray-400' : 'bg-blue-600'
            } text-white rounded-lg hover:bg-blue-700 transition-colors`}
          >
            {uploading ? 'Uploading...' : 'Upload to Pinata'}
          </button>
        </div>
      </div>

      {uploadMessage && (
        <div className="mb-4 p-4 bg-gray-100 text-gray-700 rounded-lg">
          {uploadMessage}
        </div>
      )}

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
          {uploadedFiles.map((file, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{file.name}</h3>
                  <p className="text-sm text-gray-500">
                    IPFS Hash: <a href={`https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{file.ipfsHash}</a>
                  </p>
                </div>
                <button
                  onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`, '_blank')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View
                </button>
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