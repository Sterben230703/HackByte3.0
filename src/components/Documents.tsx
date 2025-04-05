import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FileText, Search, Upload, UserPlus, Check } from 'lucide-react';
import { Types, AptosClient } from 'aptos';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY;
const APTOS_NODE_URL = 'https://fullnode.testnet.aptoslabs.com/v1';
const CONTRACT_ADDRESS = import.meta.env.VITE_WALLET_ADDRESS;

const client = new AptosClient(APTOS_NODE_URL);

interface DocumentsProps {
  userId: string;
}

interface DocumentSignature {
  signer: string;
  timestamp: number;
}

interface DocumentData {
  id: string;
  content_hash: string;
  creator: string;
  signers: string[];
  signatures: DocumentSignature[];
  is_completed: boolean;
}

interface UploadedFile {
  name: string;
  ipfsHash: string;
  documentId?: string;
  signers?: string[];
  isCompleted?: boolean;
  error?: string;
}

interface AptosTransactionResult {
  hash: string;
  success: boolean;
  vm_status: string;
  events: Array<{
    type: string;
    data: {
      document_id: string;
      creator: string;
    };
  }>;
}

interface AptosAccount {
  address: string;
  publicKey: string;
}

interface MoveValue {
  type: string;
  value: any;
}

interface DocumentState {
  id: number;
  content_hash: string;
  creator: string;
  signers: string[];
  signatures: Array<{ signer: string; timestamp: number }>;
  is_completed: boolean;
}

type TransactionResult = {
  success: boolean;
  error?: string;
  documentId?: string;
  creator?: string;
};

declare global {
  interface Window {
    aptos?: {
      account(): Promise<AptosAccount>;
      connect(): Promise<AptosAccount>;
      signAndSubmitTransaction(transaction: any): Promise<any>;
    };
  }
}

