import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FileText, PieChart, Image, Menu, X, Sun, Moon, MessageSquare } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar, { SidebarItem } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import Documents from './components/Documents';
import { Expenses } from './components/Expenses';
import { Images } from './components/Images';
import Login from './components/Login';
import Register from './components/Register';
import Chatbot from './components/Chatbot';
import Visualization from './components/Visualization';
import DataExtractorOCR from './components/DataExtractorOCR';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-lg"
    >
      {theme === 'dark' ? <Sun size={24} className="text-yellow-500" /> : <Moon size={24} className="text-gray-600" />}
    </button>
  );
};

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const { user, logout } = useAuth();

  // For demo purposes, using a hardcoded user ID
  const userId = "demo-user-123";

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  const sidebarItems: SidebarItem[] = [
    { path: '/', icon: <PieChart size={24} />, label: 'Dashboard' },
    { path: '/documents', icon: <FileText size={24} />, label: 'Documents' },
    { path: '/expenses', icon: <PieChart size={24} />, label: 'Expenses' },
    { path: '/images', icon: <Image size={24} />, label: 'Images' },
    { path: '/chatbot', icon: <MessageSquare size={24} />, label: 'AI Assistant' },
    { path: '/visualization', icon: <PieChart size={24} />, label: 'Analytics' },
    { path: '/extract', icon: <FileText size={24} />, label: 'Extract Data' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} className="dark:text-white" /> : <Menu size={24} className="dark:text-white" />}
      </button>

      <ThemeToggle />

      <div className={`
        fixed lg:static inset-y-0 left-0 transform 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition duration-200 ease-in-out z-30
      `}>
        <Sidebar items={sidebarItems} onLogout={logout} />
      </div>

      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<PrivateRoute><Dashboard userId={userId} /></PrivateRoute>} />
          <Route path="/documents" element={<PrivateRoute><Documents userId={userId} /></PrivateRoute>} />
          <Route path="/expenses" element={<PrivateRoute><Expenses userId={userId} /></PrivateRoute>} />
          <Route path="/images" element={<PrivateRoute><Images userId={userId} /></PrivateRoute>} />
          <Route path="/chatbot" element={<PrivateRoute><Chatbot userId={userId} /></PrivateRoute>} />
          <Route path="/visualization" element={<PrivateRoute><Visualization userId={userId} /></PrivateRoute>} />
          <Route path="/extract" element={<PrivateRoute><DataExtractorOCR userId={userId} /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export { AppContent, PrivateRoute, ThemeToggle };