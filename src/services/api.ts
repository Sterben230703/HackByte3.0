const API_BASE_URL = 'http://localhost:3001/api';

export interface Image {
  _id?: string;
  userId: string;
  url: string;
  uploadDate: Date;
  metadata?: Record<string, any>;
}

export interface Expense {
  _id?: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
}

// Image operations
export async function getUserImages(userId: string): Promise<Image[]> {
  const response = await fetch(`${API_BASE_URL}/images/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch images');
  }
  return response.json();
}

export async function saveImage(imageData: Image): Promise<{ id: string }> {
  const response = await fetch(`${API_BASE_URL}/images`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(imageData),
  });
  if (!response.ok) {
    throw new Error('Failed to save image');
  }
  return response.json();
}

// Expense operations
export async function getUserExpenses(userId: string): Promise<Expense[]> {
  const response = await fetch(`${API_BASE_URL}/expenses/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch expenses');
  }
  return response.json();
}

export async function saveExpense(expenseData: Expense): Promise<{ id: string }> {
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expenseData),
  });
  if (!response.ok) {
    throw new Error('Failed to save expense');
  }
  return response.json();
}

export async function getExpensesByCategory(userId: string): Promise<{ _id: string; total: number }[]> {
  const response = await fetch(`${API_BASE_URL}/expenses/${userId}/by-category`);
  if (!response.ok) {
    throw new Error('Failed to fetch expense categories');
  }
  return response.json();
}
