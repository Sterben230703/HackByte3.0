import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'hackbyte';

export interface Image {
  _id?: ObjectId;
  userId: string;
  url: string;
  uploadDate: Date;
  metadata?: Record<string, any>;
}

export interface Expense {
  _id?: ObjectId;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
}

export async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db(dbName);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Image operations
export async function getUserImages(userId: string) {
  const db = await connectDB();
  return db.collection<Image>('images')
    .find({ userId })
    .sort({ uploadDate: -1 })
    .toArray();
}

export async function saveImage(imageData: Image) {
  const db = await connectDB();
  const result = await db.collection<Image>('images').insertOne(imageData);
  return result.insertedId;
}

// Expense operations
export async function getUserExpenses(userId: string) {
  const db = await connectDB();
  return db.collection<Expense>('expenses')
    .find({ userId })
    .sort({ date: -1 })
    .toArray();
}

export async function saveExpense(expenseData: Expense) {
  const db = await connectDB();
  const result = await db.collection<Expense>('expenses').insertOne(expenseData);
  return result.insertedId;
}

export async function getExpensesByCategory(userId: string) {
  const db = await connectDB();
  return db.collection<Expense>('expenses')
    .aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ])
    .toArray();
}
