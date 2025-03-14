"use client";

import React, { useState } from "react";
import { FiEdit, FiCheck, FiX } from "react-icons/fi";

interface ConnectionStatusProps {
  isConnected: boolean;
  agentId: string;
  onDisconnect: () => Promise<boolean>;
  onChangeAgentId: (id: string) => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  agentId,
  onDisconnect,
  onChangeAgentId,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newAgentId, setNewAgentId] = useState<string>(agentId);
  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await onDisconnect();
    } catch (error) {
      console.error("Error disconnecting:", error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSaveAgentId = () => {
    if (newAgentId.trim() && newAgentId !== agentId) {
      onChangeAgentId(newAgentId.trim());
    } else {
      setNewAgentId(agentId);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setNewAgentId(agentId);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="font-medium">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div className="flex items-center">
          <div className="mr-4">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Agent ID:</span>
            {isEditing ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={newAgentId}
                  onChange={(e) => setNewAgentId(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                  disabled={isConnected}
                />
                <button
                  onClick={handleSaveAgentId}
                  disabled={isConnected}
                  className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Save"
                >
                  <FiCheck className="text-green-500" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="ml-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Cancel"
                >
                  <FiX className="text-red-500" />
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <span className="font-mono">{agentId}</span>
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={isConnected}
                  className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isConnected ? "Cannot change Agent ID while connected" : "Edit Agent ID"}
                >
                  <FiEdit className="text-blue-500" />
                </button>
              </div>
            )}
          </div>

          {isConnected && (
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              {isDisconnecting ? "Disconnecting..." : "Disconnect"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus; 