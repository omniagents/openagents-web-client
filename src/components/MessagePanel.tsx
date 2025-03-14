"use client";

import React, { useRef, useEffect } from "react";
import { DirectMessage, BroadcastMessage } from "@/utils/openagentsConnector";
import { FiSend, FiRadio, FiUsers } from "react-icons/fi";

interface MessagePanelProps {
  messages: (DirectMessage | BroadcastMessage)[];
  currentAgentId: string;
  selectedAgentId: string | null;
  messageContent: string;
  onMessageContentChange: (content: string) => void;
  onSendMessage: () => Promise<void>;
  isConnected: boolean;
}

const MessagePanel: React.FC<MessagePanelProps> = ({
  messages,
  currentAgentId,
  selectedAgentId,
  messageContent,
  onMessageContentChange,
  onSendMessage,
  isConnected,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages based on the selected agent
  const filteredMessages = messages.filter((message) => {
    if (selectedAgentId === null) {
      // Show all messages when in "All Messages" view
      return true;
    }
    
    // Show direct messages between the current agent and the selected agent
    if (message.message_type === "direct_message") {
      const directMessage = message as DirectMessage;
      return (
        (directMessage.sender_id === currentAgentId && directMessage.target_agent_id === selectedAgentId) ||
        (directMessage.sender_id === selectedAgentId && directMessage.target_agent_id === currentAgentId)
      );
    }
    
    return false;
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages]);

  // Handle key press for sending messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get message direction text
  const getMessageDirection = (message: DirectMessage | BroadcastMessage) => {
    if (message.message_type === "broadcast_message") {
      return <span className="flex items-center"><FiUsers className="mr-1" /> All (Broadcast)</span>;
    } else {
      const directMessage = message as DirectMessage;
      if (directMessage.sender_id === currentAgentId) {
        return `You → ${directMessage.target_agent_id}`;
      } else {
        return `${directMessage.sender_id} → You`;
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {selectedAgentId === null
            ? "All Messages"
            : `Messaging with ${selectedAgentId}`}
        </h2>
        {selectedAgentId === null && isConnected && (
          <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex items-center">
            <FiRadio className="mr-1" /> Broadcasting Mode
          </div>
        )}
      </div>

      <div className="flex-grow overflow-y-auto mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {isConnected
                ? "No messages yet. Start a conversation!"
                : "Connect to a network to start messaging"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <div
                key={message.message_id}
                className={`flex ${
                  message.sender_id === currentAgentId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender_id === currentAgentId
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}
                >
                  <div className="text-sm font-medium mb-1 flex justify-between">
                    <span>{getMessageDirection(message)}</span>
                  </div>
                  <div>{message.content.text}</div>
                  <div className="text-xs mt-2 opacity-80 flex justify-between items-center">
                    <span>{formatTimestamp(message.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="mt-auto">
        <div className="flex">
          <textarea
            value={messageContent}
            onChange={(e) => onMessageContentChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              isConnected
                ? selectedAgentId === null
                  ? "Type a message to broadcast to all agents..."
                  : `Type a message to ${selectedAgentId}...`
                : "Connect to a network to start messaging"
            }
            disabled={!isConnected}
            className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            rows={3}
          />
          <button
            onClick={onSendMessage}
            disabled={!isConnected || !messageContent.trim()}
            className="px-4 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            title={selectedAgentId === null ? "Broadcast to all agents" : `Send to ${selectedAgentId}`}
          >
            {selectedAgentId === null ? <FiRadio size={20} /> : <FiSend size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagePanel; 