import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyCgcgzxTFo_GLcLTMEv_emmrpw38BjLhvc');

export interface DocumentCategory {
  type: 'business' | 'personal' | 'legal' | 'bills' | 'books' | 'others';
  subtype?: string;
  confidence: number;
}

export interface BillDetails {
  name: string;
  details: string;
  totalCost: number;
  category: 'food' | 'entertainment' | 'rent' | 'utilities' | 'transportation' | 'others';
  date: string;
}

export const categorizeDocument = async (text: string): Promise<DocumentCategory> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `Analyze the following document text and categorize it into one of these categories:
  business, personal, legal, bills, books, others.
  Also provide a confidence score between 0 and 1.
  Return the result in JSON format with 'type' and 'confidence' fields.
  
  Text: ${text}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
};

export const extractBillDetails = async (text: string): Promise<BillDetails> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `Extract the following information from this bill:
  - Bill name/title
  - Details/description
  - Total cost
  - Category (food, entertainment, rent, utilities, transportation, others)
  - Date
  Return the result in JSON format.
  
  Text: ${text}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
};

export const chatWithAI = async (message: string, history: Array<{role: string, content: string}>) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const chat = model.startChat({
    history: history.map(msg => ({
      role: msg.role as 'user' | 'model',
      parts: [{text: msg.content}],
    })),
  });

  const result = await chat.sendMessage(message);
  const response = await result.response;
  return response.text();
};
