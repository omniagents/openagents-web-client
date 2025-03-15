'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FiUserPlus } from 'react-icons/fi';

interface AgentIdPromptProps {
  onSubmit: (agentId: string) => void;
}

const AgentIdPrompt: React.FC<AgentIdPromptProps> = ({ onSubmit }) => {
  const [agentId, setAgentId] = useState<string>('');
  
  // Load previously used agent ID from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAgentId = localStorage.getItem('openagents_agent_id');
      if (savedAgentId) {
        setAgentId(savedAgentId);
      }
    }
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (agentId.trim()) {
      onSubmit(agentId.trim());
    }
  };

  const generateRandomId = () => {
    const randomId = uuidv4().substring(0, 8);
    setAgentId(randomId);
  };

  const generateWebClientId = () => {
    const webClientId = `web-client-${uuidv4().substring(0, 8)}`;
    setAgentId(webClientId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Welcome to OpenAgents</h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Please enter an agent ID to identify yourself in the network, or generate a random one.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="agentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Agent ID
            </label>
            <div className="flex">
              <input
                type="text"
                id="agentId"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter an agent ID"
                required
              />
              <button
                type="button"
                onClick={generateRandomId}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-r-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Random
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={generateWebClientId}
              className="text-blue-500 dark:text-blue-400 hover:underline text-sm flex items-center"
            >
              Generate Web Client ID
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
            >
              <FiUserPlus className="mr-2" /> Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentIdPrompt; 