const Documents: React.FC<DocumentsProps> = ({ userId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [signers, setSigners] = useState<string[]>([]);
  const [newSigner, setNewSigner] = useState('');
  const [showSignerInput, setShowSignerInput] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const checkWalletConnection = async () => {
    try {
      if (!(window as any).aptos) {
        setWalletConnected(false);
        return;
      }

      const account = await (window as any).aptos.account();
      if (account) {
        setWalletConnected(true);
        setWalletAddress(account.address);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      setWalletConnected(false);
    }
  };

  const connectWallet = async () => {
    try {
      setConnecting(true);
      await (window as any).aptos.connect();
      const account = await (window as any).aptos.account();
      setWalletConnected(true);
      setWalletAddress(account.address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setUploadMessage('Failed to connect wallet. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const fetchPinnedFiles = async () => {
    try {
      const response = await axios.get('https://api.pinata.cloud/data/pinList', {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      });

      const files = response.data.rows.map((file: any) => ({
        name: file.metadata.name || 'Unnamed File',
        ipfsHash: file.ipfs_pin_hash,
      }));

      setUploadedFiles(files);
    } catch (error) {
      console.error('Failed to fetch pinned files:', error);
    }
  };

  const createDocument = async (ipfsHash: string, fileName: string): Promise<TransactionResult> => {
    try {
      const payload = {
        type: `${CONTRACT_ADDRESS}::first_contract::create_document`,
        arguments: [ipfsHash, signers],
      };

      const transaction = await (window as any).aptos.signAndSubmitTransaction(payload);
      const result = await client.waitForTransactionWithResult(transaction.hash) as unknown as AptosTransactionResult;

      if (!result.success) {
        return { success: false, error: result.vm_status };
      }

      const documentId = result.events?.[0]?.data?.document_id;
      const creator = result.events?.[0]?.data?.creator;

      if (!documentId || !creator) {
        return { success: false, error: 'Failed to get document details from event' };
      }

      return { success: true, documentId, creator };
    } catch (error) {
      console.error('Error creating document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create document'
      };
    }
  };

  const signDocument = async (documentId: string): Promise<TransactionResult> => {
    if (!walletConnected) {
      return { success: false, error: 'Please connect your wallet first' };
    }

    try {
      const payload = {
        type: `${CONTRACT_ADDRESS}::first_contract::sign_document`,
        arguments: [documentId],
      };

      const transaction = await (window as any).aptos.signAndSubmitTransaction(payload);
      const result = await client.waitForTransactionWithResult(transaction.hash) as unknown as AptosTransactionResult;

      if (!result.success) {
        return { success: false, error: result.vm_status };
      }

      await fetchPinnedFiles();
      return { success: true };
    } catch (error) {
      console.error('Error signing document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sign document'
      };
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleAddSigner = () => {
    if (!newSigner.match(/^0x[a-fA-F0-9]{64}$/)) {
      setUploadMessage('Invalid Aptos address format');
      return;
    }

    if (newSigner && !signers.includes(newSigner)) {
      setSigners([...signers, newSigner]);
      setNewSigner('');
      setUploadMessage('');
    } else if (signers.includes(newSigner)) {
      setUploadMessage('This signer has already been added');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Please select a file to upload.');
      return;
    }

    if (!walletConnected) {
      setUploadMessage('Please connect your wallet first');
      return;
    }

    if (signers.length === 0) {
      setUploadMessage('Please add at least one signer');
      return;
    }

    setUploading(true);
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      });

      const ipfsHash = response.data.IpfsHash;
      const result = await createDocument(ipfsHash, selectedFile.name);

      if (!result.success) {
        throw new Error(result.error);
      }

      setUploadMessage(`File uploaded successfully! IPFS Hash: ${ipfsHash}, Document ID: ${result.documentId}`);

      setUploadedFiles((prevFiles) => [
        ...prevFiles,
        {
          name: selectedFile.name,
          ipfsHash,
          documentId: result.documentId,
          signers: [...signers],
          isCompleted: false
        },
      ]);

      setSigners([]);
      setShowSignerInput(false);
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  useEffect(() => {
    checkWalletConnection();
    fetchPinnedFiles();
  }, []);

  const renderUploadControls = () => (
    <div className="flex flex-col gap-4">
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
          onClick={() => setShowSignerInput(!showSignerInput)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <UserPlus className="h-5 w-5" />
          Add Signers
        </button>
        <button
          onClick={handleUpload}
          disabled={uploading || signers.length === 0}
          className={`flex items-center gap-2 px-4 py-2 ${
            uploading || signers.length === 0 ? 'bg-gray-400' : 'bg-blue-600'
          } text-white rounded-lg hover:bg-blue-700 transition-colors`}
        >
          {uploading ? (
            <>
              <span className="animate-spin">⌛</span>
              Uploading...
            </>
          ) : (
            'Upload & Create Contract'
          )}
        </button>
      </div>

      {showSignerInput && (
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={newSigner}
            onChange={(e) => setNewSigner(e.target.value)}
            placeholder="Enter signer address"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddSigner}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Signer
          </button>
        </div>
      )}

      {signers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {signers.map((signer, index) => (
            <div key={index} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
              <span className="text-sm text-gray-700">{signer}</span>
              <button
                onClick={() => setSigners(signers.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage and organize your documents</p>
        </div>
      </div>

      {!walletConnected ? (
        <div className="flex items-center justify-center p-6 bg-yellow-50 rounded-lg mb-4">
          <div className="text-center">
            <p className="text-yellow-700 mb-4">Please connect your Aptos wallet to create and sign documents</p>
            <button
              onClick={connectWallet}
              disabled={connecting}
              className={`px-6 py-2 ${
                connecting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              } text-white rounded-lg transition-colors`}
            >
              {connecting ? 'Connecting...' : 'Connect Aptos Wallet'}
            </button>
          </div>
        </div>
      ) : (
        renderUploadControls()
      )}

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
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-gray-500">
                      IPFS Hash: <a href={`https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{file.ipfsHash}</a>
                    </p>
                    {file.documentId && (
                      <>
                        <p className="text-sm text-gray-500">Document ID: {file.documentId}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {file.signers?.map((signer, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-1 rounded-full ${
                                file.isCompleted
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {signer}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs mt-1">
                          Status: {file.isCompleted ? (
                            <span className="text-green-600">All signatures collected</span>
                          ) : (
                            <span className="text-yellow-600">Awaiting signatures</span>
                          )}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`, '_blank')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View
                  </button>
                  {file.documentId && !file.isCompleted && walletConnected && (
                    <button
                      onClick={() => signDocument(file.documentId!)}
                      className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
                    >
                      <Check className="h-4 w-4" />
                      Sign
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">Smart Contract Info</h3>
        <p className="text-sm text-gray-600">Contract Address: {CONTRACT_ADDRESS}</p>
        <p className="text-sm text-gray-600">Network: Aptos Testnet</p>
        <p className="text-sm text-gray-600">User ID: {userId}</p>
        {walletConnected && (
          <p className="text-sm text-green-600 mt-2">
            Connected Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
        )}
      </div>
    </div>
  );
};

export default Documents;