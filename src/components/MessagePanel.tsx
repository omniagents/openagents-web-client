"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { DirectMessage, BroadcastMessage } from "@/utils/openagentsConnector";
import { FiSend, FiRadio, FiUsers, FiMessageCircle, FiArrowRight } from "react-icons/fi";

interface MessagePanelProps {
  messages: (DirectMessage | BroadcastMessage)[];
  currentAgentId: string;
  selectedAgentId: string | null;
  messageContent: string;
  onMessageContentChange: (content: string) => void;
  onSendMessage: () => Promise<void>;
  isConnected: boolean;
}

// Helper function to generate a consistent color based on agent ID
const getAgentColor = (agentId: string): string => {
  // Simple hash function to generate a number from a string
  const hash = agentId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // List of Slack-like colors
  const colors = [
    'rgb(242, 199, 68)',   // yellow
    'rgb(242, 125, 68)',   // orange
    'rgb(242, 68, 68)',    // red
    'rgb(194, 68, 242)',   // purple
    'rgb(68, 138, 242)',   // blue
    'rgb(68, 242, 242)',   // cyan
    'rgb(68, 242, 125)',   // green
    'rgb(173, 242, 68)',   // lime
  ];
  
  // Use the hash to pick a color
  return colors[Math.abs(hash) % colors.length];
};

// Helper function to get initials from agent ID
const getAgentInitials = (agentId: string): string => {
  if (agentId.startsWith('web-client-')) {
    return 'WC';
  }
  
  // Get first two characters, or first character if only one
  return agentId.substring(0, 2).toUpperCase();
};

// Helper function to get a shortened agent ID for display
const getShortenedAgentId = (agentId: string): string => {
  if (agentId.length > 32) {
    return agentId.substring(0, 30) + '...';
  }
  return agentId;
};

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

  // Group messages by sender and time proximity (Slack-like)
  const groupedMessages = useMemo(() => {
    const groups: Array<{
      senderId: string;
      messages: (DirectMessage | BroadcastMessage)[];
      timestamp: number;
    }> = [];
    
    filteredMessages.forEach((message) => {
      // Check if this message should be part of the previous group
      // (same sender and within 5 minutes)
      const lastGroup = groups.length > 0 ? groups[groups.length - 1] : null;
      
      if (
        lastGroup && 
        lastGroup.senderId === message.sender_id && 
        message.timestamp - lastGroup.timestamp < 5 * 60 * 1000 // 5 minutes
      ) {
        // Add to existing group
        lastGroup.messages.push(message);
        // Update timestamp to the latest message
        lastGroup.timestamp = message.timestamp;
      } else {
        // Create a new group
        groups.push({
          senderId: message.sender_id,
          messages: [message],
          timestamp: message.timestamp
        });
      }
    });
    
    return groups;
  }, [filteredMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupedMessages]);

  // Handle key press for sending messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Get message direction badge
  const getMessageBadge = (message: DirectMessage | BroadcastMessage) => {
    if (message.message_type === "broadcast_message") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          <FiUsers className="mr-1" size={10} /> Broadcast
        </span>
      );
    } else {
      const directMessage = message as DirectMessage;
      if (directMessage.sender_id === currentAgentId) {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <FiMessageCircle className="mr-1" size={10} /> To: {getShortenedAgentId(directMessage.target_agent_id)}
          </span>
        );
      } else {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <FiMessageCircle className="mr-1" size={10} /> From: {getShortenedAgentId(directMessage.sender_id)}
          </span>
        );
      }
    }
  };

  // Get speaker role with direction
  const getSpeakerRole = (group: { senderId: string; messages: (DirectMessage | BroadcastMessage)[]; timestamp: number }) => {
    const isCurrentUser = group.senderId === currentAgentId;
    const firstMessage = group.messages[0];
    
    if (firstMessage.message_type === "broadcast_message") {
      return (
        <span className="flex items-center">
          {isCurrentUser ? "You" : getShortenedAgentId(group.senderId)} 
          <FiArrowRight className="mx-1" size={14} /> 
          <FiUsers className="mr-1" size={14} /> All (Broadcast)
        </span>
      );
    } else {
      const directMessage = firstMessage as DirectMessage;
      if (isCurrentUser) {
        return (
          <span className="flex items-center">
            You <FiArrowRight className="mx-1" size={14} /> {getShortenedAgentId(directMessage.target_agent_id)}
          </span>
        );
      } else {
        return (
          <span className="flex items-center">
            {getShortenedAgentId(group.senderId)} <FiArrowRight className="mx-1" size={14} /> You
          </span>
        );
      }
    }
  };

  // Check if we need to show a date divider
  const shouldShowDateDivider = (index: number, timestamp: number) => {
    if (index === 0) return true;
    
    const prevTimestamp = groupedMessages[index - 1].timestamp;
    const prevDate = new Date(prevTimestamp).setHours(0, 0, 0, 0);
    const currentDate = new Date(timestamp).setHours(0, 0, 0, 0);
    
    return prevDate !== currentDate;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-4">
        <div className="flex justify-between items-center">
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
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 h-full">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {isConnected
                  ? "No messages yet. Start a conversation!"
                  : "Connect to a network to start messaging"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedMessages.map((group, groupIndex) => {
                const isCurrentUser = group.senderId === currentAgentId;
                const agentColor = getAgentColor(group.senderId);
                const agentInitials = getAgentInitials(group.senderId);
                
                return (
                  <React.Fragment key={`${group.senderId}-${group.timestamp}`}>
                    {shouldShowDateDivider(groupIndex, group.timestamp) && (
                      <div className="flex items-center justify-center my-4">
                        <div className="bg-gray-200 dark:bg-gray-600 px-3 py-1 rounded-full text-xs text-gray-700 dark:text-gray-300">
                          {formatDate(group.timestamp)}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-3">
                      <div 
                        className="flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center text-white font-medium text-sm"
                        style={{ backgroundColor: agentColor }}
                      >
                        {agentInitials}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-bold text-gray-900 dark:text-gray-100">
                            {getSpeakerRole(group)}
                          </span>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            {formatTimestamp(group.timestamp)}
                          </span>
                        </div>
                        
                        <div className="mt-1 space-y-2">
                          {group.messages.map((message) => (
                            <div key={message.message_id} className="group">
                              <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                {message.content.text}
                              </div>
                              <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {getMessageBadge(message)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="p-6 pt-4">
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