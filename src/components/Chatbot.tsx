import React, { useState } from 'react';

interface ChatbotProps {
  userId: string;
}

const Chatbot = ({ userId }: ChatbotProps) => {
  const [messages, setMessages] = useState<Array<{text: string, sender: 'user' | 'bot'}>>([]);
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { text: input, sender: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // TODO: Replace with actual API call to your chatbot service
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      
      const data = await response.json();
      
      // Add bot response
      setMessages(prev => [...prev, { text: data.response, sender: 'bot' }]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">AI Assistant</h1>
        
        {/* Messages Container */}
        <div className="h-[500px] overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
