import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageCircle, Send, Loader } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptosClient } from "@/utils/aptosClient";
import axios from 'axios';
import { MODULE_ADDRESS, MODULE_NAME } from '@/config/constants';

interface Document {
  id: number;
  content_hash: string;
  creator: string;
  signers: string[];
  signatures: string[];
  is_completed: boolean;
  category?: string;
  extractedContent?: string;
  signerDetails?: string;
}

interface ProcessedDocument {
  id: number;
  summary: string;
  signerInfo: string;
  category: string;
  status: string;
}

interface Message {
  text: string;
  isUser: boolean;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I can help you understand your documents. What would you like to know?", isUser: false }
  ]);
  const [input, setInput] = useState("");
  const [genAI, setGenAI] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [processedDocs, setProcessedDocs] = useState<ProcessedDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { account } = useWallet();
  const API_KEY = "AIzaSyD6olpfeXKuZiACMF5awOE_HxOI4ifOlZM";
  const moduleAddress = MODULE_ADDRESS;
  const moduleName = MODULE_NAME;

  // Initialize Gemini AI and fetch documents
  useEffect(() => {
    const ai = new GoogleGenerativeAI(API_KEY);
    setGenAI(ai);
  }, []);

  useEffect(() => {
    if (genAI && account) {
      fetchAndProcessDocuments();
    }
  }, [genAI, account]);

  const analyzeDocument = async (content: string | Blob, model: any): Promise<string> => {
    try {
      let textContent = '';
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.readAsDataURL(content as Blob);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

      const base64Content = base64Data.split(',')[1];
      const fileType = (content as Blob).type;

      const analysisPrompt = `Analyze this document and provide a structured response in the following format:
1. SUMMARY: A comprehensive summary of the main content
2. KEY_POINTS: List the most important points or findings
3. ENTITIES: Identify and list any important names, organizations, dates, or numbers
4. DOCUMENT_TYPE: Determine the type of document (e.g., contract, report, invoice)
5. ACTION_ITEMS: List any required actions, deadlines, or next steps
6. METADATA: Note any metadata like dates, reference numbers, or version information

Please be thorough but concise in your analysis.`;

      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { text: analysisPrompt },
            { inlineData: { mimeType: fileType, data: base64Content }}
          ]
        }]
      });

      textContent = result.response.text();
      
      // Verify if we got a valid response
      if (!textContent || textContent.trim().length === 0) {
        throw new Error('Empty response from AI model');
      }

      return textContent;
    } catch (error) {
      console.error('Error analyzing document:', error);
      return 'Error analyzing document content';
    }
  };

  const fetchAndProcessDocuments = async () => {
    if (!account) {
      console.log('No account connected');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await aptosClient().view<[Document[]]>({
        payload: {
          function: `${moduleAddress}::${moduleName}::get_all_documents`,
          typeArguments: [],
          functionArguments: [],
        }
      });

      if (Array.isArray(response) && response.length > 0) {
        const userDocuments = response[0].filter(doc => doc.creator === account.address);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const processedDocuments: ProcessedDocument[] = [];

        for (const doc of userDocuments) {
          try {
            const content = await axios.get(`https://gateway.pinata.cloud/ipfs/${doc.content_hash}`, {
              responseType: 'blob'
            });

            const summary = await analyzeDocument(content.data, model);
            const signerInfo = `Signers: ${doc.signers.join(', ')}\nSignatures Completed: ${doc.signatures.length}/${doc.signers.length}`;

            processedDocuments.push({
              id: doc.id,
              summary,
              signerInfo,
              category: doc.category || 'uncategorized',
              status: doc.is_completed ? 'completed' : 'pending'
            });
          } catch (error) {
            console.error(`Error processing document ${doc.id}:`, error);
          }
        }

        setProcessedDocs(processedDocuments);
        setDocuments(userDocuments);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I had trouble accessing your documents. Please try again later.", 
        isUser: false 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };



  const handleSend = async () => {
    if (!input.trim() || !genAI || documents.length === 0) {
      if (documents.length === 0) {
        setMessages(prev => [...prev, { 
          text: "I don't see any documents to analyze. Please make sure you have uploaded documents through the document management system.", 
          isUser: false 
        }]);
      }
      return;
    }

    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Create detailed context with document summaries and signer info
      const context = processedDocs.map(doc => 
        `Document ID: ${doc.id}
` +
        `Summary: ${doc.summary}
` +
        `${doc.signerInfo}
` +
        `Category: ${doc.category}
` +
        `Status: ${doc.status}`
      ).join('\n\n==========\n\n');

      const prompt = `You are an AI assistant with detailed knowledge of these documents:

${context}

User Query: "${input}"

Instructions for response:
1. CONTEXT: Always consider the full context of all available documents when answering
2. SPECIFICITY: Reference specific documents by ID and cite relevant sections
3. COMPARISON: If the query relates to multiple documents, compare and contrast their content
4. SIGNERS: Include signer information and document status when relevant
5. RELATIONSHIPS: Identify and explain relationships between different documents
6. ACCURACY: If information is unclear or unavailable, clearly state that
7. STRUCTURE: Organize your response with clear sections and bullet points when appropriate
8. ACTIONS: If there are any required actions or next steps, highlight them clearly

Please provide a comprehensive and well-structured response:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const botMessage = { 
        text: response.text(), 
        isUser: false 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = { 
        text: "Sorry, I encountered an error. Please try again.", 
        isUser: false 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Chat button */}
      <Button
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* Chat dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] h-[80vh] max-h-[800px] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Document Chat Assistant</span>
              {isProcessing && <Loader className="w-4 h-4 animate-spin" />}
            </DialogTitle>
          </DialogHeader>
          
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-lg text-base ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className="border-t p-5 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={documents.length > 0 ? "Ask about your documents..." : "Loading your documents..."}
              className="flex-1 px-4 py-3 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button onClick={handleSend} size="icon" disabled={documents.length === 0}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatBot;
