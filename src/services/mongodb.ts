import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

export interface ChatMessage {
  _id?: ObjectId;
  userId: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface Image {
  _id?: ObjectId;
  userId: string;
  filename: string;
  url: string;
  tags: string[];
  uploadDate: Date;
}

export interface Expense {
  _id?: ObjectId;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
}

export const connectDB = async () => {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

// Chat functions
export const saveChatMessage = async (message: Omit<ChatMessage, '_id'>) => {
  try {
    const db = client.db('documentAI');
    const result = await db.collection('chatHistory').insertOne(message);
    return result;
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
};

export const getChatHistory = async (userId: string) => {
  try {
    const db = client.db('documentAI');
    const messages = await db.collection('chatHistory')
      .find({ userId })
      .sort({ timestamp: 1 })
      .toArray();
    return messages;
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
};

// Image functions
export const saveImage = async (image: Omit<Image, '_id'>) => {
  try {
    const db = client.db('documentAI');
    const result = await db.collection('images').insertOne(image);
    return result;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
};

export const getUserImages = async (userId: string) => {
  try {
    const db = client.db('documentAI');
    const images = await db.collection('images')
      .find({ userId })
      .sort({ uploadDate: -1 })
      .toArray();
    return images;
  } catch (error) {
    console.error('Error getting user images:', error);
    throw error;
  }
};

// Expense functions
export const saveExpense = async (expense: Omit<Expense, '_id'>) => {
  try {
    const db = client.db('documentAI');
    const result = await db.collection('expenses').insertOne(expense);
    return result;
  } catch (error) {
    console.error('Error saving expense:', error);
    throw error;
  }
};

export const getUserExpenses = async (userId: string) => {
  try {
    const db = client.db('documentAI');
    const expenses = await db.collection('expenses')
      .find({ userId })
      .sort({ date: -1 })
      .toArray();
    return expenses;
  } catch (error) {
    console.error('Error getting user expenses:', error);
    throw error;
  }
};

export const getExpensesByCategory = async (userId: string) => {
  try {
    const db = client.db('documentAI');
    const expenses = await db.collection('expenses')
      .aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' }
          }
        }
      ])
      .toArray();
    return expenses.map(e => ({ name: e._id, value: e.total }));
  } catch (error) {
    console.error('Error getting expenses by category:', error);
    throw error;
  }
};
